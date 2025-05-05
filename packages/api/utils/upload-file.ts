// biome-ignore lint/suspicious/noExplicitAny: AnyFile
type AnyFile = any;
export const createUploadImageHandler =
  (onUploadImage: (base64: string) => void) => (file: AnyFile) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", () => {
      onUploadImage(String(reader.result));
    });
  };
