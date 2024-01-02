let yoff = 0.0; // 2nd dimension of simplex noise
let song, analyzer;
let mic, fft;

let Logo;
// preload image
function preload() {
  Logo = loadImage("logo_300.png");
 
  font = loadFont('JosefinSans-Regular.ttf');

}
function setup() {
 
  createCanvas(1920, 1080);
  frameRate(60);
  background(0,0,0)
  
  
 // fill('rgba(200,2,80, .003');
  
}

function draw() {
    
loop();
 fill('rgba200,200,200, 200.02)');
 


  
 
  fill('rgba(00,00,0, .02)');
  stroke(random(255),random(10),random(208),155.94);
 strokeWeight(1.7)
  beginShape();
// Option #1: 4D Noise
  let xoff = 0.0020; 
  
  
   //let xoff = yoff; 
   // Option #2: 1D Noise

  // create a new Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Patch the input to an volume analyzer
  analyzer.setInput(song);
  
 
  
    // Get the average (root mean square) amplitude
  let rms = analyzer.getLevel();

  



  // Iterate over horizontal pixels
  for (let x = 0; x <= width; x += 10) {
    // Calculate a y value according to noise, map to

 
    // Option #1: 2D Noise
    let y = map(noise(xoff, yoff), 0.0020,0.085, 900, 790);


    // Set the vertex
    vertex(x, y);
    // Increment x dimension for noise
    xoff += 0.035;
  }
  // increment y dimension for noise
  yoff += 0.011;
  vertex(width, height);
  vertex(2, height);
  endShape(CLOSE);
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
