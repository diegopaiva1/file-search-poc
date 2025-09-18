import { fileApi, FileEntity } from "../services/api";

/**
 * Formats a file size in bytes into a human-readable string.
 * @param bytes number - The file size in bytes.
 * @returns string - The formatted file size.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Downloads a file by creating a blob and triggering a download link.
 * This ensures the file is downloaded with the correct filename and handles cleanup properly.
 * @param file FileEntity - The file entity containing the ID and original name.
 * @returns Promise<void> - A promise that resolves when the download is triggered.
 */
export const downloadFile = async (file: FileEntity): Promise<void> => {
  const blob = await fileApi.downloadFile(file.id);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.originalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
