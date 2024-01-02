// create a variable for the image
let Logo;
// preload image
function preload() {
  Logo = loadImage("logo_lg.png");
}

function setup() {
  // create canvas the same size as the image
  createCanvas(500,500);
}

function draw() {
  
  // show the 'initial image
  Logo.loadPixels();
  // go through each row
  for (let y = 0; y < height; y++) {
    // and each column
    for(let x = 0; x < width; x++) {
      // go through all pixels of image, H, S, L, and A
      let index = (x + y * width) * 4;
      // play with rgb values
        Logo.pixels[index] = mouseY; // red
        Logo.pixels[index + 2] = mouseX; // blue
      }
    }
  
    Logo.updatePixels();
    // display manpulated image
  image(Logo, 0, 0);
}