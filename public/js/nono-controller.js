import NonoRectMap from './nono-rect-map.js';
import * as NonoRectCoord from './nono-rect-coord.js';
import NonoGame from './nono-game.js';

export default class {
	constructor(width, height) {
		this.map_ = new NonoRectMap(width, height);
		this.game_ = new NonoGame(this.map_);
		this.running_ = false;
		this.won_ = false;
	}

	get map() { return this.map_; }
	get game() { return this.game_; }

	running() { return this.running_; }

	won() { return this.won_; }

	startGame(inv, mines, tomodachi) {
		this.running_ = true;
		this.won_ = false;
		for (const t of this.game_.addMines(mines))
			inv.invalidate('tile', t.dom);
		for (const t of this.game_.addTomodachiBlocks(tomodachi))
			inv.invalidate('tile', t.dom);
		for (const idol of this.game_.idols()) {
			idol.charge(idol.skill().cool);
			inv.invalidate('idol', idol.dom);
		}
		this.moveCursor(inv, this.map.entry());
		this.revealTile(inv, this.map.entry());
		this.clickIdol(inv, 0);
		inv.invalidate('next_button');
	}

	stopGame(inv, victory) {
		this.running_ = false;
		this.won_ = victory;
		inv.invalidate('next_button');
	}

	moveCursor(inv, tile) {
		this.game_.move(tile);
		inv.invalidate('cursor');
	}

	movePlayer(inv, tile) {
		if (!this.running())
			return false;
		if (!this.game_.usingSkill() && tile && !tile.flagged() && this.game_.activeIdol().alive()) {
			const src = this.game_.cursor();
			const path = this.map_.movePath(src, tile);
			if (path[0] === src && path[path.length - 1] === tile) {
				this.moveCursor(inv, tile);
				this.revealTile(inv, tile);
				return true;
			}
		}
		return false;
	}

	nextIdolIndex(idx) {
		const count = this.game_.idolCount();
		for (let i = 1; i < count; ++i) {
			const idx2 = (idx + i) % count;
			if (this.game_.idol(idx2).alive())
				return idx2;
		}
		return null;
	}

	revealTile(inv, tile) {
		const willCharge = !tile.revealed();

		if (!tile.revealed() && tile.hasMine()) {
			if (this.game_.guardActive())
				this.game_.enableGuard(false);
			else {
				const idol = this.game_.activeIdol();
				idol.setAlive(false);
				inv.invalidate('idol', idol.dom);

				const idx = this.nextIdolIndex(idol.idolIndex);
				if (idx !== null)
					this.selectIdol(inv, idx);
			}
		}

		for (const t of this.map_.clickTile(tile))
			inv.invalidate('tile', t.dom);

		if (willCharge) {
			for (const idol of this.game_.idols())
				if (idol.alive())
					if (idol.charge(1))
						inv.invalidate('idol', idol.dom);
			inv.invalidate('skill_button');
		}
	}

	toggleTileFlag(inv, tile) {
		if (!this.running())
			return;
		if (tile.revealed())
			return;
		tile.toggleFlag();
		inv.invalidate('tile', tile.dom);
	}

	rotateOpenDir(inv) {
		if (!this.running())
			return;
		for (const t of this.game_.openTiles())
			inv.invalidate('tile', t.dom);
		this.game_.setOpenDir(NonoRectCoord.clockwise(this.game_.openDir()));
		for (const t of this.game_.openTiles())
			inv.invalidate('tile', t.dom);
	}

	selectIdol(inv, idx) {
		if (!this.running())
			return;
		const idol = this.game_.idol(idx);
		if (!idol.alive())
			return;
		const prev = this.game_.activeIdol();
		if (idol !== prev)
			this.game_.enableGuard(false);
		this.game_.selectIdol(idx);
		if (prev !== undefined)
			inv.invalidate('idol', prev.dom);
		inv.invalidate('idol', idol.dom);
		inv.invalidate('skill_button');
	}

	hoverTile(inv, tile) {
		if (this.game_.flagging())
			this.moveCursor(inv, tile);
	}

	clickTile(inv, tile) {
		if (!this.running())
			return false;
		if (this.game_.flagging()) {
			this.toggleTileFlag(inv, tile);
			return false;
		}
		else if (this.game_.usingSkill()) {
			const dir = this.game_.openDirForTile(tile);
			if (dir !== null) {
				for (const t of this.game_.openTiles())
					inv.invalidate('tile', t.dom);
				this.game_.setOpenDir(dir);
				for (const t of this.game_.openTiles())
					inv.invalidate('tile', t.dom);
			}
			return false;
		}
		else
			return this.movePlayer(inv, tile);
	}

	clickIdol(inv, idx) {
		if (!this.running())
			return;
		if (this.game_.usingSkill()) {
			const tiles = this.game_.confirmSkill(this.game_.idol(idx), null);
			if (tiles !== undefined)
				for (const t of tiles)
					inv.invalidate('tile', t.dom);
			this.game_.cancelSkill();
			for (const idol of this.game_.idols())
				inv.invalidate('idol', idol.dom);
			inv.invalidate('map');
			inv.invalidate('flag_button');
			inv.invalidate('skill_button');
		}
		else
			this.selectIdol(inv, idx);
	}

	clickFlagButton(inv) {
		if (!this.running())
			return;
		this.game_.toggleFlagging();
		inv.invalidate('cursor');
		inv.invalidate('flag_button');
		if (!this.game_.flagging())
			this.moveCursor(inv, this.game_.cursor());
	}

	clickSkillButton(inv) {
		if (!this.game_.canUseSkill())
			return;
		if (this.game_.usingSkill()) {
			for (const t of this.game_.allOpenTiles().values())
				inv.invalidate('tile', t.dom);
			this.game_.cancelSkill();
		}
		else {
			this.game_.useSkill();
			for (const t of this.game_.allOpenTiles().values())
				inv.invalidate('tile', t.dom);
		}
		for (const idol of this.game_.idols())
			inv.invalidate('idol', idol.dom);
		inv.invalidate('map');
		inv.invalidate('flag_button');
		inv.invalidate('skill_button');
	}

	clickNextButton(inv) {
		inv.invalidate('next_button');
		for (const t of this.map_.tiles()) {
			t.reset();
			inv.invalidate('tile', t.dom);
		}
	}
}
