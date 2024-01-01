import define1 from "./e93997d5089d7165@2303.js";
import define2 from "./120635c74080ae24@546.js";

function _1(htl){return(
htl.html`<img src="https://github.com/inoculate23/media/blob/main/assets/og-image.png?raw=true" />`
)}

function _2(md){return(
md`# Mobility - An SVG playground



This notebook was forked from 'https://observablehq.com/d/4cb39f2fa7cd0115', which is a great resource for uderstanding how to generate these SVG blobs. I modified the code to include a second set of circles, more color blending methods and I may try to build in ML recognition to see if I can create a "pong" like game.'`
)}

function _play(checkbox){return(
checkbox({
  title: "Animation",
  description: "Moving the circles looks fun, but more quickly drains a computer battery. Deactivate animation to save your battery.",
  options: [{ value: "play", label: "Do animation" }],
  value: "play"
})
)}

function _gradientEffect(radio){return(
radio({
  title: "Gradient effect",
  description: "Select which gradient effect to apply to the circles' fill",
  options: [
    { label: "None / Solid fill", value: "none" },
    { label: "Rainbow background", value: "rainbow" },
    { label: "Sphere / 3D effect", value: "radial" },
    { label: "Abrupt gradient", value: "abrupt" },
    { label: "Animated gradient", value: "animated" },
  ],
  value: "rainbow"
})
)}

function _filterEffect(radio){return(
radio({
  title: "Filter effect",
  description: "Select which filter effect to apply to the circles",
  options: [
    { label: "None", value: "none" },
    { label: "Glow effect", value: "glow" },
    { label: "Gooey effect", value: "gooey" }
  ],
  value: "glow"
})
)}

function _colorBlendEffect(select){return(
select({
  title: "Color blend mode",
  options: [
    "normal",
    "multiply",
    "add",
    "Subtract",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity"
  ],
  value: "screen"
})
)}

