const getPromise = <T extends Map<number,string>(value: T): Promise<T> => {
	return new Promise((rslv, rej) => {
		setTimeout(() => {
			rslv(value);
		}, 1000);
	});
};

const value = await getPromise((1,"foo"));
console.log(value);
