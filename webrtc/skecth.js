let shiny;

function setup() {
  createCanvas(550, 550, WEBGL);
  frameRate(60);
  smooth();
   img = loadImage('haawk.png');
   img2 = loadImage('logoH.webp');
  
 
}
function draw() {
background(0)



  strokeWeight(1.2);
  specularMaterial(250, 230, 250);
   

  
  let locX = mouseX - height / 2;
  let locY = mouseY - width / 2;


  pointLight(255, 133, 10, locX, locY, 200);
  rotateX(frameCount * 0.005);
  rotateY(frameCount * 0.002);
    push();
  rotateZ(frameCount * 0.005);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.003);

  push()
  // Set the material
  



   texture(img2);
   pointLight(225, 253, 250, locX, locY, 240);
    box(100, 100);
  shiny;
  smooth()



  directionalLight(255, 0, 200, 40.25, 70.25, 0);
   specularMaterial(250, 240, 250, locX, locY, 210);
  texture(img, .6);

       
       
  
      box(350, 305, 350);  
 push();
  strokeWeight(9);
  normalMaterial();

  // polarPolygon( number, angle, radius, [distance] )

  // polarPentagons( number, radius, distance, [callback] )

  


}