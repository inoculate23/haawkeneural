const MODEL_URL = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';



const VIEW_SIZE = 600;
let viewScale = 1;
const OCTAVE_WIDTH = 1.0 * VIEW_SIZE;
const MAX_HISTORY = 500;
const CHART_HEIGHT = 240;

const NOTE_NAMES = ['C', 'C#\nD♭', 'D', 'D#\nE♭', 'E', 'F', 'F#\nG♭', 'G', 'G#\nA♭', 'A', 'A#\nB♭', 'B'];
const A4_FREQ = 440;
const A4_INDEX = 87;

let pitchDetector;
let audioContext;
let mic;

let pitch = 261.62; // Middle C
let isActive = false;
let displayPitch = pitch;

const noteHistory = [];
let chartMin;
let chartMax;

function windowResized() {
  resizeCanvas(400,400);
}

function setup() {
  createCanvas(windowWidth /4,windowHeight /4);
  pixelDensity(1);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  
 


 
    
    
  
  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(() => {
    pitchDetector = ml5.pitchDetection(
      MODEL_URL,
      audioContext,
      mic.stream,
      onModelLoaded
    );
  });

}
function onModelLoaded() {
  pitchDetector.getPitch(onPitch);
}

function onPitch(err, result) {
  noteHistory.push(result === null ? result : pitchToNote(result));
  while (noteHistory.length > MAX_HISTORY) {
    noteHistory.shift();
  }
  
  if (result !== null) {
    pitch = result;
    isActive = true;
  } else {
    isActive = false;
  }
  
  pitchDetector.getPitch(onPitch);
}

function draw() {
  background(0);
  
  viewScale = min(width, height) / VIEW_SIZE;
  translate(width/2, height/2);
  scale(viewScale);

  if (pitchDetector === undefined) {
    noStroke();
    fill(250);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(80);
    text('Loading...', width/2, height/2);
    return;
  }
  
  translate(0, -VIEW_SIZE/6);
  
  noStroke();
  fill(0, 180, 225);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  textSize(42);
  text('Pitch Detector / Tuner', 0, -VIEW_SIZE/4);
  
  strokeWeight(4);
  stroke(200);
  line(-width/2/viewScale, 0, width/2/viewScale, 0);
  
  displayPitch = (isActive ? lerp(displayPitch, pitch, 0.65) : pitch);
  let note = pitchToNote(displayPitch);

  strokeWeight(3);
  stroke(isActive ? color(0, 240, 0) : 127);
  line(0, -50, 0, 50);

  push();
  {
    translate(-note * (OCTAVE_WIDTH/12), 0);

    for (let oct = 0; oct <= 8; oct++) {
      const startX = oct * OCTAVE_WIDTH;
      const endX = (oct+1) * OCTAVE_WIDTH;
      for (let note = 0; note < 12; note++) {
        const x = map(note, 0, 12, startX, endX);
        strokeWeight(2);
        stroke(200);
        line(x, 50, x, -50);

        const noteName = NOTE_NAMES[note];
        noStroke();
        fill(noteName.length > 1 ? 127 : (oct === 4 && note === 0 ? color(100, 180, 225) : 225));
        textLeading(20);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        textSize(noteName.length === 1 ? 40 : 20);
        text(noteName, x, -75);

        textSize(16);
        text(`${oct}`, x+18, -62);

        const freq = noteToPitch(oct*12 + note);
        textStyle(NORMAL);
        textSize(12);
        text(nf(freq, 0, 2), x, 75);
      }
    }
  }
  pop();
  
  translate(0, VIEW_SIZE/3);

  const sortedNoteHistory = [...noteHistory].filter(x => x !== null).sort((a, b) => a - b);
  if (sortedNoteHistory.length > 0) {
    let minNote = sortedNoteHistory[0];
    let maxNote = sortedNoteHistory.slice(-1)[0];
    let avgNote = (minNote + maxNote) / 2;
    if (maxNote - avgNote < 1) {
      minNote = avgNote - 1;
      maxNote = avgNote + 1;
    }
    chartMin = avgNote + (minNote - avgNote) * 1.2;
    chartMax = avgNote + (maxNote - avgNote) * 1.2;
   
  }

  noFill();
  strokeWeight(2);
  stroke(127, 127, 127, 63);
  rect(-VIEW_SIZE/2+50, -CHART_HEIGHT/2, VIEW_SIZE-100, CHART_HEIGHT);
  
  strokeWeight(1);
  for (let n = ceil(chartMin); n < chartMax; n++) {
    noFill();
    stroke(n % 12 === 0 ? color(200, 200, 200, 63) : color(127, 127, 127, 63));
    strokeWeight(n % 12 === 0 ? 2 : 1);

    if (n % ceil((chartMax - chartMin)/8) === 0) {
      const y = map(n, chartMin, chartMax, 1, -1) * (CHART_HEIGHT/2);
      line(-VIEW_SIZE/2+50, y, VIEW_SIZE/2-50, y);

      const noteName = NOTE_NAMES[n % 12];
      noStroke();
      fill(noteName.length > 1 ? 127 : (note === 48 ? color(100, 180, 225) : 225));
      textSize(noteName.length === 1 ? 16 : 8);
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      text(noteName, -VIEW_SIZE/2+25, y);
      text(noteName,  VIEW_SIZE/2-25, y);
      
      textSize(8);
      text(`${floor(n/12)}`, -VIEW_SIZE/2+33, y+3);
      text(`${floor(n/12)}`,  VIEW_SIZE/2-17, y+3);
    }
  }
  
  let isDrawing = false;
  noFill();
  strokeWeight(2);
  stroke(225, 100, 50);
  noteHistory.forEach((note, i) => {
    if (note === null) {
      if (isDrawing) {
        isDrawing = false;
        endShape();
      }
      return;
    }
    if (!isDrawing) {
      beginShape();
      isDrawing = true;
    }
    
    const x = map(i, noteHistory.length - MAX_HISTORY, noteHistory.length, -1, 1) * (VIEW_SIZE/2 - 50);
    const y = map(note, chartMin, chartMax, 1, -1) * (CHART_HEIGHT/2);
    
    vertex(x, y);
  });
  if (isDrawing) {
    endShape();
  }
}

function noteToPitch(note) {
  return A4_FREQ * pow(2, (note - A4_INDEX) / 12);
   //console.log(note);
}

function pitchToNote(pitch) {
  return A4_INDEX + (12 * (log(pitch/A4_FREQ) / log(2)));
  console.log('Pitch:', pitch)
}
