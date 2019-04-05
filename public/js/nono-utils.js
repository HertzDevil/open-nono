// https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
export const getRandomSubarray = (arr, size) => {
	const shuffled = arr.slice(0);
	let i = arr.length;
	const min = i - Math.min(size, arr.length);
	while (i-- > min) {
		const index = Math.floor((i + 1) * Math.random());
		const temp = shuffled[index];
		shuffled[index] = shuffled[i];
		shuffled[i] = temp;
	}
	return shuffled.slice(min);
};
