// https://observablehq.com/@pamacha/mix-blend-mode@546
import define1 from "./7dfec509126263f5@315.js";
import define2 from "./e93997d5089d7165@2303.js";
import define3 from "./450051d7f1174df8@255.js";

function _1(md){return(
md`#  Mix Blend Mode
CSS has so many surprises! I was looking into additive color mixing options for a Venn diagram and stumbled into the [mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode) property. To explore some of the color blending possibilities, I stacked three elements: a red hyperbolic paraboloid, a blue circle, and a green circle. You can manipulate the mix-blend-mode, the opacity of each element, and the rotation dynamics below.`
)}

function _2(DOM,width,height,d3,backdrop,rotateXYZ,getSaddleRingCoordinates,num,r,roll,pitch,yaw,mix,redOpacity,redStrokeOpacity,line,circleOnSphere,tau,blueOpacity,blueStrokeOpacity,greenOpacity,greenStrokeOpacity)
{
  const svg = DOM.svg(width, height);
  const svgSelection = d3.select(svg).append('g')
    .attr("transform", `translate (${width/2} ${height/2})`);

  svgSelection.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('x', -width/2)
    .attr('y', -height/2)
    .style('opacity', () => backdrop ? 1 : 0)
                      
  svgSelection.append('path')
    .datum(rotateXYZ(getSaddleRingCoordinates(num, r, 0.2, 0), roll, pitch, yaw))
    .style("mix-blend-mode", mix)
    .style('fill', 'red')
    .style('fill-opacity', redOpacity)
    .style('stroke', 'red')
    .style('stroke-opacity', d => redStrokeOpacity)
    .style('stroke-width', d => 10)
    .attr('d', (d,i) => line(d).concat(' Z'))
  
  svgSelection.append('path')
    .datum(rotateXYZ(circleOnSphere(num, tau/4, tau/4, 3*tau/8,r), roll, pitch, yaw))
    .style("mix-blend-mode", mix)
    .style('fill', 'blue')
    .style('fill-opacity', blueOpacity)
    .style('stroke', 'blue')
    .style('stroke-opacity', d => blueStrokeOpacity)
    .style('stroke-width', d => 10)
    .attr('d', (d,i) => line(d).concat(' Z'))
  
  svgSelection.append('path')
    .datum(rotateXYZ(circleOnSphere(num, tau/4, tau/4, tau/8, r), roll, pitch, yaw))
    .style("mix-blend-mode", mix)
    .style('fill', 'green')
    .style('fill-opacity', greenOpacity)
    .style('stroke', 'green')
    .style('stroke-opacity', d => greenStrokeOpacity)
    .style('stroke-width', d => 10)
    .attr('d', (d,i) => line(d).concat(' Z'))

  return svg;
}


function _mix(select){return(
select({
  title: "mix-blend-mode",
  options: ['normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','difference','exclusion','hue','saturation','color','luminosity'],
  value: "screen"
})
)}

function _backdrop(checkbox){return(
checkbox({
  options: [{ value: "true", label: "black backdrop" }],
  value: 'true'
})
)}

function _roll(Scrubber,range){return(
Scrubber(range, {autoplay: true, loop: true, alternate: false, format: d => `roll: ${Math.round(d)}°`})
)}

function _pitch(Scrubber,range){return(
Scrubber(range, {autoplay: false, loop: true, alternate: false, format: d => `pitch: ${Math.round(d)}°`})
)}

function _yaw(Scrubber,range){return(
Scrubber(range, {autoplay: false, loop: true, alternate: false, format: d => `yaw: ${Math.round(d)}°`})
)}

function _values(inputsGroup,slider){return(
inputsGroup(
[
  [
   slider({min: 0, max: 1, value: 1,step: .01, description:'red opacity'}),
   slider({min: 0, max: 1, value: 1,step: .01, description:'blue opacity'}),
   slider({min: 0, max: 1, value: 1,step: .01, description:'green opacity'}),
  ],
  [
   slider({min: 0, max: 1, value: 0,step: .01, description:'red stroke opacity'}),
   slider({min: 0, max: 1, value: 0,step: .01, description:'blue stroke opacity'}),
   slider({min: 0, max: 1, value: 0,step: .01, description:'green stroke opacity'}),
  ]
]
                           
)
)}

