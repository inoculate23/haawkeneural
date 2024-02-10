class Snippet {
	constructor(img, scl) {
		this.pos = createVector(0, 0);
		this.tpos = createVector(0, 0);
		this.ang = 0;
		this.tang = 0;
		this.img = img;
		this.scl = scl;
		this.t = 0;
	}
	move() {
		let q = ease['cubicIn'](this.t); //Cubic easing, thanks to P5.func library!
		this.pos.lerp(this.tpos, q);
		this.ang = lerp(this.ang, this.tang, q);
		this.t += 0.01;
		this.t = constrain(this.t, 0.0, 1.0);
	}
	show() {
		push();
		translate(this.pos);
		rotate(this.ang);
		scale(this.scl);
		image(this.img, 0, 0);
		pop();
	}
}