
    /**
 * for documentation and more demos,
 * visit https://audiomotion.dev
 */

// load module from Skypack CDN
import AudioMotionAnalyzer from "https://cdn.skypack.dev/audiomotion-analyzer";
// import peaksJs from "https://esm.sh/peaks.js";

// audio source
const audioEl = document.getElementById("audio");

// container
const container = document.getElementById("container");

// instantiate analyzer
const audioMotion = new AudioMotionAnalyzer(container, {
  source: audioEl,
  mode: 10,
  channelLayout: "dual-combined",
  fillAlpha: 0.3,
  fsElement: container,
  frequencyScale: "bark",
  gradientLeft: "steelblue",
  gradientRight: "orangered",
  linearAmplitude: true,
  linearBoost: 1.8,
  lineWidth: 1.5,
  showPeaks: false,
  outlineBars: true,
  weightingFilter: "D"
});

// file upload
document.getElementById("upload").addEventListener("change", (e) => {
  const fileBlob = e.target.files[0];

  if (fileBlob) {
    audioEl.src = URL.createObjectURL(fileBlob);
    audioEl.play();
  }
});

/* ======== CONTROLS (dat-gui) ======== */

const gui = new dat.GUI({ autoPlace: false });

const buttons = {
  //  link: () => window.parent.location = 'https://audiomotion.dev',
  link: () =>
    (window.parent.location =
      "https://github.com/hvianna/audioMotion-analyzer/tree/develop#readme"),
  loadFile: () => document.getElementById("upload").click(),
  playStream: () => {
    audioEl.src = "https://icecast2.ufpel.edu.br/live";
    audioEl.play();
  },
  fullscreen: () => audioMotion.toggleFullscreen()
};

gui.add(buttons, "loadFile").name("Upload audio file");
gui.add(buttons, "playStream").name("Play live stream");
gui.add(buttons, "fullscreen").name("Fullscreen");

gui.add(audioMotion, "gradient", [
  "classic",
  "prism",
  "orangered",
  "rainbow",
  "steelblue"
]);

gui.add(audioMotion, "mode", {
  "Discrete frequencies": 0,
  "1/24th octave / 240 bands": 1,
  "1/12th octave / 120 bands": 2,
  "1/8th octave / 80 bands": 3,
  "1/6th octave / 60 bands": 4,
  "1/4th octave / 40 bands": 5,
  "1/3rd octave / 30 bands": 6,
  "Half octave / 20 bands": 7,
  "Full octave / 10 bands": 8,
  "Line / Area graph": 10
});

const newFeaturesFolder = gui.addFolder("New Features");

newFeaturesFolder.add(audioMotion, "ansiBands");
newFeaturesFolder.add(audioMotion, "channelLayout", [
  "single",
  "dual-vertical",
  "dual-combined"
]);

newFeaturesFolder.add(audioMotion, "gradientLeft", [
  "classic",
  "prism",
  "orangered",
  "rainbow",
  "steelblue"
]);
newFeaturesFolder.add(audioMotion, "gradientRight", [
  "classic",
  "prism",
  "orangered",
  "rainbow",
  "steelblue"
]);

newFeaturesFolder.add(audioMotion, "frequencyScale", {
  Bark: "bark",
  Linear: "linear",
  Logarithmic: "log",
  Mel: "mel"
});
newFeaturesFolder.add(audioMotion, "linearAmplitude");
newFeaturesFolder.add(audioMotion, "linearBoost", 1, 5, 0.2);
newFeaturesFolder.add(audioMotion, "noteLabels");
newFeaturesFolder.add(audioMotion, "weightingFilter", {
  none: "",
  "A-weighting": "A",
  "B-weighting": "B",
  "C-weighting": "C",
  "D-weighting": "D",
  "ITU-R 468": "468"
});

const bandsFolder = gui.addFolder("Bands / Graph settings");

bandsFolder.add(audioMotion, "barSpace", 0, 1, 0.1);

bandsFolder.add(audioMotion, "alphaBars");
bandsFolder.add(audioMotion, "ledBars");
bandsFolder.add(audioMotion, "lumiBars");
bandsFolder.add(audioMotion, "outlineBars");
bandsFolder.add(audioMotion, "fillAlpha", 0, 1, 0.1);
bandsFolder.add(audioMotion, "lineWidth", 0, 5, 0.5);

const radialFolder = gui.addFolder("Radial settings");

radialFolder.add(audioMotion, "radial");
radialFolder.add(audioMotion, "spinSpeed", -5, 5, 1);

const reflexFolder = gui.addFolder("Reflex & Mirror settings");

reflexFolder.add(audioMotion, "mirror", -1, 1, 1);
reflexFolder.add(audioMotion, "reflexRatio", 0, 0.9, 0.1);
reflexFolder.add(audioMotion, "reflexAlpha", 0, 1, 0.1);
reflexFolder.add(audioMotion, "reflexBright", 0, 2, 0.1);
reflexFolder.add(audioMotion, "reflexFit");

const switchesFolder = gui.addFolder("Switches");

const switches = [
  "showBgColor",
  "showPeaks",
  "showScaleX",
  "showScaleY",
  "splitGradient",
  "loRes",
  "showFPS"
];

for (let prop of switches) switchesFolder.add(audioMotion, prop);

gui.add(buttons, "link").name(`v${AudioMotionAnalyzer.version}`);

container.appendChild(gui.domElement);

