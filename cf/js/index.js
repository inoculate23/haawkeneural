import { Ai } from './ai.js';


export default {
  async fetch(request, env) {
    const ai = new Ai(env.AI);

   let input = document.getElementById("searchTxt").value;
    const inputs = {
      prompt: 'cyberpunk cat'
    };


    const response = await ai.run(
      '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      inputs
    );


    return new Response(response, {
      headers: {
        'content-type': 'image/png'
      }
    });
  }
};

