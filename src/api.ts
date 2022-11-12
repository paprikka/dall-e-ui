export type OpenAIApiRespose = {
  created: number;
  data: { url: string }[];
};

export type Size = "256x256" | "512x512" | "1024x1024";

export const API = {
  editImage: ({
    prompt,
    image,
    mask,
    n,
    apiKey,
    size,
  }: {
    prompt: string;
    image: File;
    mask: File;
    n: number;
    apiKey: string;
    size: Size;
  }) => {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("n", n.toString());
    form.append("size", size);
    form.append("image", image);
    form.append("mask", mask);

    const options: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };

    options.body = form;

    return fetch("https://api.openai.com/v1/images/edits", options)
      .then((response) => response.json())
      .then((res) =>
        res?.error?.message
          ? Promise.reject(new Error(res.error.message))
          : Promise.resolve(res as OpenAIApiRespose)
      );
  },
  generate: ({
    prompt,
    n,
    apiKey,
    size,
  }: {
    prompt: string;
    n: number;
    apiKey: string;
    size: Size;
  }) => {
    const form = JSON.stringify({
      prompt,
      n,
      size,
    });
    const options: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    };

    options.body = form;

    return fetch("https://api.openai.com/v1/images/generations", options)
      .then((response) => response.json())
      .then((res) =>
        res?.error?.message
          ? Promise.reject(new Error(res.error.message))
          : Promise.resolve(res as OpenAIApiRespose)
      );
  },
};
