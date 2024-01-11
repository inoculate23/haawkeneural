let yoff = 0.0; // 2nd dimension of simplex noise
let yoff2 = 0.0; // 2nd dimension of simplex noise
let song, analyzer;
let mic, fft;
let xoff = 0.0; 
let xoff2 = 0.0; 
let Logo;
// preload image
function preload() {
  Logo = loadImage("logo_300.png");
 


}
function setup() {
 
  createCanvas(1920, 800);

  frameRate(60);
  background(0,0,0,0);
  smooth();
  
  
 // fill('rgba(200,2,80, .003');
  
}

function draw() {
  
  
 //fill('rgba200,200,200, 200.02)');
 


  
 
  fill('rgba(00,00,0, 0.02)');
  //stroke(random(255),random(255),random(255),0.094);
      colorMode(RGB);
  
     //try changing these colors
  //colorA = color(50,250,250,255.00);
 // colorB = color(5,250,240, 250.51);
   colorA = color(random(250),random(250),random(250),random(250.50));
  colorB = color(random(250),random(250),random(250), random(155.250));
  for (let i = 0;i<12;i++){  
    
    //converts i to a fraction between 0 and 1
    position = map(i,0,12,0,1);
    
    //that position determines where the LerpedColor
    //is between colorA and colorB
    LerpedColor = lerpColor(colorA,colorB,position);
    //fill();
   
    stroke(LerpedColor);
    strokeCap(ROUND);
 strokeWeight(1);
     push();
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
    let y = map(noise(xoff, yoff), 0.0020,0.175, 870, 780);


    // Set the vertex
   vertex(x, y);
    // Increment x dimension for noise
    xoff += 0.0350;
  }
  // increment y dimension for noise
  yoff += 0.0071;
    pop();
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
        Logo.pixels[index + 100,250] = mouseY; // red
        Logo.pixels[index + 100] = mouseX; // blue
      }
    }
  
    Logo.updatePixels();
    // display manpulated image
  image(Logo, 0, 0,120,120);


  }
  

}
