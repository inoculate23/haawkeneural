
import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";
import define from "https://api.observablehq.com/d/607d09907224a21d@1464.js?v=4";
new Runtime().module(define, name => {
  if (name === "viewof gradientEffect") return new Inspector(document.querySelector("#observablehq-viewof-gradientEffect-8955fadf"));
  if (name === "viewof filterEffect") return new Inspector(document.querySelector("#observablehq-viewof-filterEffect-8955fadf"));
  if (name === "viewof colorBlendEffect") return new Inspector(document.querySelector("#observablehq-viewof-colorBlendEffect-8955fadf"));
  if (name === "svg") return new Inspector(document.querySelector("#observablehq-svg-8955fadf"));
  return ["applyGradients","applyFilters","applyFilters1","applyColorBlends"].includes(name);
});

