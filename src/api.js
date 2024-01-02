async function run(model, input) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/edcfecd4250da0c9297d32137875e756/ai/run/${model}`,
    {
      headers: { Authorization: "Bearer qHj5nsWLL6WVX0kYt-XiX_2DbJZ8vFVKSKFtMGNx" },
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  const result = await response.json();
  return result;
}

run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
  messages: [
    {
      role: "system",
      content: "You are a friendly assistant that helps write stories",
    },
    {
      role: "user",
      content:
        "a dog dressed up like a cowboy kareoke singer riding a large tardigrade.",
    },
  ],
}).then((response) => {
  console.log(JSON.stringify(response));
});