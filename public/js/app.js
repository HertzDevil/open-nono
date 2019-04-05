import NonoIdol from './nono-idol.js';
import NonoInvalidator from './nono-invalidator.js';
import NonoController from './nono-controller.js';
import NonoView from './nono-view.js';
import * as NonoSkills from './nono-skills.js';

document.addEventListener('DOMContentLoaded', () => {
	document.addEventListener('selectstart', (e) => e.preventDefault());

	for (const button of document.getElementsByTagName('button')) {
		button.addEventListener('click', (e) => {
			e.target.blur();
			e.preventDefault();
		});
	}

	const idols = [
		new NonoIdol(0),
		new NonoIdol(1),
		new NonoIdol(2),
		new NonoIdol(3),
		new NonoIdol(4),
	];

	const skillLists = document.getElementsByClassName('nono-skill-select');
	for (const list of skillLists) {
		let group = 'None';
		let domGroup = null;
		for (const skill of NonoSkills.SKILLS) {
			if (skill.kind !== group) {
				group = skill.kind;
				domGroup = document.createElement('optgroup');
				domGroup.setAttribute('label', group);
				list.appendChild(domGroup);
			}
			const domOpt = document.createElement('option');
			domOpt.setAttribute('value', skill.name);
			domOpt.innerText = skill.name;
			(domGroup || list).appendChild(domOpt);
		}

		const NonoSkills2 = NonoSkills;
		list.addEventListener('change', (e) => {
			const parent = e.target.parentElement;
			const idx = parseInt(parent.getAttribute('nono-idol-index'));
			const skill = NonoSkills2.find(e.target.value);
			idols[idx].setSkill(e.target.value);
			parent.getElementsByClassName('nono-skill-cool')[0]
				.innerText = skill.cool.toString();
			parent.getElementsByClassName('nono-skill-desc')[0]
				.innerHTML = skill.description();
		});

		var e = document.createEvent('Event');
		e.initEvent('change', true, false);
		list.dispatchEvent(e);
	}

	document.getElementById('nono-button-go').addEventListener('click', (e) => {
		if (idols.filter((i) => i.skill().kind === 'Special').length > 1) {
			alert('At most one idol may equip Special skills.');
			return;
		}

		const widthField = document.getElementById('nono-config-width');
		if (!/^[1-9][0-9]*$/.test(widthField.value)) {
			alert('Width must be an integer.');
			return;
		}
		const WIDTH = Math.max(5, Math.min(99, parseInt(widthField)));

		const heightField = document.getElementById('nono-config-height');
		if (!/^[1-9][0-9]*$/.test(heightField.value)) {
			alert('Height must be an integer.');
			return;
		}
		const HEIGHT = Math.max(5, Math.min(30, parseInt(widthHeight)));

		const MINES = Math.floor(WIDTH * HEIGHT * 0.15);
		const TOMODACHI = Math.floor(WIDTH * HEIGHT * 0.02);

		const ctrl = new NonoController(WIDTH, HEIGHT);
		const view = new NonoView(ctrl, document);

		ctrl.game.setIdols(idols);

		const domMap = document.getElementById('nono-map');
		for (let y = 0; y < ctrl.map.height; ++y) {
			const row = document.createElement('tr');
			row.classList.add('nono-map-row');
			domMap.appendChild(row);

			for (let x = 0; x < ctrl.map.width; ++x) {
				const domTile = document.createElement('td');
				domTile.innerHTML = '<div class="nono-tile-text"></div>';
				domTile.classList.add('nono-map-tile');
				row.appendChild(domTile);

				const tile = ctrl.map.findTile({x: x, y: y});
				tile.dom = domTile;
			}
		}

		ctrl.map.entry().dom.innerHTML += '<div id="nono-entry-text">ENTRY</div>';
		ctrl.map.goal().dom.innerHTML += '<div id="nono-entry-text">GOAL</div>';

		const idolButtons = document.getElementById('nono-idol-button-container');
		for (let i = 0; i < idols.length; ++i) {
			const disp = document.createElement('div');
			disp.classList.add('nono-idol-name');
			disp.innerHTML = idols[i].skill().name + ` <kbd>${i + 1}</kbd>`;

			const cooldown = document.createElement('div');
			cooldown.classList.add('nono-idol-cooldown');
			cooldown.innerText = idols[i].cooldown().toString();

			const btn = document.createElement('button');
			btn.appendChild(disp);
			btn.appendChild(cooldown);
			btn.classList.add('nono-idol-button');
			btn.setAttribute('nono-idol-index', i);
			btn.addEventListener('click', view.makeListener((e, inv) => {
				const idx = parseInt(e.currentTarget.getAttribute('nono-idol-index'));
				ctrl.clickIdol(inv, idx);
			}));
			idolButtons.appendChild(btn);
			idols[i].dom = btn;
		}

		domMap.addEventListener('mouseover', view.makeListener((e, inv) => {
			const tile = view.tileFromDom(e.target);
			if (tile)
				ctrl.hoverTile(inv, tile);
		}));

		domMap.addEventListener('mousedown', view.makeListener((e, inv) => {
			if (e.button !== 0)
				return;
			const tile = view.tileFromDom(e.target);
			if (tile)
				if (ctrl.clickTile(inv, tile))
					view.checkWin(inv);
		}));

		document.addEventListener('keydown', view.makeListener((e, inv) => {
			const ch = e.key;
			if (e.repeat && !ctrl.game.flagging()) {
				if (/^Arrow.*$/.test(ch))
					e.preventDefault();
				return;
			}

			if (ch === 'f')
				ctrl.clickFlagButton(inv);
			else if (ch === 's')
				ctrl.clickSkillButton(inv);
			else if (ch === 'n') {
				if (ctrl.won())
					view.nextStage(inv, MINES, TOMODACHI);
			}
			else if (ch === ' ') {
				if (ctrl.game.flagging())
					ctrl.toggleTileFlag(inv, ctrl.game.cursor());
				else if (ctrl.game.usingSkill())
					ctrl.rotateOpenDir(inv);
			}
			else if (ch === '1')
				ctrl.clickIdol(inv, 0);
			else if (ch === '2')
				ctrl.clickIdol(inv, 1);
			else if (ch === '3')
				ctrl.clickIdol(inv, 2);
			else if (ch === '4')
				ctrl.clickIdol(inv, 3);
			else if (ch === '5')
				ctrl.clickIdol(inv, 4);
			else {
				const dir = (() => {
					if (ch === 'ArrowUp')
						return {x: 0, y: -1};
					if (ch === 'ArrowDown')
						return {x: 0, y: 1};
					if (ch === 'ArrowLeft')
						return {x: -1, y: 0};
					if (ch === 'ArrowRight')
						return {x: 1, y: 0};
					return null;
				})();
				if (dir !== null) {
					e.preventDefault();
					const tile = ctrl.map.offset(ctrl.game.cursor(), dir);
					if (tile)
						if (ctrl.game.flagging())
							ctrl.moveCursor(inv, tile);
						else if (ctrl.movePlayer(inv, tile))
							view.checkWin(inv);
				}
			}
		}), true);

		document.getElementById('nono-flag-button').addEventListener('click',
			view.makeListener((e, inv) => ctrl.clickFlagButton(inv)));
		document.getElementById('nono-skill-button').addEventListener('click',
			view.makeListener((e, inv) => ctrl.clickSkillButton(inv)));
		document.getElementById('nono-next-button').addEventListener('click', view.makeListener((e, inv) => {
			if (ctrl.won())
				view.nextStage(inv, MINES, TOMODACHI);
		}));

		document.getElementById('nono-select-screen').style.display = 'none';
		document.getElementById('nono-main-screen').style.display = 'flex';

		const inv = new NonoInvalidator();
		for (const idol of ctrl.game.idols())
			inv.invalidate('idol', idol.dom); // update skill names
		view.startTimer(inv);
		ctrl.startGame(inv, MINES, TOMODACHI);
		view.updateAll(inv);
	});
});