function* _svg(d3,DOM,hexRadius,clipToHexagon,setupPredefinedGradientsAndFilters,circles,applyFilters,applyColorBlends,invalidation,strokeHexagon,applyGradients,stopCircles,updateCircleLocations,play,moveCircles)
{
  //Set-up the SVG
  const svg = d3.select(DOM.svg(4 * hexRadius, 2 * hexRadius + 20));
  //Create a group within the SVG and move its center

  const image = document.querySelector("logo");
  const g = svg
    .append("g")
    .attr("transform", `translate(${hexRadius + 308},${hexRadius + 10})`);

  ////////////////////////////////////////////////////////////
  /////////////// Create gradients and filters ///////////////
  ////////////////////////////////////////////////////////////

  const defs = g.append("defs");

  //Create a hexagonal clipping path
  //To make sure no part of the inner circle is ever visible outside of the hexagon
  clipToHexagon(defs);

  //Sets up the example gradients and filters
  //More as backup for you to cheat and peek at the code
  //Try to create them yourself first!
  setupPredefinedGradientsAndFilters(defs);

  ///////////////////////////////////////////////////////////
  ////// Add your code changes here primarily | Part 1 //////
  ///////////////////////////////////////////////////////////

  //Note: you can apply both a filter AND a gradient at the same time!
  //But you can only have one gradient (and similarily, one filter) active at the same time

  //Note 2: Check out https://gka.github.io/palettes/ if you want to create your own gradient palettes

  //Create your gradients or filters...

  ///////////////////////////////////////////////////////////
  ////////////////////// END | Part 1 //////////////////////
  ///////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////
  /////////////////////// Draw circles ///////////////////////
  ////////////////////////////////////////////////////////////

  //Create a group to place all the circles in

  const circleGroup = g
    .append("g")
    .attr("class", "circle-group")
    .style("filter", "url(#gooey)") //Set the filter on the container

    .attr("clip-path", "url(#clip") //clip it to a hexagonal shape
    .style("clip-path", "url(#clip)"); //make it work in safari

  //Add the circles and set their sizes
  const circlesSVG = circleGroup
    .selectAll(".circle")
    .data(circles)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("cx", (d) => d.newX)
    .attr("cy", (d) => d.newY)
    .attr("r", (d) => d.r);

  //Ignore this, this tries to hide what you should recreate yourself below ;)
  //applyGradients(circlesSVG);
  applyFilters(circleGroup, circlesSVG);
  applyColorBlends(circleGroup, circlesSVG);
  const timer2 = d3.timer(() =>
    circlesSVG.attr("fill", d3.interpolateRainbow(Date.now() / 10000))
  );

  invalidation.then(() => timer2.stop());
  //Place a stroked hexagon on top
  strokeHexagon(g);

  const circleGroup2 = g
    .append("g")
    .attr("class", "circle-group2")
    .attr("clip-path", "url(#clip") //clip it to a hexagonal shape
    .style("clip-path", "url(#clip)"); //make it work in safari

  //Add the circles and set their sizes
  const circlesSVG2 = circleGroup2
    .selectAll(".circle")
    .data(circles)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("cx", (d) => d.newX)
    .attr("cy", (d) => d.newY)
    .attr("r", (d) => d.r);

  //Ignore this, this tries to hide what you should recreate yourself below ;)
  applyGradients(circlesSVG2);
  applyFilters(circleGroup2, circlesSVG2);
  applyColorBlends(circleGroup2, circlesSVG2);

  const timer = d3.timer(() =>
    circlesSVG.attr("fill", d3.interpolateRainbow(Date.now() / 30000))
  );

  invalidation.then(() => timer.stop());
  //const path = svg.selectAll("path[transform = 'translate(75,25)']");

  ///////////////////////////////////////////////////////////
  ////// Add your code changes here primarily | Part 2 //////
  ///////////////////////////////////////////////////////////

  //Tip: something for the color blend needs to be added here
  //and one filter needs to applied here instead of to the circlesSVG
  circleGroup;
  circleGroup2;

  //Apply any gradients as fills
  //Or filters here
  //Or even a color blend effect
  circlesSVG;
  circlesSVG2;

  //.style("fill", "url(#gradient-rainbow)") //as an example of how to apply a gradient by its ID

  //////////////////////////////////////////////////////////
  ////////////////////// END | Part 2 //////////////////////
  //////////////////////////////////////////////////////////

  ///////// Ignore the rest /////////

  //Stop the circles just to be sure
  //This is more an artifact of making this in Observable, then any good coding style
  stopCircles(circlesSVG);
  updateCircleLocations(circles);
  circlesSVG
    .data(circles)
    .attr("cx", (d) => d.newX)
    .attr("cy", (d) => d.newY);
  //Move the circles within the hexagon
  if (play) moveCircles(circlesSVG);
  stopCircles(circlesSVG2);
  updateCircleLocations(circles);
  circlesSVG2
    .data(circles)
    .attr("cx", (d) => d.newX)
    .attr("cy", (d) => d.newY);
  //Move the circles within the hexagon
  if (play) moveCircles(circlesSVG2);
  yield svg.node();
}


function _8(md){return(
md`## Rainbow Gradient

Create a rainbow linear gradient behind the hexagon that the circles seem to move across. You can read a lot more about this in my ["Linear SVG Gradients" blog](https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient).`
)}

function _colors(){return(
["#0045ff", "#5f74d2", "#ff644a", "#fdf57f", "#74ffff"]
)}

function _createGradientRainbow(hexWidth,colors){return(
function(defs) {
  let gradient = defs.append("linearGradient")
		.attr("id", "gradient-demo-rainbow")
		.attr("gradientUnits", "userSpaceOnUse") //Don't use the bounding box of each separate circle
    //Try commenting the "gradientUnits line above and setting x1 to 0 and x2 to 1 (1 then means 100%)
		.attr("x1", -hexWidth/2)
		.attr("x2", hexWidth/2)
    .attr("y1", 0)  
    .attr("y2", 0)
  	
  //Create a color stop for each color in the color array
  //And use the index/location to calculate the % location along the gradient's "directional arrow"
  gradient.selectAll("stop") 
		.data(colors)                  
		.enter().append("stop") 
		.attr("offset", (_,i) => `${i/(colors.length-1) * 100}%`)   
		.attr("stop-color", d => d)
}
)}

