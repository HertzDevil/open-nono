import NonoIdol from './nono-idol.js';
import * as NonoRectCoord from './nono-rect-coord.js';
import * as NonoUtils from './nono-utils.js';

export default class {
	constructor(map) {
		this.map_ = map;
		this.playerTile_ = map.entry();
		this.prevPlayerTile_ = null;

		this.idols_ = [];
		this.idolIndex_ = null;

		this.guardActive_ = false;
		this.skillTargets_ = null;
		this.openDir_ = null;
		this.openTiles_ = null;
	}

	get map() { return this.map_; }

	idols() {
		return this.idols_.slice();
	}

	setIdols(idols) {
		this.idols_ = idols.slice();
	}

	idolCount() {
		return this.idols_.length;
	}

	idol(idx) {
		return this.idols_[idx];
	}

	activeIdol() {
		return this.idols_[this.idolIndex_];
	}

	selectIdol(idx) {
		if (idx >= 0 && idx < this.idols_.length)
			this.idolIndex_ = idx;
	}

	canUseSkill() {
		return this.activeIdol().canUseSkill(this);
	}

	useSkill() {
		const skill = this.activeIdol().skill();
		this.skillTargets_ = skill.targetIdols(this);
		if (skill.kind === 'Open') {
			let dir = NonoRectCoord.IDENTITY;
			this.setOpenDir(NonoRectCoord.IDENTITY);
			this.openTiles_ = new Map();
			while (!this.openTiles_.has(dir)) {
				this.openTiles_.set(dir, this.calcOpenTiles(skill, dir));
				dir = NonoRectCoord.clockwise(dir);
			}
		}
	}

	usingSkill() {
		return this.skillTargets_ !== null;
	}

	skillCanTarget(idol) {
		return this.usingSkill() && this.skillTargets_.includes(idol);
	}

	// return array of invalidated tiles
	confirmSkill(target, params) {
		this.skillTargets_ = null;
		const idol = this.activeIdol();
		idol.charge(-idol.skill().cool);
		return idol.skill().trigger(this, target);
	}

	cancelSkill() {
		this.skillTargets_ = null;
		this.openTiles_ = null;
	}

	openDir() { return this.openDir_; }

	setOpenDir(dir) {
		this.openDir_ = dir;
	}

	openTiles() {
		if (this.openTiles_ === null || this.openDir_ === null)
			return new Set();
		return this.openTiles_.get(this.openDir_);
	}

	allOpenTiles() {
		const tiles = new Set();
		if (this.openTiles_ !== null)
			for (const v of this.openTiles_.values())
				for (const x of v.values())
					tiles.add(x);
		return tiles;
	}

	calcOpenTiles(skill, dir) {
		const tiles = new Set();
		if (skill.kind !== 'Open')
			return tiles;
		const v0 = this.map_.coordOf(this.cursor());
		skill.coords.forEach((c) => {
			const offset = NonoRectCoord.transform(c, dir);
			const t = this.map_.findTile(NonoRectCoord.add(v0, offset));
			if (t !== null)
				tiles.add(t);
		});
		return tiles;
	}

	openDirForTile(tile) {
		const coords = this.openTiles();
		if (coords.has(tile))
			return this.openDir_;
		for (const kv of this.openTiles_.entries())
			if (kv[1].has(tile))
				return kv[0];
		return null;
	}

	guardActive() { return this.guardActive_; }

	enableGuard(b) { this.guardActive_ = !!b; }

	addMines(count) {
		const entry = this.map_.entry();
		const safe = new Set(this.map_.neighbours(entry));
		safe.add(entry);
		safe.add(this.map_.goal());
		const tiles = Array.from(this.map_.tiles())
			.filter((t) => t.isBlank() && !safe.has(t));
		const used = NonoUtils.getRandomSubarray(tiles, count);
		used.forEach((t) => t.placeMine());
		return used;
	}

	addTomodachiBlocks(count) {
		const entry = this.map_.entry();
		const safe = new Set(this.map_.neighbours(entry));
		safe.add(entry);
		safe.add(this.map_.goal());
		const tiles = Array.from(this.map_.tiles())
			.filter((t) => t.isBlank() && !safe.has(t));
		const used = NonoUtils.getRandomSubarray(tiles, count);
		used.forEach((t) => t.setTomodachi(true));
		return used;
	}

	cursor() { return this.playerTile_; }

	move(tile) {
		this.playerTile_ = tile;
	}

	flagging() { return this.prevPlayerTile_ !== null; }

	toggleFlagging() {
		if (this.flagging()) {
			this.move(this.prevPlayerTile_);
			this.prevPlayerTile_ = null;
		}
		else
			this.prevPlayerTile_ = this.cursor();
	}
}
