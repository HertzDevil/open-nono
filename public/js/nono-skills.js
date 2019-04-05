import * as NonoUtils from './nono-utils.js';

const NONO_SKILL_HANDLERS = {
	None: {
		targetIdols(game) { return []; },

		trigger(game, idol) { },

		description() { return 'Does nothing.'; }
	},

	Open: {
		targetIdols(game) { return [game.activeIdol()]; },

		trigger(game, idol) {
			const tiles = game.openTiles();
			const revealed = new Set();
			for (const pos of tiles)
				for (const t of game.map.clickTile(pos))
					revealed.add(t);
			for (const t of game.allOpenTiles())
				revealed.add(t);
			return Array.from(revealed.values());
		},

		description() {
			const rows = [];
			for (let y = this.extents.ymin; y <= this.extents.ymax; ++y) {
				const row = [];
				for (let x = this.extents.xmin; x <= this.extents.xmax; ++x) {
					const yy = y;
					const xx = x;
					const cat = x === 0 && y === 0 ? 2 :
						this.coords.some((c) => c.x === xx && c.y === yy) ? 1 : 0;
					row.push(`<td class="open${cat}"></td>`);
				}
				rows.push(`<tr>${row.join('')}</tr>`);
			}
			return 'Reveals the following tiles (pink) relative to the idol (yellow). Mines are revealed without killing the idol.' +
				`<table class="nono-skill-open-range">${rows.join('')}</table>`;
		}
	},

	Heal: {
		targetIdols(game) {
			return game.idols().filter((i) => !i.alive());
		},

		trigger(game, idol) {
			idol.setAlive(true);
		},

		description() { return 'Revives a dead idol.'; }
	},

	Guard: {
		targetIdols(game) {
			if (!game.guardActive())
				return [game.activeIdol()];
			return [];
		},

		trigger(game, idol) {
			game.enableGuard(true);
		},

		description() {
			return 'Allows the idol to step on a mine without dying, once. ' +
				'The skill loses its effect if the player switches to another idol.';
		}
	},

	Quick: {
		targetIdols(game) {
			return game.idols().filter((i) => i.cooldown() !== 0);
		},

		trigger(game, idol) {
			idol.charge(this.charge);
		},

		description() {
			return "Reduces the charge of the targeted idol's skill by " +
				this.charge.toString() + '.';
		}
	},

	Special: {
		targetIdols(game) { return [game.activeIdol()]; },

		trigger(game, idol) {
			const map = game.map;
			const unr = Array.from(map.tiles()).filter(
				(t) => !t.hasMine() && !t.flagged() && !t.isTomodachi());
			const tiles = NonoUtils.getRandomSubarray(unr, this.tomodachiCount);
			tiles.forEach((t) => t.setTomodachi(true));
			return tiles;
		},

		description() {
			return 'Randomly converts ' + this.tomodachiCount.toString() +
				' tiles into Tomodachi Blocks. At most one idol may equip this skill.';
		}
	},
};

const makeSkillPair = (name, kind, cool, params) => {
	const skill = Object.create(NONO_SKILL_HANDLERS[kind]);
	skill.kind = kind;
	skill.name = name;
	skill.cool = cool;

	if (kind === 'Quick')
		skill.charge = params;
	else if (kind === 'Special')
		skill.tomodachiCount = params;
	else if (kind === 'Open') {
		skill.coords = params;
		skill.extents = {xmin: 0, ymin: 0, xmax: 0, ymax: 0};
		for (const d of params) {
			skill.extents.xmin = Math.min(skill.extents.xmin, d.x);
			skill.extents.ymin = Math.min(skill.extents.ymin, d.y);
			skill.extents.xmax = Math.max(skill.extents.xmax, d.x);
			skill.extents.ymax = Math.max(skill.extents.ymax, d.y);
		}
	}

	return [name, skill];
};