function _circles1(FileAttachment){return(
FileAttachment("circles.svg").image()
)}

function _12(md){return(
md`## Radial Gradient

Creates a radial gradient to mimic a sphere. This is here in case you want to take a peek at the code. But first give it a try to recreate this effect yourself by following the ["Data based & Radial SVG gradients" blog](https://www.visualcinnamon.com/2016/05/data-based-svg-gradient-d3).`
)}

function _createGradientRadial(circles,d3,colors){return(
function(defs) {
  //Setup a separate radial gradient for each circle
  let gradient = defs.selectAll("radialGradient")
		.data(circles)
		.enter().append("radialGradient")
		.attr("cx", "25%") //move the "central location" to the top left (default = 50%)
		.attr("cy", "25%") //move the "central location" to the top left (default = 50%)
		.attr("r", "65%") //default = 50%
		.attr("id", (_,i) => `gradient-demo-radial-${i}`) //give each circle its unique radial id

  //A lighter color on the inside
	gradient.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", (_,i) => d3.rgb(colors[i % colors.length]).brighter(1) )

  //The actual color around 40%
	gradient.append("stop")
		.attr("offset", "40%")
		.attr("stop-color", (_,i) => colors[i % colors.length])
		 
  //A darker color at the outside
	gradient.append("stop")
		.attr("offset",  "100%")
		.attr("stop-color", (_,i) => d3.rgb(colors[i % colors.length]).darker(1) )
}
)}

function _14(md){return(
md`## Abrupt Gradient

Creates a linear gradient with abrupt edges. This is here in case you want to take a peek at the code. But first give it a try to recreate this effect yourself by following the ["SVG Gradients for abrupt color changes" blog](https://www.visualcinnamon.com/2016/06/abrupt-color-gradients).`
)}

function _createGradientAbrupt(hexWidth){return(
function(defs) {
  	let gradient = defs.append("linearGradient")
      .attr("id", "gradient-demo-abrupt")
		  .attr("gradientUnits", "userSpaceOnUse") //Don't use the bounding box of each separate circle
      //Try commenting the "gradientUnits line above and setting x1 to 0 and x2 to 1 (1 then means 100%)
	  	.attr("x1", -hexWidth/2) //0)
  		.attr("x2", hexWidth/2) //1)
      .attr("y1", 0)  
      .attr("y2", 0)
	
  let grey = "#c4c4c4"
  let pink = "#fc0373"
  
  //Append two color stops at 30%
  //The class only comes into play when you ever want to change the offset location
  //e.g. when moving the edges
	gradient.append("stop")
		.attr("class", "left")
		.attr("offset", 0.3) //30%
		.attr("stop-color", grey)
	gradient.append("stop")
		.attr("class", "left")
		.attr("offset", 0.3)
		.attr("stop-color", pink)

  //Append two color stops at 70% in reverse color order
	gradient.append("stop")
		.attr("class", "right")
		.attr("offset", 0.7) //70%
		.attr("stop-color", pink)
	gradient.append("stop")
		.attr("class", "right")
		.attr("offset", 0.7)
		.attr("stop-color", grey)

}
)}

function _16(md){return(
md`## Animated Gradient

Creates an animated rainbow gradient. This is here in case you want to take a peek at the code. But first give it a try to recreate this effect yourself by following the ["Animated SVG Gradients" blog](https://www.visualcinnamon.com/2016/05/animate-gradient-imitate-flow-d3).`
)}

function _createGradientAnimated(){return(
function(defs) {
  let gradient = defs.append("linearGradient")
		.attr("id","gradient-demo-animated")
    .attr("spreadMethod", "reflect")  
  	//.attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0) //=0%
		.attr("y1", 0)
		.attr("x2", 1) //=100%
		.attr("y2", 0)
	
  //Define a new set of colors: pink, orange, yellow
  let colors = ["#ea0079", "#fc8669", "#ffc365"]
  
  //If you want to let x1 go to 100%, and x2 to 200%, then you need to 
  //create a mirrored version of the colors that you want to use, otherwise there will
  //be an abrupt change after the animation is done
  //let colors_mirrored = colors.concat(colors.slice().reverse())
  
  //Add the colors
	gradient.selectAll("stop") 
		.data(colors)                  
		.enter().append("stop") 
		.attr("offset", (_,i) => `${i/((colors.length)-1) * 100}%`)   
		.attr("stop-color", d => d)

	//Animate the x1 attribute between 0% and 100% in 7 seconds
	gradient.append("animate")
		.attr("attributeName","x1")
		.attr("values","0%;200%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite")
	//Animate the x2 attribute between 100% and 200% in 7 seconds
	gradient.append("animate")
		.attr("attributeName","x2")
		.attr("values","100%;300%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite")
}
)}

