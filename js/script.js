
/*
*  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

/* global main */

'use strict';

// Call main() in demo.js
//main();

const canvas = document.getElementById('canvas');

const video = document.getElementById('video');
const stream = canvas.captureStream();

video.srcObject = stream;
const ctx = canvas.getContext('WEBGL', { desynchronized: true });

const startRecordingButton = document.querySelector('#start-recording');
const endRecordingButton = document.querySelector('#end-recording');
const recordingStatus = document.querySelector('#recording-status');

/** RECORDING & MUXING STUFF */

let muxer = null;
let videoEncoder = null;
let audioEncoder = null;
let startTime = null;
let recording = false;
let audioTrack = null;
let intervalId = null;
let lastKeyFrame = null;
let framesGenerated = 0;

const startRecording = async () => {
	
	// Check for VideoEncoder availability
	if (typeof VideoEncoder === 'undefined') {
		alert("Looks like your user agent doesn't support VideoEncoder / WebCodecs API yet.");
		return;
	}

	startRecordingButton.style.display = 'none';

	// Check for AudioEncoder availability
	if (typeof AudioEncoder !== 'undefined') {
		// Try to get access to the user's microphone
		try {
			let userMedia = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
			audioTrack = userMedia.getAudioTracks()[0];
		} catch (e) {}
		if (!audioTrack) console.warn("Couldn't acquire a user media audio track.");
	} else {
		console.warn('AudioEncoder not available; no need to acquire a user media audio track.');
	}

	endRecordingButton.style.display = 'block';

	let audioSampleRate = audioTrack?.getCapabilities().sampleRate.max;

	// Create an MP4 muxer with a video track and maybe an audio track
	muxer = new Mp4Muxer.Muxer({
		target: new Mp4Muxer.ArrayBufferTarget(),

		video: {
			codec: 'avc',
			width: 1920,
			height: 1080
		},

			audio: audioTrack ? {
				codec: 'aac',
				sampleRate: audioSampleRate,
				numberOfChannels: 1
			} : undefined,
	
			// Puts metadata to the start of the file. Since we're using ArrayBufferTarget anyway, this makes no difference
			// to memory footprint.
			fastStart: 'in-memory',
	
			// Because we're directly pumping a MediaStreamTrack's data into it, which doesn't start at timestamp = 0
			firstTimestampBehavior: 'offset'
		});
	
	videoEncoder = new VideoEncoder({
		output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
		error: e => console.error(e)
	});
	videoEncoder.configure({
		codec: 'avc1.640028',
		//codec: 'av01.2.15M.10.0.100.09.16.09.0',
		width: 1920,
			height: 1080,
		bitrate: 1e6
	});



	startTime = document.timeline.currentTime;
	recording = true;
	lastKeyFrame = -Infinity;
	framesGenerated = 0;

	encodeVideoFrame();
	intervalId = setInterval(encodeVideoFrame, 1000/60);
};
startRecordingButton.addEventListener('click', startRecording);


const encodeVideoFrame = () => {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('WEBGL', { desynchronized: true });
const video = document.getElementById('video');

	let elapsedTime = document.timeline.currentTime - startTime;
	let frame = new VideoFrame(video, {
		timestamp: framesGenerated * 1e6 / 60 // Ensure equally-spaced frames every 1/30th of a second
	});
	framesGenerated++;

	// Ensure a video key frame at least every 10 seconds for good scrubbing
	let needsKeyFrame = elapsedTime - lastKeyFrame >= 10000;
	if (needsKeyFrame) lastKeyFrame = elapsedTime;

	videoEncoder.encode(frame, { keyFrame: needsKeyFrame });
	frame.close();

	recordingStatus.textContent =
		`${elapsedTime % 1000 < 500 ? '🔴' : '⚫'} Recording - ${(elapsedTime / 1000).toFixed(1)} s`;
};

const endRecording = async () => {
	endRecordingButton.style.display = 'none';
	recordingStatus.textContent = '';
	recording = false;

	clearInterval(intervalId);
	audioTrack?.stop();

	await videoEncoder?.flush();
	await audioEncoder?.flush();
	muxer.finalize();

	let buffer = muxer.target.buffer;
	downloadBlob(new Blob([buffer]));

	videoEncoder = null;
	audioEncoder = null;
	muxer = null;
	startTime = null;
	firstAudioTimestamp = null;

	//startRecordingButton.style.display = 'block';
};
endRecordingButton.addEventListener('click', endRecording);
// Takes the binary data and creates a new video element
const show = (data, width, height) => {
	const url = URL.createObjectURL(new Blob([data], { type: "video/mp4" }));
	const video = document.createElement("video");
	video.setAttribute("muted", "muted");
	video.setAttribute("autoplay", "autoplay");
	video.setAttribute("controls", "controls");
	const min = Math.min(width, window.innerWidth, window.innerHeight);
	const aspect = width / height;
	const size = min * 0.75;
	video.style.width = `${size}px`;
	video.style.height = `${size / aspect}px`;
  
	const container = document.body;
	container.appendChild(video);
	video.src = url;
  
	const text = document.createElement("div");
	const anchor = document.createElement("a");
	text.appendChild(anchor);
	anchor.href = url;
	anchor.id = "download";
	anchor.textContent = "Click here to download MP4 file...";
	anchor.download = "download.mp4";
	container.appendChild(text);
  };
  
  // Utility to download video binary data
  const download = (buf, filename) => {
	const url = URL.createObjectURL(new Blob([buf], { type: "video/mp4" }));
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename || "download";
	anchor.click();
  };
  
const downloadBlob = (blob) => {
	let url = window.URL.createObjectURL(blob);
	let a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = 'davinci.mp4';
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
};