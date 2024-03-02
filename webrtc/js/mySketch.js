// Using a texture with an alpha mask

let img;	// variable to hold the masked foreground image
let bg;		// variable to hold the background image

let fernX = 0;
let fernY = 0;
let fernZ = 0;

// preload the image files
function preload() {
  //img = loadImage('https://img1.wsimg.com/isteam/ip/50965b5b-baf0-4de5-81f7-1cc9ffa0792f/01_rebar_davyslogo-0001.png/:/rs=w:511,h:104,cg:true,m/cr=w:511,h:104/qt=q:95');
  bg = loadImage('https://thevendry.com/cdn-cgi/image/width=1200,quality=75,fit=contain,metadata=none,format=auto/https%3A%2F%2Fs3.us-east-1.amazonaws.com%2Fuploads.thevendry.co%2F36209%2F1698684649621_15042252_1868144673418516_1888662508963929361_o.jpg');  
}

function setup() {
	// create a canvas that matches the size of the masked image
  createCanvas(bg.width *1.2, bg.height, WEBGL);
}

function draw() {
  background(220);
  
	// draw the background image
  image(bg, -width, -height, width*2, height*2);
  
  let x = cos(frameCount/100) * 100;   
  

	
  camera(x, 0, 800, 0, 0, -10000, 0, 1, 0);		// IMPORTANT: set the z-coordinate of the look-at point to a large negative value to avoid unwanted spatial distortions

	// draw the masked foreground image
 // translate(fernX, fernY, fernZ);
//  noStroke();
 // texture(img);
 // plane(width/3, height/3)
}

// use the arrow keys to move the fern masked image up, down, right, left
function keyPressed() {
	if (keyCode === UP_ARROW)
		fernY -= 10;
	else if (keyCode === DOWN_ARROW)
		fernY += 10;
	else if (keyCode === RIGHT_ARROW)
		fernX += 10;
	else if (keyCode === LEFT_ARROW)
		fernX -= 10;
}