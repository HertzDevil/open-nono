export default class {
	constructor() {
		this.invalidated_cursor = [];
		this.invalidated_tile = [];
		this.invalidated_idol = [];
		this.invalidated_map = false;
		this.invalidated_flag_button = false;
		this.invalidated_skill_button = false;
		this.invalidated_next_button = false;
		this.invalidated_timer = false;
		this.invalidated_win_count = false;
	}

	invalidate(kind, obj) {
		const prop = 'invalidated_' + kind;
		if (this.hasOwnProperty(prop))
			if (obj === undefined)
				this[prop] = true;
			else
				this[prop].push(obj);
	}
}
