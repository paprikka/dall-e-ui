export type OpenAIApiRespose = {
  created: number;
  data: { url: string }[];
};

export const API = {
  request: ({
    prompt,
    image,
    mask,
    n,
    apiKey,
  }: {
    prompt: string;
    image: File;
    mask: File;
    n: number;
    apiKey: string;
  }) => {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("n", n.toString());
    form.append("size", "512x512");
    form.append("image", image);
    form.append("mask", mask);

    const options: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };

    options.body = form;

    return fetch("https://api.openai.com/v1/images/edits", options).then(
      (response) => response.json() as Promise<OpenAIApiRespose>
    );
  },
};
