//===================================================== canvas
import threejsMath from 'https://cdn.jsdelivr.net/npm/threejs-math@0.147.0/+esm'
  var renderer = new THREE.WebGLRenderer({ alpha: true, antialiase: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.id = "canvas";
	

document.body.appendChild(renderer.domElement);

 	//===================================================== scene
  var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xb421d9, 0.022 );



//===================================================== camera
  var camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 1.5;
  camera.position.y = 1.0;




//===================================================== lights
  var light = new THREE.DirectionalLight(0xed4c5c, 2);
  light.position.set(1, -3, 1).normalize();
  scene.add(light);
  var light = new THREE.DirectionalLight(0xefefff, 6 );
  light.position.set(-.5, 1,-0.5).normalize();
  scene.add(light);

  //===================================================== resize
  window.addEventListener("resize", function() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
 //===================================================== model
  var loader = new THREE.GLTFLoader();
  var mixer;
  var model;
  loader.load(
 "https://haawkeneuraltech.com/images/dragons/animated_dragon_three_motion_loops.glb"
, function(gltf) {

       gltf.scene.traverse( function( node ) {
          if ( node instanceof THREE.Mesh ) {             node.castShadow = true; 
            node.material.side = THREE.DoubleSide;
          }
        });

       
      model = gltf.scene;
      model.scale.set(2,2,2);
    model.position.set(0,-6.0,-8);
      scene.add(model);

      console.log(gltf.animations); //shows all animations imported into the dopesheet in blender

      mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();

      document.body.addEventListener("click", kill);
      function kill() {
        mixer.clipAction(gltf.animations[0]).stop();
      
        setTimeout(function() {
          mixer.clipAction(gltf.animations[0]).stop();
          mixer.clipAction(gltf.animations[0]).play();
        }, 1600);
      }

 
  });


//===================================================== animate
let time = performance.timeOrigin + performance.now();
var clock = new THREE.Clock();
function render() {
  requestAnimationFrame(render);
  var delta = clock.getDelta();
  if (mixer != null) mixer.update(delta);
  if (model) model.rotation.y += 0.00100;
   if (model) model.rotation.z += 0.000300;
if (model) model.position.x += 0.0001025;
  if (model) model.position.z += 0.002425;
   if (model) model.position.y += 0.002025;
  	if (model) model.position.x = Math.cos( time ) *.223;
if (model) model.position.x = Math.sin( time ) * .0045;
//	camera.lookAt( scene.position );
 //if (model) model.position.z += cos
    // if (model) model.position.y += 0.00390;
  renderer.render(scene, camera);
}

render();