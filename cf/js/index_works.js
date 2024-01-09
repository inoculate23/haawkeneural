import { Ai } from './vendor/@cloudflare/ai.js';


export default {
  async fetch(request, env) {
    const ai = new Ai(env.AI);


    const inputs = {
      "key": "",
      "prompt": "ultra realistic close up portrait ((beautiful pale punk female with heavy black eyeliner and a big bossom))",
      "negative_prompt": null,
      "width": "1024",
      "height": "1024",
      "samples": "1",
      "num_inference_steps": "50",
      "safety_checker": "no",
      "enhance_prompt": "yes",
      "seed": null,
      "guidance_scale": 7.5,
      "multi_lingual": "no",
      "panorama": "no",
      "self_attention": "no",
      "upscale": "yes",
      "embeddings_model": null,
      "webhook": null,
      "track_id": null
    }


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

