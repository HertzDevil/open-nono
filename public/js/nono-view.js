import NonoInvalidator from './nono-invalidator.js';

const enableClass = (b, dom, kls) => {
	if (b)
		dom.classList.add(kls);
	else
		dom.classList.remove(kls);
};

const enableDom = (b, dom) => {
	if (dom.disabled !== undefined)
		dom.disabled = !b;
	else if (b)
		dom.removeAttribute('disabled');
	else
		dom.setAttribute('disabled', 'disabled');
};

export default class {
	constructor(ctrl, root) {
		this.ctrl_ = ctrl;

		this.domCursor_ = root.createElement('DIV');
		this.domCursor_.id = 'nono-map-cursor';

		this.domMap_ = root.getElementById('nono-map');
		this.domMapOuter_ = root.getElementById('nono-map-outer');
		this.idolBtns_ = root.getElementsByClassName('nono-idol-button');
		this.flagBtn_ = root.getElementById('nono-flag-button');
		this.skillBtn_ = root.getElementById('nono-skill-button');
		this.nextBtn_ = root.getElementById('nono-next-button');

		this.posTxt_ = root.getElementById('nono-footer-pos');
		this.timerTxt_ = root.getElementById('nono-footer-timer');
		this.clearedTxt_ = root.getElementById('nono-footer-cleared');

		this.t0 = null;
		this.timerID_ = null;
	}

	startTimer(inv) {
		this.t0 = Date.now();
		this.timerID_ = setInterval(() => {
			this.updateTimer();
		}, 100);
		inv.invalidate('timer');
	}

	stopTimer(inv) {
		this.t0 = null;
		this.timerID_ = null;
//		inv.invalidate('timer');
	}

	nextStage(inv, mines, tomodachi) {
		this.ctrl_.clickNextButton(inv);
		this.ctrl_.startGame(inv, mines, tomodachi);
		this.startTimer(inv);
	}

	checkWin(inv) {
		const game = this.ctrl_.game;
		if (!game.activeIdol().alive()) {
			this.stopTimer(inv);
			this.ctrl_.stopGame(inv, false);
			inv.alertMsg = '🦀🦀🦀🦀🦀 All your idols are gone!!! 🦀🦀🦀🦀🦀';
		}
		else if (game.cursor() === this.ctrl_.map.goal() && !game.flagging()) {
			this.stopTimer(inv);
			this.ctrl_.stopGame(inv, true);
			inv.alertMsg = 'You win!';
			inv.invalidate('win_count');
		}
	}

	tileFromDom(dom) {
		while (dom !== null && dom.tagName !== 'TD')
			dom = dom.parentElement;
		if (dom === null)
			return null;
		const x = dom.cellIndex;
		const y = dom.parentElement.rowIndex;
		return this.ctrl_.map.findTile({x: x, y: y});
	}

	makeListener(callback) {
		const that = this;
		return (e) => {
			const inv = new NonoInvalidator();
			callback(e, inv);
			that.updateAll(inv);
		};
	}

	updateAll(inv) {
		if (inv.invalidated_map)
			this.updateMap();
		if (inv.invalidated_cursor) {
			this.updateCursor();
			this.updateCursorPos();
		}
		for (const dom of inv.invalidated_tile)
			this.updateTile(dom);
		for (const dom of inv.invalidated_idol)
			this.updateIdol(dom);
		if (inv.invalidated_flag_button)
			this.updateFlagButton();
		if (inv.invalidated_skill_button)
			this.updateSkillButton();
		if (inv.invalidated_next_button)
			this.updateNextButton();
		if (inv.invalidated_timer)
			this.updateTimer();
		if (inv.invalidated_win_count)
			this.updateWinCount();

		if (inv.alertMsg !== undefined)
			alert(inv.alertMsg);
	}

	updateMap() {
//		enableDom(!this.ctrl_.game.usingSkill(), this.domMapOuter_);
	}

	updateCursor() {
		enableClass(this.ctrl_.game.flagging(), this.domCursor_, 'flagging');
	}

