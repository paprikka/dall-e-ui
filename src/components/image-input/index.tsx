import { ChangeEventHandler, FC, useMemo } from "react";
import styles from "./index.module.css";

export const ImageInput: FC<{
  value?: File;
  onChange: (f: File) => void;
  label: string;
}> = ({ value, label, onChange }) => {
  const handleImageChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files?.[0]) return;
    onChange(e.target.files[0]);
  };

  const imageUrl = useMemo(() => {
    if (!value) return null;
    return URL.createObjectURL(value);
  }, [value]);

  return (
    <label className={styles.container}>
      <span>{label}</span>
      <input type="file" accept=".png" onChange={handleImageChange} />
      <div className={styles.preview}>
        {imageUrl ? <img src={imageUrl} /> : null}
      </div>
    </label>
  );
};
