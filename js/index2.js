const prompt = input.value;

fetch('https://stable-diffusion.inoculatemedia.workers.dev/', {
method: 'POST',
body: prompt
})
.then(response => response.text())
.then(data => {
console.log(data); // Output the response from the Worker
const image = document.createElement('img');
image.src = data;
})
.catch(error => {
console.error('Error:', error);
});