function _range(){return(
Array.from({length: 360}, (_, i) => i + 0.01)
)}

function _num(){return(
360
)}

function _height(){return(
400
)}

function _r(height){return(
0.4 * height
)}

function _tau(){return(
2 * Math.PI
)}

function _redOpacity(values){return(
values[0][0]
)}

function _blueOpacity(values){return(
values[0][1]
)}

function _greenOpacity(values){return(
values[0][2]
)}

function _redStrokeOpacity(values){return(
values[1][0]
)}

function _blueStrokeOpacity(values){return(
values[1][1]
)}

function _greenStrokeOpacity(values){return(
values[1][2]
)}

function _xAxisRotation(){return(
function xAxisRotation(coordinate, roll) {
  var radians = 2 * Math.PI  * (roll % 360) / 360;
  var m = [
    1, 0, 0,
    0, Math.cos(radians), -Math.sin(radians),
    0, Math.sin(radians), Math.cos(radians) 
  ];
  return {
    x: m[0] * coordinate.x + m[1] * coordinate.y + m[2] * coordinate.z,
    y: m[3] * coordinate.x + m[4] * coordinate.y + m[5] * coordinate.z,
    z: m[6] * coordinate.x + m[7] * coordinate.y + m[8] * coordinate.z,
  }
}
)}

function _yAxisRotation(){return(
function yAxisRotation(coordinate, pitch) {
  var radians = 2 * Math.PI  * (pitch % 360) / 360;
  var m = [
    Math.cos(radians), 0, Math.sin(radians),
    0, 1, 0,
    -Math.sin(radians), 0, Math.cos(radians) 
  ];
  return {
    x: m[0] * coordinate.x + m[1] * coordinate.y + m[2] * coordinate.z,
    y: m[3] * coordinate.x + m[4] * coordinate.y + m[5] * coordinate.z,
    z: m[6] * coordinate.x + m[7] * coordinate.y + m[8] * coordinate.z,
  }
}
)}

function _zAxisRotation(){return(
function zAxisRotation(coordinate, yaw) {
  var radians = 2 * Math.PI  * (yaw % 360) / 360;
  var m = [
    Math.cos(radians), -Math.sin(radians), 0,
    Math.sin(radians), Math.cos(radians), 0,
    0, 0, 1 
  ];
  return {
    x: m[0] * coordinate.x + m[1] * coordinate.y + m[2] * coordinate.z,
    y: m[3] * coordinate.x + m[4] * coordinate.y + m[5] * coordinate.z,
    z: m[6] * coordinate.x + m[7] * coordinate.y + m[8] * coordinate.z,
  }
}
)}

function _rotateXYZ(zAxisRotation,yAxisRotation,xAxisRotation){return(
function rotateXYZ(coords, roll, pitch, yaw) {
  return coords.map(coord => {
    return zAxisRotation(yAxisRotation(xAxisRotation(coord, roll), pitch), yaw);;
  })
}
)}

function _getSaddleRingCoordinates(){return(
function getSaddleRingCoordinates(numberOfCoordinates, radius, steepness, phase) {
  const coordinates = [];
  const thetas = [];
  for(let t = 0; t < numberOfCoordinates; t++) {
    const theta = 2 * t * Math.PI / numberOfCoordinates - Math.PI;
    const phi = phase - 2 * Math.atan(
      Math.sqrt(
        (Math.sqrt( (steepness ** 2) + (Math.sin(2 * theta) ** 2))
        - Math.sin(2 * theta)) / steepness
        )
      );
    var x = radius * Math.cos(theta) * Math.sin(phi);
    var y = radius * Math.sin(theta) * Math.sin(phi);
    var z = radius * Math.cos(phi);
    coordinates.push({ radius, theta, phi, x, y, z });
  }
  return coordinates;
}
)}

