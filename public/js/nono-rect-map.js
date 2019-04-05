import NonoMap from './nono-map.js';
import * as NonoRectCoord from './nono-rect-coord.js';

export default class extends NonoMap {
	constructor(width, height) {
		super();
		this.width_ = width;
		this.height_ = height;

		const tiles = [];
		this.tilesAry_ = tiles;
		this.tileCoords_ = new Map();
		for (let y = 0; y < height; ++y) {
			const row = [];
			for (let x = 0; x < width; ++x) {
				const tile = this.createTile();
				this.tileCoords_.set(tile, [x, y]);
				row.push(tile);
			}
			tiles.push(row);
		}

		for (let y = 0; y < height; ++y)
			for (let x = 0; x < width - 1; ++x)
				this.connect(tiles[y][x], tiles[y][x + 1], true);
		for (let y = 0; y < height - 1; ++y)
			for (let x = 0; x < width; ++x)
				this.connect(tiles[y][x], tiles[y + 1][x], true);
		for (let y = 0; y < height - 1; ++y)
			for (let x = 0; x < width - 1; ++x) {
				this.connect(tiles[y][x + 1], tiles[y + 1][x], false);
				this.connect(tiles[y][x], tiles[y + 1][x + 1], false);
			}

		this.setEntry(tiles[Math.floor((height - 1) / 2)][0]);
		this.setGoal(tiles[Math.floor((height - 1) / 2)][width - 1]);
	}

	get width() { return this.width_; }
	get height() { return this.height_; }

	findTile(coord) {
		const row = this.tilesAry_[coord.y];
		if (row === undefined)
			return null;
		const tile = row[coord.x];
		return tile !== undefined ? tile : null;
	}

	coordOf(tile) {
		const c = this.tileCoords_.get(tile);
		return c ? {x: c[0], y: c[1]} : null;
	}

	offset(tile, d) {
		if (this.hasTile(tile))
			return this.findTile(NonoRectCoord.add(d, this.coordOf(tile)));
		return null;
	}
}