function _18(md){return(
md`---

# Filters

The code for several different filters: glow and gooey (maybe I'll add the motion blur at some point).`
)}

function _19(md){return(
md`## Glow filter

Creates a filter for adding a glowing effect. This is here in case you want to take a peek at the code. But first give it a try to recreate this effect yourself by following the ["Glow filter" blog](https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization).`
)}

function _createFilterGlow(){return(
function(defs) {
  //Filter for the outside glow
	let filter = defs.append("filter")
    .attr("id","filter-demo-glow")
  
	let feGaussianBlur = filter.append("feGaussianBlur")
    .attr("stdDeviation","2")
    .attr("result","coloredBlur")
	
  let feMerge = filter.append("feMerge")
  feMerge.append("feMergeNode").attr("in","coloredBlur")
  feMerge.append("feMergeNode").attr("in","SourceGraphic")
}
)}

function _21(md){return(
md`## Gooey filter

Creates a filter for the gooey effect. This is here in case you want to take a peek at the code. But first give it a try to recreate this effect yourself by following the ["Gooey filter" blog](https://www.visualcinnamon.com/2016/06/fun-data-visualizations-svg-gooey-effect).`
)}

function _createFilterGooey(){return(
function(defs) {
  
    //Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
    let filter = defs.append("filter")
      .attr('id',"filter-demo-gooey")
    
    filter.append("feGaussianBlur")
      .attr("in","SourceGraphic")
      .attr("stdDeviation","8")
      .attr("result","blur")
  
    filter.append("feColorMatrix")
      .attr("in","blur")
      .attr("mode","matrix")
      .attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7")
      .attr("result","gooey")
}
)}

function _23(md){return(
md`---

## General set-up

You don't need to mess with these parts of the code, or anything farther below. This is all there to create the circles, the enclosing hexagon and to make the circles move around.`
)}

function _24(md){return(
md`Generate an initial array to set-up 20 circles in random positions:`
)}

function _circles(updateCircleLocations)
{
  let positions = [];
  for (let i = 0; i < 20; i++) {
    let r = 12 + Math.random() * 50;
    positions.push({ r: r });
  } //for i

  //Add locations
  updateCircleLocations(positions);

  return positions;
}


function _updateCircleLocations(hexagonPoly,hexRadius,d3){return(
function(circles) {
  let polygon = hexagonPoly.map(p => [p[0]*hexRadius, p[1]*hexRadius])
    
	circles.forEach((d,i) => {  
    //Randomly calculate a location within the rHex circle
    //And just to be sure, check if it falls within a hexagon
    //If not, keep trying until it does
    let insideHexagon = false
    let rHex = 0
    let theta = 0
    while(!insideHexagon) {
      rHex = Math.random() * hexRadius
		  theta = Math.random() * 2 * Math.PI
      let x = (rHex + d.r) * Math.cos(theta)
      let y = (rHex + d.r) * Math.sin(theta)
      insideHexagon = d3.polygonContains(polygon, [x,y])
    }//while

    d.newX = rHex * Math.cos(theta)
    d.newY = rHex * Math.sin(theta)
	})//forEach
  
}
)}

function _27(md){return(
md`Calculate the next location for the circle to move to along a hexagonal border:`
)}

