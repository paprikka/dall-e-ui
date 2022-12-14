import React, { ChangeEventHandler, FormEventHandler, useState } from "react";
import { API, Size } from "./api";
import styles from "./app.module.css";
import { ImageInput } from "./components/image-input";

const sizes: Size[] = ["256x256", "512x512", "1024x1024"];
type Mode = "generate" | "edit";
type APIResult = {
  urls: string[];
  mode: Mode;
  prompt: string;
};

type PreviewItem = {
  url: string;
  mode: Mode;
  prompt: string;
};

const Colors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"].map(
  (c) => c + "aa"
);

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

  const [results, setResults] = useState<APIResult[]>([]);
  /*
() =>
    Array(40)
      .fill(null)
      .map((_, ind) => ({
        mode: "edit",
        prompt:
          "full page antique botanical atlas drawing of a flower with red petals, white background, art print, highly detailed, 8k, post-processing lorem ipsum #" +
          (ind + 1),
        urls: Array(Math.floor(Math.random() * 5))
          .fill(null)
          .map(
            (_, imgInd) => `https://via.placeholder.com/150?text=${imgInd + 1}`
          ),
      }))
*/
  const [error, setError] = useState("");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setRequestState("loading");
    setError("");

    if (mode === "edit" && image && mask)
      return API.editImage({ prompt, image, mask, apiKey, n: count, size })
        .then((result) => {
          console.log(result);
          setRequestState("idle");
          const urls = result.data.map((_) => _.url);
          setResults([
            {
              mode,
              prompt,
              urls,
            },
            ...results,
          ]);
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
        setResults([
          {
            mode,
            prompt,
            urls,
          },
          ...results,
        ]);
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

  const [preview, setPreview] = useState<PreviewItem | undefined>();

  const handlePreviewCloseClick = () => setPreview(undefined);
  const handlePreviewImageClick = (previewItem: PreviewItem) =>
    setPreview(previewItem);

  const handlePreviewDownloadClick = (preview: PreviewItem) =>
    window.open(preview.url, "_blank");

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
              <option value={s} key={s}>
                {s}
              </option>
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
        style={{ "--cols": 6 - columns } as React.CSSProperties}
      >
        <ul className={styles.outputContent}>
          {results
            .map((r, rInd) =>
              r.urls.map((url, ind) => (
                <li
                  key={`${url}_${ind}`}
                  style={
                    {
                      "--bs-color": Colors[rInd % Colors.length],
                    } as React.CSSProperties
                  }
                >
                  <img
                    src={url}
                    alt=""
                    onClick={() =>
                      handlePreviewImageClick({
                        mode: r.mode,
                        prompt: r.prompt,
                        url,
                      })
                    }
                  />
                </li>
              ))
            )
            .flat()}
        </ul>
        <div className={styles.outputToolbar}>
          <div className={styles.hgroup}>
            <input
              type="range"
              value={columns}
              min="1"
              max="5"
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

      {preview ? (
        <div className={styles.preview}>
          <img src={preview.url} alt={preview.prompt} />
          <p className={styles.previewDescription}>
            <strong>Prompt: </strong>
            {preview.prompt}
          </p>
          <div className={styles.previewTools}>
            <button onClick={handlePreviewCloseClick}>close</button>
            <button
              className={styles.buttonPrimary}
              onClick={() => handlePreviewDownloadClick(preview)}
            >
              open in new window
            </button>
          </div>
        </div>
      ) : null}

      <footer className={styles.footer}>
        Made with ???? by{" "}
        <a href="https://sonnet.io" target="_blank">
          Rafal Pastuszak
        </a>{" "}
        <a href="https://github.com/paprikka" target="_blank">
          (source)
        </a>
      </footer>
    </main>
  );
}

export default App;