const NONO_SKILLS = new Map([
	makeSkillPair('None', 'None', 0, null),

	makeSkillPair('Open A1', 'Open', 5, [{x: 1, y: 0}]),
	makeSkillPair('Open A2', 'Open', 5, [{x: 2, y: 0}]),
	makeSkillPair('Open A3', 'Open', 5, [{x: 1, y: -1}]),
	makeSkillPair('Open A4', 'Open', 5, [{x: 2, y: -2}]),

	makeSkillPair('Open B1', 'Open', 10, [{x: 1, y: 0}, {x: 2, y: 0}]),
	makeSkillPair('Open B2', 'Open', 10, [{x: 2, y: 0}, {x: 3, y: 0}]),
	makeSkillPair('Open B3', 'Open', 10, [{x: 1, y: -1}, {x: 1, y: 1}]),
	makeSkillPair('Open B4', 'Open', 10, [{x: 2, y: -1}, {x: 2, y: 1}]),
	makeSkillPair('Open B5', 'Open', 10, [{x: 1, y: -1}, {x: 2, y: -2}]),

	makeSkillPair('Open C1', 'Open', 14, [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}]),
	makeSkillPair('Open C2', 'Open', 14, [{x: 2, y: -1}, {x: 2, y: 0}, {x: 2, y: 1}]),
	makeSkillPair('Open C3', 'Open', 14, [{x: 1, y: -1}, {x: 2, y: 0}, {x: 1, y: 1}]),
	makeSkillPair('Open C4', 'Open', 14, [{x: 2, y: -1}, {x: 3, y: 0}, {x: 2, y: 1}]),
	makeSkillPair('Open C5', 'Open', 14, [{x: 2, y: -1}, {x: 1, y: 0}, {x: 2, y: 1}]),
	makeSkillPair('Open C6', 'Open', 14, [{x: 3, y: -1}, {x: 2, y: 0}, {x: 3, y: 1}]),

	makeSkillPair('Open D1', 'Open', 18, [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}]),
	makeSkillPair('Open D2', 'Open', 18, [{x: 1, y: -1}, {x: 2, y: -1}, {x: 1, y: 1}, {x: 2, y: 1}]),
	makeSkillPair('Open D3', 'Open', 18, [{x: 1, y: -1}, {x: 3, y: -1}, {x: 1, y: 1}, {x: 3, y: 1}]),
	makeSkillPair('Open D4', 'Open', 18, [{x: 2, y: -1}, {x: 4, y: -1}, {x: 2, y: 1}, {x: 4, y: 1}]),
	makeSkillPair('Open D5', 'Open', 18, [{x: 2, y: -1}, {x: 1, y: 0}, {x: 3, y: 0}, {x: 2, y: 1}]),
	makeSkillPair('Open D6', 'Open', 18, [{x: 2, y: -1}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 2, y: 1}]),

	makeSkillPair('Open E1', 'Open', 22, [{x: 2, y: -1}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 2, y: 1}]),
	makeSkillPair('Open E2', 'Open', 22, [{x: 3, y: -1}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 3, y: 1}]),
	makeSkillPair('Open E3', 'Open', 22, [{x: 2, y: -1}, {x: 3, y: -1}, {x: 3, y: 0}, {x: 2, y: 1}, {x: 3, y: 1}]),
	makeSkillPair('Open E4', 'Open', 22, [{x: 3, y: -2}, {x: 2, y: -1}, {x: 1, y: 0}, {x: 2, y: 1}, {x: 3, y: 2}]),

	makeSkillPair('Heal', 'Heal', 28, null),

	makeSkillPair('Guard', 'Guard', 40, null),

	makeSkillPair('Quick A', 'Quick', 4, 6),
	makeSkillPair('Quick B', 'Quick', 5, 7),
	makeSkillPair('Quick C', 'Quick', 6, 8),
	makeSkillPair('Quick D', 'Quick', 7, 9),

	makeSkillPair('Special', 'Special', 55, 2),
]);

const none = NONO_SKILLS.get('None');

export const SKILLS = Array.from(NONO_SKILLS.values());

export const find = (name) => {
	return NONO_SKILLS.get(name) || none;
};
