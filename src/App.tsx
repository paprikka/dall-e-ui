import React, { ChangeEventHandler, FormEventHandler, useState } from "react";
import { API, Size } from "./api";
import styles from "./app.module.css";
import { ImageInput } from "./components/image-input";

const sizes: Size[] = ["256x256", "512x512", "1024x1024"];
type Mode = "generate" | "edit";
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
  const [error, setError] = useState("");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setRequestState("loading");
    setError("");

    if (mode === "edit")
      return API.editImage({ prompt, image, mask, apiKey, n: count, size })
        .then((result) => {
          console.log(result);
          setRequestState("idle");
          const urls = result.data.map((_) => _.url);
          setImages([...urls, ...images]);
        })
        .catch((err: Error) => {
          setError(err.message);
          setRequestState("error");
        });

    return API.generate({
      apiKey,
      n: count,
      prompt,
      size,
    })
      .then((result) => {
        console.log(result);
        setRequestState("idle");
        const urls = result.data.map((_) => _.url);
        setImages([...urls, ...images]);
      })
      .catch((err: Error) => {
        setError(err.message);
        setRequestState("error");
      });
  };

  const [count, setCount] = useState(1);

  const handleNumberChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const n = parseInt(e.target.value, 10);
    setCount(n);
  };

  const handleToastClose = () => setError("");

  const [size, setSize] = useState<Size>("512x512");
  const handleSizeChange: ChangeEventHandler<HTMLSelectElement> = (e) =>
    setSize(e.target.value as Size);

  const [mode, setMode] = useState<Mode>("generate");
  const handleModeChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setMask(undefined);
    setImage(undefined);
    setMode(e.target.value as Mode);
  };
  const canSubmit =
    mode === "edit"
      ? prompt && prompt.trim() && image && mask && count && apiKey
      : prompt && prompt.trim() && apiKey;

  const [columns, setColumns] = useState(3);
  const handleColumnsChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setColumns(parseInt(e.target.value, 10));
  };

  return (
    <main className={styles.container}>
      <form className={styles.input} onSubmit={handleSubmit}>
        <label className={styles.labelledInput}>
          <span>Mode</span>
          <select value={mode} onChange={handleModeChange}>
            <option value="edit">Edit</option>
            <option value="generate">Generate</option>
          </select>
        </label>
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
        <div className={styles.hgroup}>
          <label className={styles.countInput}>
            Count: {count}
            <input
              type="range"
              min="1"
              max="10"
              value={count}
              onChange={handleNumberChange}
            />
          </label>
          <select
            value={size}
            className={styles.sizes}
            onChange={handleSizeChange}
          >
            {sizes.map((s) => (
              <option value={s}>{s}</option>
            ))}
          </select>
        </div>
        {mode === "edit" ? (
          <div className={styles.fileInputs}>
            <ImageInput label="Image" value={image} onChange={setImage} />
            <ImageInput label="Mask" value={mask} onChange={setMask} />
          </div>
        ) : null}

        <button disabled={!canSubmit} type="submit" className={styles.submit}>
          Render
        </button>
      </form>
      <section
        className={styles.output}
        style={{ "--cols": columns } as React.CSSProperties}
      >
        <ul className={styles.outputContent}>
          {images.map((img, ind) => (
            <img
              src={img}
              alt=""
              key={ind}
              onClick={() => window.open(img, "_blank")}
            />
          ))}
        </ul>
        <div className={styles.outputToolbar}>
          <div className={styles.hgroup}>
            <input
              type="range"
              value={columns}
              min="1"
              max="10"
              onChange={handleColumnsChange}
            />{" "}
          </div>
        </div>
      </section>

      {error ? (
        <div className={styles.toast}>
          <p>{error}</p>
          <button onClick={handleToastClose}>Close</button>
        </div>
      ) : null}
    </main>
  );
}

export default App;
