import NonoTile from './nono-tile.js';
import * as NonoUtils from './nono-utils.js';

export default class {
	constructor() {
		this.tiles_ = new Map();
		this.moveTiles_ = new Map();
		this.entry_ = null;
		this.goal_ = null;
	}

	createTile() {
		const tile = new NonoTile();
		this.tiles_.set(tile, []);
		this.moveTiles_.set(tile, []);
		return tile;
	}

	hasTile(tile) {
		return this.tiles_.has(tile);
	}

	// bidirectional
	connect(t1, t2, movement) {
		const e1 = this.tiles_.get(t1);
		const e2 = this.tiles_.get(t2);
		if (e1 && e2) {
			if (!e1.includes(t2))
				e1.push(t2);
			if (!e2.includes(t1))
				e2.push(t1);
			if (movement) {
				const me1 = this.moveTiles_.get(t1);
				const me2 = this.moveTiles_.get(t2);
				if (!me1.includes(t2))
					me1.push(t2);
				if (!me2.includes(t1))
					me2.push(t1);
			}
		}
	}

	tiles() {
		return this.tiles_.keys();
	}

	tileCount() {
		return this.tiles_.size;
	}

	neighbours(tile) {
		const e1 = this.tiles_.get(tile);
		return e1 ? e1.slice() : [];
	}

	mineCount(tile) {
		return this.neighbours(tile)
			.filter((t) => t.hasMine())
			.length;
	}

	// click on a tile
	// returns array of revealed tiles
	clickTile(tile) {
		if (!this.hasTile(tile))
			return [];
		if (tile.hasMine()) {
			tile.reveal();
			return [tile];
		}

		let revealed = [];
		if (!tile.revealed()) {
			const added = new Set();
			let toAdd = new Set([tile]);

			while (toAdd.size > 0) {
				const frontier = new Set();
				toAdd.forEach((v) => added.add(v));
				toAdd.forEach((v) => {
					const neighbours = this.tiles_.get(v);
					if (!neighbours.some((t) => t.hasMine()))
						for (const n of neighbours)
							if (n.isBlank())
								frontier.add(n);
				});

				frontier.forEach((v) => {
					if (added.has(v))
						frontier.delete(v);
				});
				toAdd = frontier;
			}
			revealed = Array.from(added.values());
		}

		if (tile.isTomodachi()) {
			tile.setTomodachi(false);
			if (tile.revealed())
				revealed.push(tile);
			// stage 1 tomodachi blocks
			const more = NonoUtils.getRandomSubarray(Array.from(this.tiles())
				.filter((t) => t.hasMine() && !t.revealed() && !t.flagged()), 3);
			revealed.push(...more);
		}

		revealed.forEach((t) => t.reveal());
		return revealed;
	}

	movePath(src, dest) {
		if (!this.hasTile(src) || !this.hasTile(dest))
			return [];

		const added = new Set();
		const ancestors = new Map();
		let toAdd = new Set([src]);

		while (toAdd.size > 0) {
			const frontier = new Set();
			toAdd.forEach((v) => added.add(v));
			for (const v of toAdd)
				if (v.revealed()) {
					const neighbours = this.moveTiles_.get(v);
					for (const n of neighbours)
						if (!added.has(n)) {
							frontier.add(n);
							ancestors.set(n, v);
							if (n === dest) {
								const path = [];
								let x = dest;
								while (x !== undefined) {
									path.unshift(x);
									x = ancestors.get(x);
								}
								return path;
							}
						}
				}
			toAdd = frontier;
		}

		return [];
	}

	findTile(coord) {
		return null;
	}

	coordOf(tile) {
		return null;
	}

	offset(tile, d) {
		return this.hasTile(tile) ? tile : null;
	}

	entry() { return this.entry_; }

	setEntry(tile) {
		if (this.hasTile(tile))
			this.entry_ = tile;
	}

	goal() { return this.goal_; }

	setGoal(tile) {
		if (this.hasTile(tile))
			this.goal_ = tile;
	}
}
