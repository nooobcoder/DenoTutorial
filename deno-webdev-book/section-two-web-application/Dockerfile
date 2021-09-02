FROM denoland/deno:alpine

WORKDIR /app

COPY lock.json.*
COPY src/deps.ts ./src/deps.ts

RUN deno cache --lock=lock.json --unstable --no-check ./src/deps.ts

COPY . .

CMD ["deno", "run", "--allow-net", "--no-check" ,"--unstable", "--allow-env", "--allow-read", "--allow-write", "--allow-plugin", "src/index.ts" ]
