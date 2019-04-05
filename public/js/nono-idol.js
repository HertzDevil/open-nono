import * as NonoSkills from './nono-skills.js';

export default class {
	constructor(id) {
		this.idolIndex_ = id;
		this.dom = null;
		this.setSkill('None');
		this.alive_ = true;
		this.cooldown_ = 0;
	}

	get idolIndex() { return this.idolIndex_; }

	skill() { return this.skill_; }

	setSkill(name) {
		this.skill_ = NonoSkills.find(name);
	}

	alive() { return this.alive_; }
	setAlive(b) { this.alive_ = !!b; }

	canUseSkill(game) {
		return this.alive() && this.skill().targetIdols(game).length > 0 &&
			this.cooldown() === 0;
	}

	cooldown() { return this.cooldown_; }

	charge(x) {
		const n = Math.max(0, Math.min(this.skill().cool, this.cooldown() - x));
		const d = this.cooldown_ !== n;
		this.cooldown_ = n;
		return d;
	}
}