function _newLocation(SQRT3,hexRadius){return(
function(currentX, radius) {
  //General idea from Maarten Lambrecht's block: http://bl.ocks.org/maartenzam/f35baff17a0316ad4ff6

	//Randomly define which quadrant to move next
	let sideX = currentX > 0 ? -1 : 1
	let sideY = Math.random() > 0.5 ? 1 : -1
	let randSide = Math.random()

	let newX, newY

	//Move new locations along the vertical sides in 33% of the cases
	if (randSide > 0.66) {
		newX = sideX * 0.5 * SQRT3 * hexRadius - sideX*radius
		newY = sideY * Math.random() * 0.5 * hexRadius - sideY*radius
	} else {
		//Choose a new x location randomly, 
		//the y position will be calculated later to lie on the hexagon border
		newX = sideX * Math.random() * 0.5 * SQRT3 * hexRadius
		//Otherwise calculate the new Y position along the hexagon border 
		//based on which quadrant the random x and y gave
		if (sideX > 0 && sideY > 0) {
			newY = hexRadius - (1/SQRT3)*newX
		} else if (sideX > 0 && sideY <= 0) {
			newY = -hexRadius + (1/SQRT3)*newX
		} else if (sideX <= 0 && sideY > 0) {
			newY = hexRadius + (1/SQRT3)*newX
		} else if (sideX <= 0 && sideY <= 0) {
			newY = -hexRadius - (1/SQRT3)*newX
		}//else

		//Take off a bit so it seems that the circles truly only touch the edge
		let offSetX = radius * Math.cos( 60 * Math.PI/180)
		let offSetY = radius * Math.sin( 60 * Math.PI/180)
		newX = newX - sideX * offSetX
		newY = newY - sideY * offSetY
	}//else
  
  return [newX, newY]

}
)}

function _29(md){return(
md`Add a hexagonal clipping path to the element supplied:`
)}

function _clipToHexagon(hexagonPath){return(
function(defs) {
  //Create a clip path that is the same as the top hexagon
	defs.append("clipPath")
    	.attr("id", "clip")
    	.append("path")
    	.attr("d", hexagonPath)
}
)}

function _31(md){return(
md`Sets up 4 gradient effects and 2 filters for demo purposes:`
)}

function _setupPredefinedGradientsAndFilters(createGradientRainbow,createGradientRadial,createGradientAbrupt,createGradientAnimated,createFilterGooey,createFilterGlow){return(
function(defs) {
  //Creates a gradient with id: "gradient-demo-rainbow"
  createGradientRainbow(defs)
  
  //Creates a gradient per circle, with "general" id: "gradient-demo-radial-${i}"
  createGradientRadial(defs)
  
  //As an example, create an abrupt color gradient
  //Creates a gradient with id: "gradient-demo-abrupt"
  createGradientAbrupt(defs)
  
  //Creates a gradient with id: "gradient-demo-animated"
  createGradientAnimated(defs)
  
  //Creates a filter with id: "filter-demo-gooey"
  createFilterGooey(defs)
  
  //Creates a filter with id: "filter-demo-glow"
  createFilterGlow(defs) 
}
)}

function _33(md){return(
md`Applies the 4 gradient effects as examples to try and recreate:`
)}

function _applyGradients(gradientEffect,colors){return(
function(group) {
  group
    .style("fill", (_,i) => {
      if(gradientEffect === "none") return colors[i % colors.length]
      else if(gradientEffect === "rainbow") return "url(#gradient-demo-rainbow)"
      else if(gradientEffect === "radial") return  `url(#gradient-demo-radial-${i})`
      else if(gradientEffect === "abrupt") return "url(#gradient-demo-abrupt)"
      else if(gradientEffect === "animated") return  "url(#gradient-demo-animated)"
  })
}
)}

function _logo(FileAttachment){return(
FileAttachment("logo.png").image()
)}

function _36(md){return(
md`Applies the 2 SVG filter effects as examples to try and recreate:`
)}

function _applyFilters(filterEffect){return(
function(outerGroup, innerGroup) {
  //The gooey filter needs to be applied to the group
  outerGroup
    .style("filter", filterEffect === "gooey" ? "url(#filter-demo-gooey)" : null)
  
  innerGroup
    .style("filter", filterEffect === "glow" ? "url(#filter-demo-glow)" : "none") 
}
)}

function _38(md){return(
md`Applies the multiply & screen color blend effects as examples to try and recreate:`
)}

