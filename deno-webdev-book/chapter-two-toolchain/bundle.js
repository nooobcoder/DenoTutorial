function concat(...buf) {
    let length = 0;
    for (const b of buf){
        length += b.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const b1 of buf){
        output.set(b1, index);
        index += b1.length;
    }
    return output;
}
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const MIN_READ = 32 * 1024;
const MAX_SIZE = 2 ** 32 - 2;
class Buffer {
    #buf;
    #off = 0;
    constructor(ab){
        this.#buf = ab === undefined ? new Uint8Array(0) : new Uint8Array(ab);
    }
    bytes(options = {
        copy: true
    }) {
        if (options.copy === false) return this.#buf.subarray(this.#off);
        return this.#buf.slice(this.#off);
    }
    empty() {
        return this.#buf.byteLength <= this.#off;
    }
    get length() {
        return this.#buf.byteLength - this.#off;
    }
    get capacity() {
        return this.#buf.buffer.byteLength;
    }
    truncate(n) {
        if (n === 0) {
            this.reset();
            return;
        }
        if (n < 0 || n > this.length) {
            throw Error("bytes.Buffer: truncation out of range");
        }
        this.#reslice(this.#off + n);
    }
    reset() {
        this.#reslice(0);
        this.#off = 0;
    }
     #tryGrowByReslice(n) {
        const l = this.#buf.byteLength;
        if (n <= this.capacity - l) {
            this.#reslice(l + n);
            return l;
        }
        return -1;
    }
     #reslice(len) {
        assert(len <= this.#buf.buffer.byteLength);
        this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
    }
    readSync(p) {
        if (this.empty()) {
            this.reset();
            if (p.byteLength === 0) {
                return 0;
            }
            return null;
        }
        const nread = copy(this.#buf.subarray(this.#off), p);
        this.#off += nread;
        return nread;
    }
    read(p) {
        const rr = this.readSync(p);
        return Promise.resolve(rr);
    }
    writeSync(p) {
        const m = this.#grow(p.byteLength);
        return copy(p, this.#buf, m);
    }
    write(p) {
        const n = this.writeSync(p);
        return Promise.resolve(n);
    }
     #grow(n) {
        const m = this.length;
        if (m === 0 && this.#off !== 0) {
            this.reset();
        }
        const i = this.#tryGrowByReslice(n);
        if (i >= 0) {
            return i;
        }
        const c = this.capacity;
        if (n <= Math.floor(c / 2) - m) {
            copy(this.#buf.subarray(this.#off), this.#buf);
        } else if (c + n > MAX_SIZE) {
            throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
            const buf = new Uint8Array(Math.min(2 * c + n, MAX_SIZE));
            copy(this.#buf.subarray(this.#off), buf);
            this.#buf = buf;
        }
        this.#off = 0;
        this.#reslice(Math.min(m + n, MAX_SIZE));
        return m;
    }
    grow(n) {
        if (n < 0) {
            throw Error("Buffer.grow: negative count");
        }
        const m = this.#grow(n);
        this.#reslice(m);
    }
    async readFrom(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = await r.read(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
    readFromSync(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = r.readSync(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
}
const ANSI_PATTERN = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
var DiffType;
(function(DiffType1) {
    DiffType1["removed"] = "removed";
    DiffType1["common"] = "common";
    DiffType1["added"] = "added";
})(DiffType || (DiffType = {
}));
class AssertionError extends Error {
    constructor(message1){
        super(message1);
        this.name = "AssertionError";
    }
}
const DEFAULT_BUFFER_SIZE = 32 * 1024;
async function writeAll(w, arr) {
    let nwritten = 0;
    while(nwritten < arr.length){
        nwritten += await w.write(arr.subarray(nwritten));
    }
}
function writeAllSync(w, arr) {
    let nwritten = 0;
    while(nwritten < arr.length){
        nwritten += w.writeSync(arr.subarray(nwritten));
    }
}
async function* iter(r, options) {
    const bufSize = options?.bufSize ?? DEFAULT_BUFFER_SIZE;
    const b = new Uint8Array(bufSize);
    while(true){
        const result = await r.read(b);
        if (result === null) {
            break;
        }
        yield b.subarray(0, result);
    }
}
async function copy1(src, dst, options) {
    let n = 0;
    const bufSize = options?.bufSize ?? DEFAULT_BUFFER_SIZE;
    const b = new Uint8Array(bufSize);
    let gotEOF = false;
    while(gotEOF === false){
        const result = await src.read(b);
        if (result === null) {
            gotEOF = true;
        } else {
            let nwritten = 0;
            while(nwritten < result){
                nwritten += await dst.write(b.subarray(nwritten, result));
            }
            n += nwritten;
        }
    }
    return n;
}
const DEFAULT_BUF_SIZE = 4096;
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    partial;
    name = "BufferFullError";
    constructor(partial1){
        super("Buffer full");
        this.partial = partial1;
    }
}
class PartialReadError extends Error {
    name = "PartialReadError";
    partial;
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    buf;
    rd;
    r = 0;
    w = 0;
    eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd1, size1 = 4096){
        if (size1 < 16) {
            size1 = MIN_BUF_SIZE;
        }
        this._reset(new Uint8Array(size1), rd1);
    }
    size() {
        return this.buf.byteLength;
    }
    buffered() {
        return this.w - this.r;
    }
    async _fill() {
        if (this.r > 0) {
            this.buf.copyWithin(0, this.r, this.w);
            this.w -= this.r;
            this.r = 0;
        }
        if (this.w >= this.buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i = 100; i > 0; i--){
            const rr = await this.rd.read(this.buf.subarray(this.w));
            if (rr === null) {
                this.eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    }
    reset(r) {
        this._reset(this.buf, r);
    }
    _reset(buf, rd) {
        this.buf = buf;
        this.rd = rd;
        this.eof = false;
    }
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.r === this.w) {
            if (p.byteLength >= this.buf.byteLength) {
                const rr1 = await this.rd.read(p);
                const nread = rr1 ?? 0;
                assert(nread >= 0, "negative read");
                return rr1;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copy(this.buf.subarray(this.r, this.w), p, 0);
        this.r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.r === this.w){
            if (this.eof) return null;
            await this._fill();
        }
        const c = this.buf[this.r];
        this.r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            if (err instanceof Deno.errors.BadResource) {
                throw err;
            }
            let { partial: partial2  } = err;
            assert(partial2 instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            if (!this.eof && partial2.byteLength > 0 && partial2[partial2.byteLength - 1] === CR) {
                assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial2 = partial2.subarray(0, partial2.byteLength - 1);
            }
            return {
                line: partial2,
                more: !this.eof
            };
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.buf.subarray(this.r, this.r + i + 1);
                this.r += i + 1;
                break;
            }
            if (this.eof) {
                if (this.r === this.w) {
                    return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
            }
            if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.w - this.r;
            try {
                await this._fill();
            } catch (err) {
                err.partial = slice;
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.w - this.r;
        while(avail < n && avail < this.buf.byteLength && !this.eof){
            try {
                await this._fill();
            } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
            }
            avail = this.w - this.r;
        }
        if (avail === 0 && this.eof) {
            return null;
        } else if (avail < n && this.eof) {
            return this.buf.subarray(this.r, this.r + avail);
        } else if (avail < n) {
            throw new BufferFullError(this.buf.subarray(this.r, this.w));
        }
        return this.buf.subarray(this.r, this.r + n);
    }
}
class AbstractBufBase {
    buf;
    usedBufferBytes = 0;
    err = null;
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer1, size2 = 4096){
        super();
        this.writer = writer1;
        if (size2 <= 0) {
            size2 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size2);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.writer.write(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer2, size3 = 4096){
        super();
        this.writer = writer2;
        if (size3 <= 0) {
            size3 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size3);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const CHAR_SPACE = " ".charCodeAt(0);
const CHAR_TAB = "\t".charCodeAt(0);
const CHAR_COLON = ":".charCodeAt(0);
const WHITESPACES = [
    CHAR_SPACE,
    CHAR_TAB
];
const decoder = new TextDecoder();
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
function str(buf) {
    return !buf ? "" : decoder.decode(buf);
}
class TextProtoReader {
    r;
    constructor(r1){
        this.r = r1;
    }
    async readLine() {
        const s = await this.readLineSlice();
        return s === null ? null : str(s);
    }
    async readMIMEHeader() {
        const m = new Headers();
        let line;
        let buf = await this.r.peek(1);
        if (buf === null) {
            return null;
        } else if (WHITESPACES.includes(buf[0])) {
            line = await this.readLineSlice();
        }
        buf = await this.r.peek(1);
        if (buf === null) {
            throw new Deno.errors.UnexpectedEof();
        } else if (WHITESPACES.includes(buf[0])) {
            throw new Deno.errors.InvalidData(`malformed MIME header initial line: ${str(line)}`);
        }
        while(true){
            const kv = await this.readLineSlice();
            if (kv === null) throw new Deno.errors.UnexpectedEof();
            if (kv.byteLength === 0) return m;
            let i = kv.indexOf(CHAR_COLON);
            if (i < 0) {
                throw new Deno.errors.InvalidData(`malformed MIME header line: ${str(kv)}`);
            }
            const key = str(kv.subarray(0, i));
            if (key == "") {
                continue;
            }
            i++;
            while(i < kv.byteLength && WHITESPACES.includes(kv[i])){
                i++;
            }
            const value = str(kv.subarray(i)).replace(invalidHeaderCharRegex, encodeURI);
            try {
                m.append(key, value);
            } catch  {
            }
        }
    }
    async readLineSlice() {
        let line = new Uint8Array(0);
        let r1 = null;
        do {
            r1 = await this.r.readLine();
            if (r1 !== null && this.skipSpace(r1.line) !== 0) {
                line = concat(line, r1.line);
            }
        }while (r1 !== null && r1.more)
        return r1 === null ? null : line;
    }
    skipSpace(l) {
        let n = 0;
        for (const val of l){
            if (!WHITESPACES.includes(val)) {
                n++;
            }
        }
        return n;
    }
}
var Status;
(function(Status1) {
    Status1[Status1["Continue"] = 100] = "Continue";
    Status1[Status1["SwitchingProtocols"] = 101] = "SwitchingProtocols";
    Status1[Status1["Processing"] = 102] = "Processing";
    Status1[Status1["EarlyHints"] = 103] = "EarlyHints";
    Status1[Status1["OK"] = 200] = "OK";
    Status1[Status1["Created"] = 201] = "Created";
    Status1[Status1["Accepted"] = 202] = "Accepted";
    Status1[Status1["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
    Status1[Status1["NoContent"] = 204] = "NoContent";
    Status1[Status1["ResetContent"] = 205] = "ResetContent";
    Status1[Status1["PartialContent"] = 206] = "PartialContent";
    Status1[Status1["MultiStatus"] = 207] = "MultiStatus";
    Status1[Status1["AlreadyReported"] = 208] = "AlreadyReported";
    Status1[Status1["IMUsed"] = 226] = "IMUsed";
    Status1[Status1["MultipleChoices"] = 300] = "MultipleChoices";
    Status1[Status1["MovedPermanently"] = 301] = "MovedPermanently";
    Status1[Status1["Found"] = 302] = "Found";
    Status1[Status1["SeeOther"] = 303] = "SeeOther";
    Status1[Status1["NotModified"] = 304] = "NotModified";
    Status1[Status1["UseProxy"] = 305] = "UseProxy";
    Status1[Status1["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    Status1[Status1["PermanentRedirect"] = 308] = "PermanentRedirect";
    Status1[Status1["BadRequest"] = 400] = "BadRequest";
    Status1[Status1["Unauthorized"] = 401] = "Unauthorized";
    Status1[Status1["PaymentRequired"] = 402] = "PaymentRequired";
    Status1[Status1["Forbidden"] = 403] = "Forbidden";
    Status1[Status1["NotFound"] = 404] = "NotFound";
    Status1[Status1["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    Status1[Status1["NotAcceptable"] = 406] = "NotAcceptable";
    Status1[Status1["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
    Status1[Status1["RequestTimeout"] = 408] = "RequestTimeout";
    Status1[Status1["Conflict"] = 409] = "Conflict";
    Status1[Status1["Gone"] = 410] = "Gone";
    Status1[Status1["LengthRequired"] = 411] = "LengthRequired";
    Status1[Status1["PreconditionFailed"] = 412] = "PreconditionFailed";
    Status1[Status1["RequestEntityTooLarge"] = 413] = "RequestEntityTooLarge";
    Status1[Status1["RequestURITooLong"] = 414] = "RequestURITooLong";
    Status1[Status1["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    Status1[Status1["RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
    Status1[Status1["ExpectationFailed"] = 417] = "ExpectationFailed";
    Status1[Status1["Teapot"] = 418] = "Teapot";
    Status1[Status1["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    Status1[Status1["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    Status1[Status1["Locked"] = 423] = "Locked";
    Status1[Status1["FailedDependency"] = 424] = "FailedDependency";
    Status1[Status1["TooEarly"] = 425] = "TooEarly";
    Status1[Status1["UpgradeRequired"] = 426] = "UpgradeRequired";
    Status1[Status1["PreconditionRequired"] = 428] = "PreconditionRequired";
    Status1[Status1["TooManyRequests"] = 429] = "TooManyRequests";
    Status1[Status1["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    Status1[Status1["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    Status1[Status1["InternalServerError"] = 500] = "InternalServerError";
    Status1[Status1["NotImplemented"] = 501] = "NotImplemented";
    Status1[Status1["BadGateway"] = 502] = "BadGateway";
    Status1[Status1["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    Status1[Status1["GatewayTimeout"] = 504] = "GatewayTimeout";
    Status1[Status1["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
    Status1[Status1["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    Status1[Status1["InsufficientStorage"] = 507] = "InsufficientStorage";
    Status1[Status1["LoopDetected"] = 508] = "LoopDetected";
    Status1[Status1["NotExtended"] = 510] = "NotExtended";
    Status1[Status1["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(Status || (Status = {
}));
const STATUS_TEXT = new Map([
    [
        Status.Continue,
        "Continue"
    ],
    [
        Status.SwitchingProtocols,
        "Switching Protocols"
    ],
    [
        Status.Processing,
        "Processing"
    ],
    [
        Status.EarlyHints,
        "Early Hints"
    ],
    [
        Status.OK,
        "OK"
    ],
    [
        Status.Created,
        "Created"
    ],
    [
        Status.Accepted,
        "Accepted"
    ],
    [
        Status.NonAuthoritativeInfo,
        "Non-Authoritative Information"
    ],
    [
        Status.NoContent,
        "No Content"
    ],
    [
        Status.ResetContent,
        "Reset Content"
    ],
    [
        Status.PartialContent,
        "Partial Content"
    ],
    [
        Status.MultiStatus,
        "Multi-Status"
    ],
    [
        Status.AlreadyReported,
        "Already Reported"
    ],
    [
        Status.IMUsed,
        "IM Used"
    ],
    [
        Status.MultipleChoices,
        "Multiple Choices"
    ],
    [
        Status.MovedPermanently,
        "Moved Permanently"
    ],
    [
        Status.Found,
        "Found"
    ],
    [
        Status.SeeOther,
        "See Other"
    ],
    [
        Status.NotModified,
        "Not Modified"
    ],
    [
        Status.UseProxy,
        "Use Proxy"
    ],
    [
        Status.TemporaryRedirect,
        "Temporary Redirect"
    ],
    [
        Status.PermanentRedirect,
        "Permanent Redirect"
    ],
    [
        Status.BadRequest,
        "Bad Request"
    ],
    [
        Status.Unauthorized,
        "Unauthorized"
    ],
    [
        Status.PaymentRequired,
        "Payment Required"
    ],
    [
        Status.Forbidden,
        "Forbidden"
    ],
    [
        Status.NotFound,
        "Not Found"
    ],
    [
        Status.MethodNotAllowed,
        "Method Not Allowed"
    ],
    [
        Status.NotAcceptable,
        "Not Acceptable"
    ],
    [
        Status.ProxyAuthRequired,
        "Proxy Authentication Required"
    ],
    [
        Status.RequestTimeout,
        "Request Timeout"
    ],
    [
        Status.Conflict,
        "Conflict"
    ],
    [
        Status.Gone,
        "Gone"
    ],
    [
        Status.LengthRequired,
        "Length Required"
    ],
    [
        Status.PreconditionFailed,
        "Precondition Failed"
    ],
    [
        Status.RequestEntityTooLarge,
        "Request Entity Too Large"
    ],
    [
        Status.RequestURITooLong,
        "Request URI Too Long"
    ],
    [
        Status.UnsupportedMediaType,
        "Unsupported Media Type"
    ],
    [
        Status.RequestedRangeNotSatisfiable,
        "Requested Range Not Satisfiable"
    ],
    [
        Status.ExpectationFailed,
        "Expectation Failed"
    ],
    [
        Status.Teapot,
        "I'm a teapot"
    ],
    [
        Status.MisdirectedRequest,
        "Misdirected Request"
    ],
    [
        Status.UnprocessableEntity,
        "Unprocessable Entity"
    ],
    [
        Status.Locked,
        "Locked"
    ],
    [
        Status.FailedDependency,
        "Failed Dependency"
    ],
    [
        Status.TooEarly,
        "Too Early"
    ],
    [
        Status.UpgradeRequired,
        "Upgrade Required"
    ],
    [
        Status.PreconditionRequired,
        "Precondition Required"
    ],
    [
        Status.TooManyRequests,
        "Too Many Requests"
    ],
    [
        Status.RequestHeaderFieldsTooLarge,
        "Request Header Fields Too Large"
    ],
    [
        Status.UnavailableForLegalReasons,
        "Unavailable For Legal Reasons"
    ],
    [
        Status.InternalServerError,
        "Internal Server Error"
    ],
    [
        Status.NotImplemented,
        "Not Implemented"
    ],
    [
        Status.BadGateway,
        "Bad Gateway"
    ],
    [
        Status.ServiceUnavailable,
        "Service Unavailable"
    ],
    [
        Status.GatewayTimeout,
        "Gateway Timeout"
    ],
    [
        Status.HTTPVersionNotSupported,
        "HTTP Version Not Supported"
    ],
    [
        Status.VariantAlsoNegotiates,
        "Variant Also Negotiates"
    ],
    [
        Status.InsufficientStorage,
        "Insufficient Storage"
    ],
    [
        Status.LoopDetected,
        "Loop Detected"
    ],
    [
        Status.NotExtended,
        "Not Extended"
    ],
    [
        Status.NetworkAuthenticationRequired,
        "Network Authentication Required"
    ], 
]);
function deferred() {
    let methods;
    let state = "pending";
    const promise = new Promise((resolve, reject)=>{
        methods = {
            async resolve (value) {
                await value;
                state = "fulfilled";
                resolve(value);
            },
            reject (reason) {
                state = "rejected";
                reject(reason);
            }
        };
    });
    Object.defineProperty(promise, "state", {
        get: ()=>state
    });
    return Object.assign(promise, methods);
}
class MuxAsyncIterator {
    iteratorCount = 0;
    yields = [];
    throws = [];
    signal = deferred();
    add(iterable) {
        ++this.iteratorCount;
        this.callIteratorNext(iterable[Symbol.asyncIterator]());
    }
    async callIteratorNext(iterator) {
        try {
            const { value , done  } = await iterator.next();
            if (done) {
                --this.iteratorCount;
            } else {
                this.yields.push({
                    iterator,
                    value
                });
            }
        } catch (e) {
            this.throws.push(e);
        }
        this.signal.resolve();
    }
    async *iterate() {
        while(this.iteratorCount > 0){
            await this.signal;
            for(let i = 0; i < this.yields.length; i++){
                const { iterator , value  } = this.yields[i];
                yield value;
                this.callIteratorNext(iterator);
            }
            if (this.throws.length) {
                for (const e of this.throws){
                    throw e;
                }
                this.throws.length = 0;
            }
            this.yields.length = 0;
            this.signal = deferred();
        }
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
const noop = ()=>{
};
class AsyncIterableClone {
    currentPromise;
    resolveCurrent = noop;
    consumed;
    consume = noop;
    constructor(){
        this.currentPromise = new Promise((resolve)=>{
            this.resolveCurrent = resolve;
        });
        this.consumed = new Promise((resolve)=>{
            this.consume = resolve;
        });
    }
    reset() {
        this.currentPromise = new Promise((resolve)=>{
            this.resolveCurrent = resolve;
        });
        this.consumed = new Promise((resolve)=>{
            this.consume = resolve;
        });
    }
    async next() {
        const res = await this.currentPromise;
        this.consume();
        this.reset();
        return res;
    }
    async push(res) {
        this.resolveCurrent(res);
        await this.consumed;
    }
    [Symbol.asyncIterator]() {
        return this;
    }
}
class DeadlineError extends Error {
    constructor(){
        super("Deadline");
        this.name = "DeadlineError";
    }
}
const encoder = new TextEncoder();
function emptyReader() {
    return {
        read (_) {
            return Promise.resolve(null);
        }
    };
}
function bodyReader(contentLength, r1) {
    let totalRead = 0;
    let finished = false;
    async function read(buf) {
        if (finished) return null;
        let result;
        const remaining = contentLength - totalRead;
        if (remaining >= buf.byteLength) {
            result = await r1.read(buf);
        } else {
            const readBuf = buf.subarray(0, remaining);
            result = await r1.read(readBuf);
        }
        if (result !== null) {
            totalRead += result;
        }
        finished = totalRead === contentLength;
        return result;
    }
    return {
        read
    };
}
function chunkedBodyReader(h, r1) {
    const tp = new TextProtoReader(r1);
    let finished = false;
    const chunks = [];
    async function read(buf) {
        if (finished) return null;
        const [chunk] = chunks;
        if (chunk) {
            const chunkRemaining = chunk.data.byteLength - chunk.offset;
            const readLength = Math.min(chunkRemaining, buf.byteLength);
            for(let i = 0; i < readLength; i++){
                buf[i] = chunk.data[chunk.offset + i];
            }
            chunk.offset += readLength;
            if (chunk.offset === chunk.data.byteLength) {
                chunks.shift();
                if (await tp.readLine() === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
            }
            return readLength;
        }
        const line = await tp.readLine();
        if (line === null) throw new Deno.errors.UnexpectedEof();
        const [chunkSizeString] = line.split(";");
        const chunkSize = parseInt(chunkSizeString, 16);
        if (Number.isNaN(chunkSize) || chunkSize < 0) {
            throw new Deno.errors.InvalidData("Invalid chunk size");
        }
        if (chunkSize > 0) {
            if (chunkSize > buf.byteLength) {
                let eof = await r1.readFull(buf);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                const restChunk = new Uint8Array(chunkSize - buf.byteLength);
                eof = await r1.readFull(restChunk);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                } else {
                    chunks.push({
                        offset: 0,
                        data: restChunk
                    });
                }
                return buf.byteLength;
            } else {
                const bufToFill = buf.subarray(0, chunkSize);
                const eof = await r1.readFull(bufToFill);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                if (await tp.readLine() === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                return chunkSize;
            }
        } else {
            assert(chunkSize === 0);
            if (await r1.readLine() === null) {
                throw new Deno.errors.UnexpectedEof();
            }
            await readTrailers(h, r1);
            finished = true;
            return null;
        }
    }
    return {
        read
    };
}
function isProhibidedForTrailer(key) {
    const s = new Set([
        "transfer-encoding",
        "content-length",
        "trailer"
    ]);
    return s.has(key.toLowerCase());
}
async function readTrailers(headers, r1) {
    const trailers = parseTrailer(headers.get("trailer"));
    if (trailers == null) return;
    const trailerNames = [
        ...trailers.keys()
    ];
    const tp = new TextProtoReader(r1);
    const result = await tp.readMIMEHeader();
    if (result == null) {
        throw new Deno.errors.InvalidData("Missing trailer header.");
    }
    const undeclared = [
        ...result.keys()
    ].filter((k)=>!trailerNames.includes(k)
    );
    if (undeclared.length > 0) {
        throw new Deno.errors.InvalidData(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    for (const [k, v] of result){
        headers.append(k, v);
    }
    const missingTrailers = trailerNames.filter((k1)=>!result.has(k1)
    );
    if (missingTrailers.length > 0) {
        throw new Deno.errors.InvalidData(`Missing trailers: ${Deno.inspect(missingTrailers)}.`);
    }
    headers.delete("trailer");
}
function parseTrailer(field) {
    if (field == null) {
        return undefined;
    }
    const trailerNames = field.split(",").map((v)=>v.trim().toLowerCase()
    );
    if (trailerNames.length === 0) {
        throw new Deno.errors.InvalidData("Empty trailer header.");
    }
    const prohibited = trailerNames.filter((k)=>isProhibidedForTrailer(k)
    );
    if (prohibited.length > 0) {
        throw new Deno.errors.InvalidData(`Prohibited trailer names: ${Deno.inspect(prohibited)}.`);
    }
    return new Headers(trailerNames.map((key)=>[
            key,
            ""
        ]
    ));
}
async function writeChunkedBody(w, r1) {
    for await (const chunk of iter(r1)){
        if (chunk.byteLength <= 0) continue;
        const start = encoder.encode(`${chunk.byteLength.toString(16)}\r\n`);
        const end = encoder.encode("\r\n");
        await w.write(start);
        await w.write(chunk);
        await w.write(end);
        await w.flush();
    }
    const endChunk = encoder.encode("0\r\n\r\n");
    await w.write(endChunk);
}
async function writeTrailers(w, headers, trailers) {
    const trailer = headers.get("trailer");
    if (trailer === null) {
        throw new TypeError("Missing trailer header.");
    }
    const transferEncoding = headers.get("transfer-encoding");
    if (transferEncoding === null || !transferEncoding.match(/^chunked/)) {
        throw new TypeError(`Trailers are only allowed for "transfer-encoding: chunked", got "transfer-encoding: ${transferEncoding}".`);
    }
    const writer3 = BufWriter.create(w);
    const trailerNames = trailer.split(",").map((s)=>s.trim().toLowerCase()
    );
    const prohibitedTrailers = trailerNames.filter((k)=>isProhibidedForTrailer(k)
    );
    if (prohibitedTrailers.length > 0) {
        throw new TypeError(`Prohibited trailer names: ${Deno.inspect(prohibitedTrailers)}.`);
    }
    const undeclared = [
        ...trailers.keys()
    ].filter((k)=>!trailerNames.includes(k)
    );
    if (undeclared.length > 0) {
        throw new TypeError(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    for (const [key, value] of trailers){
        await writer3.write(encoder.encode(`${key}: ${value}\r\n`));
    }
    await writer3.write(encoder.encode("\r\n"));
    await writer3.flush();
}
async function writeResponse(w, r1) {
    const protoMajor = 1;
    const protoMinor = 1;
    const statusCode = r1.status || 200;
    const statusText = (r1.statusText ?? STATUS_TEXT.get(statusCode)) ?? null;
    const writer3 = BufWriter.create(w);
    if (statusText === null) {
        throw new Deno.errors.InvalidData("Empty statusText (explicitely pass an empty string if this was intentional)");
    }
    if (!r1.body) {
        r1.body = new Uint8Array();
    }
    if (typeof r1.body === "string") {
        r1.body = encoder.encode(r1.body);
    }
    let out = `HTTP/${1}.${1} ${statusCode} ${statusText}\r\n`;
    const headers = r1.headers ?? new Headers();
    if (r1.body && !headers.get("content-length")) {
        if (r1.body instanceof Uint8Array) {
            out += `content-length: ${r1.body.byteLength}\r\n`;
        } else if (!headers.get("transfer-encoding")) {
            out += "transfer-encoding: chunked\r\n";
        }
    }
    for (const [key, value] of headers){
        out += `${key}: ${value}\r\n`;
    }
    out += `\r\n`;
    const header = encoder.encode(out);
    const n = await writer3.write(header);
    assert(n === header.byteLength);
    if (r1.body instanceof Uint8Array) {
        const n1 = await writer3.write(r1.body);
        assert(n1 === r1.body.byteLength);
    } else if (headers.has("content-length")) {
        const contentLength = headers.get("content-length");
        assert(contentLength != null);
        const bodyLength = parseInt(contentLength);
        const n1 = await copy1(r1.body, writer3);
        assert(n1 === bodyLength);
    } else {
        await writeChunkedBody(writer3, r1.body);
    }
    if (r1.trailers) {
        const t = await r1.trailers();
        await writeTrailers(writer3, headers, t);
    }
    await writer3.flush();
}
class ServerRequest {
    url;
    method;
    proto;
    protoMinor;
    protoMajor;
    headers;
    conn;
    r;
    w;
    #done = deferred();
    #contentLength = undefined;
    #body = undefined;
    #finalized = false;
    get done() {
        return this.#done.then((e)=>e
        );
    }
    get contentLength() {
        if (this.#contentLength === undefined) {
            const cl = this.headers.get("content-length");
            if (cl) {
                this.#contentLength = parseInt(cl);
                if (Number.isNaN(this.#contentLength)) {
                    this.#contentLength = null;
                }
            } else {
                this.#contentLength = null;
            }
        }
        return this.#contentLength;
    }
    get body() {
        if (!this.#body) {
            if (this.contentLength != null) {
                this.#body = bodyReader(this.contentLength, this.r);
            } else {
                const transferEncoding = this.headers.get("transfer-encoding");
                if (transferEncoding != null) {
                    const parts = transferEncoding.split(",").map((e)=>e.trim().toLowerCase()
                    );
                    assert(parts.includes("chunked"), 'transfer-encoding must include "chunked" if content-length is not set');
                    this.#body = chunkedBodyReader(this.headers, this.r);
                } else {
                    this.#body = emptyReader();
                }
            }
        }
        return this.#body;
    }
    async respond(r) {
        let err;
        try {
            await writeResponse(this.w, r);
        } catch (e) {
            try {
                this.conn.close();
            } catch  {
            }
            err = e;
        }
        this.#done.resolve(err);
        if (err) {
            throw err;
        }
    }
    async finalize() {
        if (this.#finalized) return;
        const body = this.body;
        const buf = new Uint8Array(1024);
        while(await body.read(buf) !== null){
        }
        this.#finalized = true;
    }
}
function parseHTTPVersion(vers) {
    switch(vers){
        case "HTTP/1.1":
            return [
                1,
                1
            ];
        case "HTTP/1.0":
            return [
                1,
                0
            ];
        default:
            {
                const Big = 1000000;
                if (!vers.startsWith("HTTP/")) {
                    break;
                }
                const dot = vers.indexOf(".");
                if (dot < 0) {
                    break;
                }
                const majorStr = vers.substring(vers.indexOf("/") + 1, dot);
                const major = Number(majorStr);
                if (!Number.isInteger(major) || major < 0 || major > 1000000) {
                    break;
                }
                const minorStr = vers.substring(dot + 1);
                const minor = Number(minorStr);
                if (!Number.isInteger(minor) || minor < 0 || minor > 1000000) {
                    break;
                }
                return [
                    major,
                    minor
                ];
            }
    }
    throw new Error(`malformed HTTP version ${vers}`);
}
async function readRequest(conn, bufr) {
    const tp = new TextProtoReader(bufr);
    const firstLine = await tp.readLine();
    if (firstLine === null) return null;
    const headers = await tp.readMIMEHeader();
    if (headers === null) throw new Deno.errors.UnexpectedEof();
    const req = new ServerRequest();
    req.conn = conn;
    req.r = bufr;
    [req.method, req.url, req.proto] = firstLine.split(" ", 3);
    [req.protoMajor, req.protoMinor] = parseHTTPVersion(req.proto);
    req.headers = headers;
    fixLength(req);
    return req;
}
class Server {
    listener;
    #closing = false;
    #connections = [];
    constructor(listener){
        this.listener = listener;
    }
    close() {
        this.#closing = true;
        this.listener.close();
        for (const conn of this.#connections){
            try {
                conn.close();
            } catch (e) {
                if (!(e instanceof Deno.errors.BadResource)) {
                    throw e;
                }
            }
        }
    }
    async *iterateHttpRequests(conn) {
        const reader = new BufReader(conn);
        const writer3 = new BufWriter(conn);
        while(!this.#closing){
            let request;
            try {
                request = await readRequest(conn, reader);
            } catch (error) {
                if (error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof) {
                    try {
                        await writeResponse(writer3, {
                            status: 400,
                            body: new TextEncoder().encode(`${error.message}\r\n\r\n`)
                        });
                    } catch  {
                    }
                }
                break;
            }
            if (request === null) {
                break;
            }
            request.w = writer3;
            yield request;
            const responseError = await request.done;
            if (responseError) {
                this.untrackConnection(request.conn);
                return;
            }
            try {
                await request.finalize();
            } catch  {
                break;
            }
        }
        this.untrackConnection(conn);
        try {
            conn.close();
        } catch  {
        }
    }
    trackConnection(conn) {
        this.#connections.push(conn);
    }
    untrackConnection(conn) {
        const index = this.#connections.indexOf(conn);
        if (index !== -1) {
            this.#connections.splice(index, 1);
        }
    }
    async *acceptConnAndIterateHttpRequests(mux) {
        if (this.#closing) return;
        let conn;
        try {
            conn = await this.listener.accept();
        } catch (error) {
            if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset || error instanceof Deno.errors.NotConnected) {
                return mux.add(this.acceptConnAndIterateHttpRequests(mux));
            }
            throw error;
        }
        this.trackConnection(conn);
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        yield* this.iterateHttpRequests(conn);
    }
    [Symbol.asyncIterator]() {
        const mux = new MuxAsyncIterator();
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        return mux.iterate();
    }
}
function _parseAddrFromStr(addr) {
    let url;
    try {
        const host = addr.startsWith(":") ? `0.0.0.0${addr}` : addr;
        url = new URL(`http://${host}`);
    } catch  {
        throw new TypeError("Invalid address.");
    }
    if (url.username || url.password || url.pathname != "/" || url.search || url.hash) {
        throw new TypeError("Invalid address.");
    }
    return {
        hostname: url.hostname,
        port: url.port === "" ? 80 : Number(url.port)
    };
}
function serve(addr) {
    if (typeof addr === "string") {
        addr = _parseAddrFromStr(addr);
    }
    const listener1 = Deno.listen(addr);
    return new Server(listener1);
}
function fixLength(req) {
    const contentLength = req.headers.get("Content-Length");
    if (contentLength) {
        const arrClen = contentLength.split(",");
        if (arrClen.length > 1) {
            const distinct = [
                ...new Set(arrClen.map((e)=>e.trim()
                ))
            ];
            if (distinct.length > 1) {
                throw Error("cannot contain multiple Content-Length headers");
            } else {
                req.headers.set("Content-Length", distinct[0]);
            }
        }
        const c = req.headers.get("Content-Length");
        if (req.method === "HEAD" && c && c !== "0") {
            throw Error("http: method cannot contain a Content-Length");
        }
        if (c && req.headers.has("transfer-encoding")) {
            throw new Error("http: Transfer-Encoding and Content-Length cannot be send together");
        }
    }
}
for await (const req of serve(":3000"))req.respond({
    body: "Hello Deno"
});
