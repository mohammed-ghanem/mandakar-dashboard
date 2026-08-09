/** Read a file and report progress (for UX). Does not keep the full buffer. */
export async function readFileWithProgress(
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  const total = file.size || 1;

  if (typeof file.stream === "function") {
    const reader = file.stream().getReader();
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      loaded += value?.byteLength ?? 0;
      onProgress(Math.min(100, Math.round((loaded / total) * 100)));
    }

    onProgress(100);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    reader.onload = () => {
      onProgress(100);
      resolve();
    };
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsArrayBuffer(file);
  });
}