function _applyColorBlends(colorBlendEffect){return(
function(outerGroup, innerGroup) {
  //Needed for general color blending effects such as "multiply" or "screen"
  //so the background color isn't included
  outerGroup
    .style("isolation", colorBlendEffect === "none" ? null : "isolate")
  
  innerGroup
    .style("mix-blend-mode", colorBlendEffect === "none" ? null : colorBlendEffect) 
}
)}

function _40(md){return(
md`Add a stroked hexagonal shape on top of the element supplied:`
)}

function _strokeHexagon(hexagonPath){return(
function(group) {
    group.append("path")
      .attr("class", "hexagon")
      .attr("d", hexagonPath)
      .style("stroke", "#F2F2F2")
      .style("stroke-width", "4px")
      .style("fill", "none")
}
)}

function _42(md){return(
md`Make the circles move around inside the hexagon:`
)}

function _moveCircles(d3,newLocation){return(
function(group) {
  //Based on https://bl.ocks.org/mbostock/1125997
  group
    .transition()
    .duration(d => 3000 + 3000 * Math.random())
    .ease(d3.easeLinear)
    .on("start", function repeat() {
      d3.active(this)
        .each(d => {
        let newPos = newLocation(d.newX, d.r)
        d.newX = newPos[0]
        d.newY = newPos[1]
      })
        .attr("cx", d => d.newX)
        .attr("cy", d => d.newY) 
        .transition()
        .duration(d => 3000 + 4000 * Math.random())  
        .on("start", repeat)
    })
}
)}

function _stopCircles(){return(
function(group) {
  group.interrupt()
  //group.transition().duration(0)
}
)}

function _45(md){return(
md`---

## Hexagon settings`
)}

function _SQRT3(){return(
Math.sqrt(3)
)}

function _hexRadius(){return(
300
)}

function _hexWidth(SQRT3,hexRadius){return(
SQRT3 * hexRadius
)}

function _hexHeight(hexRadius){return(
2 * hexRadius
)}

function _hexagonPoly(SQRT3){return(
[[0,-1],[SQRT3/2,-0.5],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]]
)}

function _hexagonPath(hexagonPoly,hexRadius){return(
"M" + hexagonPoly.map(p => [p[0]*hexRadius, p[1]*hexRadius].join(',')).join('L') + " Z"
)}

function _52(md){return(
md`---

## Appendix`
)}

