import { Ai } from './vendor/@cloudflare/ai.js';
export default {
  async fetch(request, env) {
    const ai = new Ai(env.AI);

const options = {
  method: "POST",
  headers: {
    Accept: "application/json",
    "content-type": "application/json",
    Authorization: "Bearer 5ju_7bjK8LCjFk6BsU7RiVyHlG6G68KN5jiNSvqn"
  },
  body: JSON.stringify({
    samples: 1,
	height: 1024,
	width: 1024,
	steps: 40,
	cfg_scale: 5,
	style_preset: "neon-punk",
	prompt: [
	  {
	    "text": "a tardigrade wearing a tutu",
	    "weight": 1
	  },
	  {
	    "text": "blurry, bad",
	    "weight": -1
	  }
	],
  })
};

  const response = await ai.run(
      '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      options
    );

    return new Response(response, {
      headers: {
        'content-type': 'image/png'
      }
    });
  }
};