	updateCursorPos() {
		const tile = this.ctrl_.game.cursor();
		const p = this.domCursor_.parentElement;
		if (p !== null) {
			p.classList.remove('nono-map-cursor-outer');
			p.removeChild(this.domCursor_);
		}
		tile.dom.appendChild(this.domCursor_);
		tile.dom.classList.add('nono-map-cursor-outer');

		if (!this.ctrl_.game.flagging()) {
			const SLACK = 4;
			const map = this.ctrl_.map;
			const w = map.width;
			const h = map.height;
			const coord = map.coordOf(tile);

			if (w > SLACK * 2 + 1) {
				const scrollable = this.domMapOuter_.scrollLeftMax;
				const spos = Math.max(0, Math.min(w - 1, coord.x - SLACK));
				const scount = w - SLACK * 2 - 1;
				this.domMapOuter_.scrollLeft = scrollable * spos / scount;
			}

			if (h > SLACK * 2 + 1) {
				const scrollable = this.domMapOuter_.scrollTopMax;
				const spos = Math.max(0, Math.min(h - 1, coord.y - SLACK));
				const scount = h - SLACK * 2 - 1;
				this.domMapOuter_.scrollTop = scrollable * spos / scount;
			}
		}

		const c = this.ctrl_.map.coordOf(tile);
		this.posTxt_.innerText = `(${c.x + 1}, ${c.y + 1})`;
	}

	updateTile(dom) {
		const x = dom.cellIndex;
		const y = dom.parentElement.rowIndex;
		const tile = this.ctrl_.map.findTile({x: x, y: y});

		enableClass(tile.revealed(), dom, 'nono-tile-revealed');
		enableClass(tile.isTomodachi(), dom, 'nono-tile-tomodachi');
		enableClass(tile.revealed() && tile.hasMine(), dom, 'nono-tile-mine');
		if (this.ctrl_.game.usingSkill()) {
			const dir = this.ctrl_.game.openDirForTile(tile);
			const willOpen = dir === this.ctrl_.game.openDir();
			enableClass(willOpen, dom, 'nono-tile-open1');
			enableClass(!willOpen && dir !== null, dom, 'nono-tile-open2');
		}
		else
			dom.classList.remove('nono-tile-open1', 'nono-tile-open2');

		const txtDom = dom.getElementsByClassName('nono-tile-text')[0];
		enableClass(tile.flagged(), txtDom, 'nono-tile-numberF');
		if (tile.flagged())
			txtDom.innerText = 'F';
		else if (tile.revealed() && !tile.hasMine()) {
			const mineCount = this.ctrl_.map.mineCount(tile);
			if (mineCount > 0) {
				const txt = mineCount.toString();
				txtDom.classList.add('nono-tile-number' + txt);
				txtDom.innerText = txt;
			}
			else
				txtDom.innerText = '';
		}
		else
			txtDom.innerText = '';
	}

	updateIdol(dom) {
		const idx = parseInt(dom.getAttribute('nono-idol-index'));
		const idol = this.ctrl_.game.idol(idx);
		const s = this.ctrl_.game.usingSkill();

		enableDom(s ? this.ctrl_.game.skillCanTarget(idol) : idol.alive(), dom);
		enableClass(!s && idol === this.ctrl_.game.activeIdol(), dom, 'nono-idol-selected');
		dom.getElementsByClassName('nono-idol-name')[0]
			.innerHTML = idol.skill().name + ` <kbd>${idx + 1}</kbd>`;
		dom.getElementsByClassName('nono-idol-cooldown')[0]
			.innerText = idol.cooldown().toString();
	}

	updateFlagButton() {
		enableDom(!this.ctrl_.game.usingSkill(), this.flagBtn_);
		enableClass(this.ctrl_.game.flagging(), this.flagBtn_, 'flagging');
	}

	updateSkillButton() {
		enableDom(this.ctrl_.game.canUseSkill(), this.skillBtn_);
		enableClass(this.ctrl_.game.usingSkill(), this.skillBtn_, 'nono-idol-selected');
	}

	updateNextButton() {
		enableDom(!this.ctrl_.running() && this.ctrl_.won(), this.nextBtn_);
	}

	updateTimer() {
		if (this.t0 !== null) {
			const secs = Math.floor((Date.now() - this.t0) / 1000);
			const m = Math.floor(secs / 60);
			const s = secs % 60;
			this.timerTxt_.innerText = `${m <= 9 ? '0' : ''}${m}:${s <= 9 ? '0' : ''}${s}`;
		}
	}

	updateWinCount() {
		this.clearedTxt_.innerText = (parseInt(this.clearedTxt_.innerText) + 1).toString();
	}
}
