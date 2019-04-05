export const add = (lhs, rhs) => {
	return {x: lhs.x + rhs.x, y: lhs.y + rhs.y};
};

export const IDENTITY = [1, 0, 0, 1];
export const CCW = [0, -1, 1, 0];
export const INVERT = [-1, 0, 0, -1];
export const CW = [0, 1, -1, 0];

export const transform = (coord, xform) => {
	return {x: coord.x * xform[0] + coord.y * xform[2],
		y: coord.x * xform[1] + coord.y * xform[3]};
};

export const clockwise = (xform) => {
	if (xform === IDENTITY)
		return CW;
	if (xform === CW)
		return INVERT;
	if (xform === INVERT)
		return CCW;
	if (xform === CCW)
		return IDENTITY;
	return null;
};