function _d3(require){return(
require("d3@5")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["circles.svg", {url: new URL("./files/c339a96d2019ed5032674023b656895ee7f91046eb40c2eeea941490a17ff53ffce9f14516c3e2f72bbd89895946cebc6b7b9808f87f08880c04b839622fa1f3.svg", import.meta.url), mimeType: "image/svg+xml", toString}],
    ["logo.png", {url: new URL("./files/ff36524a56887f5c2e65d4232f00c1e305b8f6e097b16e4c190512721edecef1a4738ec559ca95eb04db498a1bf9bf6277ac96ef0417a32b02fa9de399644294.png", import.meta.url), mimeType: "image/png", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["htl"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("viewof play")).define("viewof play", ["checkbox"], _play);
  main.variable(observer("play")).define("play", ["Generators", "viewof play"], (G, _) => G.input(_));
  main.variable(observer("viewof gradientEffect")).define("viewof gradientEffect", ["radio"], _gradientEffect);
  main.variable(observer("gradientEffect")).define("gradientEffect", ["Generators", "viewof gradientEffect"], (G, _) => G.input(_));
  main.variable(observer("viewof filterEffect")).define("viewof filterEffect", ["radio"], _filterEffect);
  main.variable(observer("filterEffect")).define("filterEffect", ["Generators", "viewof filterEffect"], (G, _) => G.input(_));
  main.variable(observer("viewof colorBlendEffect")).define("viewof colorBlendEffect", ["select"], _colorBlendEffect);
  main.variable(observer("colorBlendEffect")).define("colorBlendEffect", ["Generators", "viewof colorBlendEffect"], (G, _) => G.input(_));
  main.variable(observer("svg")).define("svg", ["d3","DOM","hexRadius","clipToHexagon","setupPredefinedGradientsAndFilters","circles","applyFilters","applyColorBlends","invalidation","strokeHexagon","applyGradients","stopCircles","updateCircleLocations","play","moveCircles"], _svg);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer("colors")).define("colors", _colors);
  main.variable(observer("createGradientRainbow")).define("createGradientRainbow", ["hexWidth","colors"], _createGradientRainbow);
  main.variable(observer("circles1")).define("circles1", ["FileAttachment"], _circles1);
  main.variable(observer()).define(["md"], _12);
  main.variable(observer("createGradientRadial")).define("createGradientRadial", ["circles","d3","colors"], _createGradientRadial);
  main.variable(observer()).define(["md"], _14);
  main.variable(observer("createGradientAbrupt")).define("createGradientAbrupt", ["hexWidth"], _createGradientAbrupt);
  main.variable(observer()).define(["md"], _16);
  main.variable(observer("createGradientAnimated")).define("createGradientAnimated", _createGradientAnimated);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer()).define(["md"], _19);
  main.variable(observer("createFilterGlow")).define("createFilterGlow", _createFilterGlow);
  main.variable(observer()).define(["md"], _21);
  main.variable(observer("createFilterGooey")).define("createFilterGooey", _createFilterGooey);
  main.variable(observer()).define(["md"], _23);
  main.variable(observer()).define(["md"], _24);
  main.variable(observer("circles")).define("circles", ["updateCircleLocations"], _circles);
  main.variable(observer("updateCircleLocations")).define("updateCircleLocations", ["hexagonPoly","hexRadius","d3"], _updateCircleLocations);
  main.variable(observer()).define(["md"], _27);
  main.variable(observer("newLocation")).define("newLocation", ["SQRT3","hexRadius"], _newLocation);
  main.variable(observer()).define(["md"], _29);
  main.variable(observer("clipToHexagon")).define("clipToHexagon", ["hexagonPath"], _clipToHexagon);
  main.variable(observer()).define(["md"], _31);
  main.variable(observer("setupPredefinedGradientsAndFilters")).define("setupPredefinedGradientsAndFilters", ["createGradientRainbow","createGradientRadial","createGradientAbrupt","createGradientAnimated","createFilterGooey","createFilterGlow"], _setupPredefinedGradientsAndFilters);
  main.variable(observer()).define(["md"], _33);
  main.variable(observer("applyGradients")).define("applyGradients", ["gradientEffect","colors"], _applyGradients);
  main.variable(observer("logo")).define("logo", ["FileAttachment"], _logo);
  main.variable(observer()).define(["md"], _36);
  main.variable(observer("applyFilters")).define("applyFilters", ["filterEffect"], _applyFilters);
  main.variable(observer()).define(["md"], _38);
  main.variable(observer("applyColorBlends")).define("applyColorBlends", ["colorBlendEffect"], _applyColorBlends);
  main.variable(observer()).define(["md"], _40);
  main.variable(observer("strokeHexagon")).define("strokeHexagon", ["hexagonPath"], _strokeHexagon);
  main.variable(observer()).define(["md"], _42);
  main.variable(observer("moveCircles")).define("moveCircles", ["d3","newLocation"], _moveCircles);
  main.variable(observer("stopCircles")).define("stopCircles", _stopCircles);
  main.variable(observer()).define(["md"], _45);
  main.variable(observer("SQRT3")).define("SQRT3", _SQRT3);
  main.variable(observer("hexRadius")).define("hexRadius", _hexRadius);
  main.variable(observer("hexWidth")).define("hexWidth", ["SQRT3","hexRadius"], _hexWidth);
  main.variable(observer("hexHeight")).define("hexHeight", ["hexRadius"], _hexHeight);
  main.variable(observer("hexagonPoly")).define("hexagonPoly", ["SQRT3"], _hexagonPoly);
  main.variable(observer("hexagonPath")).define("hexagonPath", ["hexagonPoly","hexRadius"], _hexagonPath);
  main.variable(observer()).define(["md"], _52);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  const child1 = runtime.module(define1);
  main.import("radio", child1);
  main.import("select", child1);
  main.import("checkbox", child1);
  const child2 = runtime.module(define2);
  main.import("viewof mix", child2);
  main.import("mix", child2);
  return main;
}