function _circleOnSphere(tau){return(
function circleOnSphere(n, a, b, c, r) {
  const coords = [];
  for(let i = 0; i < n; i++) {
    const t = i*tau/n;
    const x = r*(+Math.sin(a) * Math.cos(b) * Math.cos(c) * Math.cos(t) 
    + Math.sin(a) * Math.sin(c) * Math.sin(t) 
    - Math.cos(a) * Math.sin(b) * Math.cos(c));
    const y = r*(-Math.sin(a) * Math.cos(b) * Math.sin(c) * Math.cos(t) 
    + Math.sin(a) * Math.cos(c) * Math.sin(t) 
    + Math.cos(a) * Math.sin(b) * Math.sin(c));
    const z = r*(+Math.sin(a) * Math.sin(b) * Math.cos(t) 
    + Math.cos(a) * Math.cos(b))
    coords.push({x,y,z});
  }
  return coords;
}
)}

function _line(d3){return(
d3.line()
.x(d => d.x)
.y(d => d.y)
)}

function _d3(require){return(
require("d3")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["DOM","width","height","d3","backdrop","rotateXYZ","getSaddleRingCoordinates","num","r","roll","pitch","yaw","mix","redOpacity","redStrokeOpacity","line","circleOnSphere","tau","blueOpacity","blueStrokeOpacity","greenOpacity","greenStrokeOpacity"], _2);
  main.variable(observer("viewof mix")).define("viewof mix", ["select"], _mix);
  main.variable(observer("mix")).define("mix", ["Generators", "viewof mix"], (G, _) => G.input(_));
  main.variable(observer("viewof backdrop")).define("viewof backdrop", ["checkbox"], _backdrop);
  main.variable(observer("backdrop")).define("backdrop", ["Generators", "viewof backdrop"], (G, _) => G.input(_));
  main.variable(observer("viewof roll")).define("viewof roll", ["Scrubber","range"], _roll);
  main.variable(observer("roll")).define("roll", ["Generators", "viewof roll"], (G, _) => G.input(_));
  main.variable(observer("viewof pitch")).define("viewof pitch", ["Scrubber","range"], _pitch);
  main.variable(observer("pitch")).define("pitch", ["Generators", "viewof pitch"], (G, _) => G.input(_));
  main.variable(observer("viewof yaw")).define("viewof yaw", ["Scrubber","range"], _yaw);
  main.variable(observer("yaw")).define("yaw", ["Generators", "viewof yaw"], (G, _) => G.input(_));
  main.variable(observer("viewof values")).define("viewof values", ["inputsGroup","slider"], _values);
  main.variable(observer("values")).define("values", ["Generators", "viewof values"], (G, _) => G.input(_));
  main.variable(observer("range")).define("range", _range);
  main.variable(observer("num")).define("num", _num);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("r")).define("r", ["height"], _r);
  main.variable(observer("tau")).define("tau", _tau);
  main.variable(observer("redOpacity")).define("redOpacity", ["values"], _redOpacity);
  main.variable(observer("blueOpacity")).define("blueOpacity", ["values"], _blueOpacity);
  main.variable(observer("greenOpacity")).define("greenOpacity", ["values"], _greenOpacity);
  main.variable(observer("redStrokeOpacity")).define("redStrokeOpacity", ["values"], _redStrokeOpacity);
  main.variable(observer("blueStrokeOpacity")).define("blueStrokeOpacity", ["values"], _blueStrokeOpacity);
  main.variable(observer("greenStrokeOpacity")).define("greenStrokeOpacity", ["values"], _greenStrokeOpacity);
  main.variable(observer("xAxisRotation")).define("xAxisRotation", _xAxisRotation);
  main.variable(observer("yAxisRotation")).define("yAxisRotation", _yAxisRotation);
  main.variable(observer("zAxisRotation")).define("zAxisRotation", _zAxisRotation);
  main.variable(observer("rotateXYZ")).define("rotateXYZ", ["zAxisRotation","yAxisRotation","xAxisRotation"], _rotateXYZ);
  main.variable(observer("getSaddleRingCoordinates")).define("getSaddleRingCoordinates", _getSaddleRingCoordinates);
  main.variable(observer("circleOnSphere")).define("circleOnSphere", ["tau"], _circleOnSphere);
  main.variable(observer("line")).define("line", ["d3"], _line);
  const child1 = runtime.module(define1);
  main.import("inputsGroup", child1);
  const child2 = runtime.module(define2);
  main.import("slider", child2);
  main.import("select", child2);
  main.import("checkbox", child2);
  const child3 = runtime.module(define3);
  main.import("Scrubber", child3);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
