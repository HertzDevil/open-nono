export default class {
	constructor() {
		this.dom = null;
		this.reset();
	}

	hasMine() { return this.hasMine_; }
	placeMine() { this.hasMine_ = true; }

	revealed() { return this.revealed_; }
	reveal() { this.revealed_ = true; }

	flagged() { return this.flagged_; }
	toggleFlag() { this.flagged_ = !this.flagged_; }

	isTomodachi() { return this.tomodachi_; }
	setTomodachi(b) { this.tomodachi_ = !!b; }

	isBlank() {
		return !this.hasMine_ && !this.revealed_ &&
			!this.flagged_ && !this.isTomodachi_;
	}
	reset() {
		this.hasMine_ = false;
		this.revealed_ = false;
		this.flagged_ = false;
		this.tomodachi_ = false;
	}
}
