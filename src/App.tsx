import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { API } from "./api";
import styles from "./app.module.css";
import { ImageInput } from "./components/image-input";

function App() {
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem("apiKey") || ""
  );

  const handleApiKeyChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    localStorage.setItem("apiKey", e.target.value);
    setApiKey(e.target.value);
  };

  const [prompt, setPrompt] = useState(
    "full page antique botanical atlas drawing of a flower with red petals, white background, art print, highly detailed, 8k, post-processing"
  );

  const handlePromptChange: ChangeEventHandler<HTMLTextAreaElement> = (e) =>
    setPrompt(e.target.value);

  const [image, setImage] = useState<File>();
  const [mask, setMask] = useState<File>();

  const [requestState, setRequestState] = useState<
    "idle" | "loading" | "error"
  >("idle");

  const [images, setImages] = useState<string[]>([]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setRequestState("loading");
    API.request({ prompt, image, mask, apiKey, n: count })
      .then((result) => {
        console.log(result);
        setRequestState("idle");
        const urls = result.data.map((_) => _.url);
        setImages([...urls, ...images]);
      })
      .catch(() => setRequestState("error"));
  };

  const [count, setCount] = useState(1);
  const canSubmit = prompt && prompt.trim() && image && mask && count && apiKey;

  const handleNumberChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const n = parseInt(e.target.value, 10);
    setCount(n);
  };

  return (
    <main className={styles.container}>
      <form className={styles.input} onSubmit={handleSubmit}>
        <textarea value={prompt} onChange={handlePromptChange} />
        <input
          type="password"
          required
          className={styles.apiKey}
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder="Add your OpenAI API Key here"
        />
        {<progress value={requestState === "loading" ? undefined : "0"} />}
        <label className={styles.countInput}>
          Count: {count}
          <input
            type="range"
            min="1"
            max="12"
            value={count}
            onChange={handleNumberChange}
          />
        </label>
        <div className={styles.fileInputs}>
          <ImageInput label="Image" value={image} onChange={setImage} />
          <ImageInput label="Mask" value={mask} onChange={setMask} />
        </div>
        <button disabled={!canSubmit} type="submit" className={styles.submit}>
          Render
        </button>
      </form>
      <section className={styles.output}>
        {images.map((img, ind) => (
          <img
            src={img}
            alt=""
            key={ind}
            onClick={() => window.open(img, "_blank")}
          />
        ))}
      </section>
    </main>
  );
}

export default App;
