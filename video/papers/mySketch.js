// For the #WCCChallenge, theme: "cubism."
// Nobody will mistake this for a Picasso, but in researching this week's topic, 
// I came across the notion of "synthetic cubism," which involved
// (among other things), the use of printed materials on the canvas.
// Animations have cubic easing, thanks to the amazing P5.js func library!
// Lots to explore here: https://idmnyu.github.io/p5.js-func/

let papers = [];
let covers = [];
let labels = [];
let snippets = [];
let dim;
let zoom = 1;
let tzoom = 4;
let tpaper;
let showtop = true;
let ease = new p5.Ease();

function preload() {

	for (let i = 0; i < 6; i++) {
		papers.push(loadImage('titanic' + i + '.jpg'));
	}

	for (let i = 0; i < 11; i++) {
		labels.push(loadImage('label' + i + '.JPG'));
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	//pixelDensity(1);  // Add this if the animation is laggy
	dim = height / 6;
	makePapers();
	setTimeout(rearrangeSnippets, 1500);
}

function makePapers() {
	for (let i = 0; i < 3; i++) {
		let cover = papers[i].get(0, 0, papers[i].width, papers[i].height / 2)
		covers.push(cover);
	}
	covers.push(papers[3].get(0.22 * papers[3].width, 0.01 * papers[3].height, 0.55 * papers[3].width, papers[3].height / 1.5));
	covers.push(papers[4].get(0.15 * papers[4].width, 0.05 * papers[4].height, 0.7 * papers[4].width, papers[4].height / 2.25));
	for (let i = 5; i < 6; i++) {
		let cover = papers[i].get(0, 0, papers[i].width, papers[i].height / 2)
		covers.push(cover);
	}
	imageMode(CENTER);
	makeSnippets();
}

function makeSnippets() {
	for (let i = 0; i < 8 * covers.length; i++) {
		let c = covers[i % covers.length]
		let cs = c.get(0, 0, c.width, c.height * floor(random(2, 4)) / 3);
		let cg = createGraphics(cs.width, cs.height);
		cg.tint(205, 133, 63, random(155, 225));
		cg.image(cs, 0, 0);
		let scl = (2 * dim) / cg.width;
		snippets.push(new Snippet(cg, scl));
	}
	for (let i = 0; i < 8 * labels.length; i++) {
		let l = labels[i % labels.length];
		let cg = createGraphics(l.width, l.height);
		cg.tint(205, 133, 63, random(155, 225));
		cg.image(l, 0, 0);
		let scl = dim / max(cg.width, cg.height);
		snippets.push(new Snippet(cg, scl));
	}
	snippets.sort(function(a, b) {
		return 0.5 - Math.random()
	});
	let cs = papers[1].get(0, 0, papers[1].width, papers[1].height / 2);
	let cg = createGraphics(cs.width, cs.height);
	cg.tint('peru');
	cg.image(cs, 0, 0);
	let scl = 2 * dim / cg.width;
	tpaper = new Snippet(cg, scl);
}

function draw() {
	background(0);
	translate(width / 2, height / 2);
	if (frameCount > 120) tzoom = map(mouseY, 0, height, 0.5, 5)
	zoom = lerp(zoom, tzoom, 0.05);
	scale(zoom);
	for (let s of snippets) {
		s.show();
		s.move();
	}
	if (showtop) tpaper.show();
	tpaper.move();
}

function mousePressed() {
	if (frameCount < 120) return;
	rearrangeSnippets();
}

function rearrangeSnippets() {
	tpaper.t = 0;
	tpaper.tpos.y = 2 * height;
	tpaper.tang = -PI;
	if (tpaper.pos.y > 1.9 * height) showtop = false;
	for (let s of snippets) {
		s.t = 0;
		s.tpos = createVector(random(-0.75 * height, 0.75 * height), random(-0.4 * height, 0.4 * height));
		// s.tpos.x = 0.375 * height * randomGaussian();
		// s.tpos.y = 0.2 * height * randomGaussian();
		s.tang = floor(random(4)) * HALF_PI;
	}
}

function keyPressed() {
	if (keyCode == 32 && frameCount > 120) fullscreen(true);
	if (keyCode == 13) {
		snippets.sort(function(a, b) {
			return 0.5 - Math.random()
		});
	}
}

function windowResized() {
	if (fullscreen()) resizeCanvas(displayWidth, displayHeight);
	else resizeCanvas(windowWidth, windowHeight);
}