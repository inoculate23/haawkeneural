



import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";
import define from "https://api.observablehq.com/d/607d09907224a21d.js?v=4";
new Runtime().module(define, name => {
  if (name === "viewof gradientEffect2") return new Inspector(document.querySelector("#observablehq-viewof-gradientEffect2-3b95f26a"));
  if (name === "viewof filterEffect") return new Inspector(document.querySelector("#observablehq-viewof-filterEffect-3b95f26a"));
  if (name === "viewof colorBlendEffect") return new Inspector(document.querySelector("#observablehq-viewof-colorBlendEffect-3b95f26a"));
  if (name === "viewof colorBlendEffect2") return new Inspector(document.querySelector("#observablehq-viewof-colorBlendEffect2-3b95f26a"));
  if (name === "svg") return new Inspector(document.querySelector("#observablehq-svg-3b95f26a"));
  return ["applyGradients1","applyFilters","applyFilters1","applyColorBlends","applyColorBlends1"].includes(name);
});

