import { Recorder, RecorderStatus, Encoders } from "canvas-record";
import createCanvasContext from "canvas-context";
import { AVC } from "media-codecs";

// Setup
const pixelRatio = devicePixelRatio;
const width = window.width;
const height = window.height;
const { context, canvas } = createCanvasContext("2d", {
  width: width * pixelRatio,
  height: height * pixelRatio,
  contextAttributes: { willReadFrequently: true },
});
Object.assign(canvas.style, { width: `${width}px`, height: `${height}px` });

const mainElement = document.querySelector("main");
mainElement.appendChild(canvas);

// Animation
let canvasRecorder;

function render() {
  const width = canvas.width;
  const height = canvas.height;

  const t = canvasRecorder.frame / canvasRecorder.frameTotal || Number.EPSILON;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "red";
  context.fillRect(0, 0, t * width, height);
}

const tick = async () => {
  render();

  if (canvasRecorder.status !== RecorderStatus.Recording) return;
  await canvasRecorder.step();

  if (canvasRecorder.status !== RecorderStatus.Stopped) {
    requestAnimationFrame(() => tick());
  }
};

canvasRecorder = new Recorder(context, {
  name: "canvas-record-example",
  encoderOptions: {
    codec: AVC.getCodec({ profile: "Main", level: "5.2" }),
  },
});

// Start and encode frame 0
await canvasRecorder.start();

// Animate to encode the rest
tick(canvasRecorder);
