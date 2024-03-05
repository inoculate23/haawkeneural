import { Ai } from './vendor/@cloudflare/ai.js';

export default {
  async fetch(request, env) {
    const ai = new Ai(env.AI);

    const button = document.getElementById('submit')
    button.addEventListener('click', submitFetch)
    const input = document.querySelector("input");
    const log = document.getElementById("values");
    
    input.addEventListener("input", updateValue);
    
    function updateValue(e) {
      log.textContent = e.target.value;
    }
    const data = { "prompt": log.textContent }

    const response = await ai.submitFetch(
      '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      data
    );

    return new Response(response, {
      headers: {
        'content-type': 'image/png'
      }
    });
  }
};