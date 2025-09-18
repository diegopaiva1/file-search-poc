import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;
const api = axios.create({ baseURL: API_BASE_URL });

export enum ProcessingStatus {
  Pending = "pending",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
  Unknown = "unknown",
}

export interface FileEntity {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  snippet?: string;
  latestJobStatus: ProcessingStatus;
  latestJobErrorMessage?: string;
  isDuplicate?: boolean;
  message?: string;
  attemptedFileName?: string;
}

export interface SearchResponse {
  files: FileEntity[];
  total: number;
  limit: number;
  offset: number;
}

export interface FilesResponse {
  files: FileEntity[];
  total: number;
  limit: number;
  offset: number;
}

export const fileApi = {
  uploadFile: async (file: File): Promise<FileEntity> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  searchFiles: async (
    query: string,
    limit = 10,
    offset = 0
  ): Promise<SearchResponse> => {
    const response = await api.get("/files/search", {
      params: { query, limit, offset },
    });

    return response.data;
  },

  getAllFiles: async (limit = 50, offset = 0): Promise<FilesResponse> => {
    const response = await api.get("/files", {
      params: { limit, offset },
    });

    return response.data;
  },

  getFile: async (id: string): Promise<FileEntity> => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },

  getFileUrl: async (id: string): Promise<string> => {
    const response = await api.get(`/files/${id}/download`);
    return response.data.url;
  },

  downloadFile: async (id: string): Promise<Blob> => {
    const response = await api.get(`/files/${id}/download`, {
      responseType: "arraybuffer",
    });

    return new Blob([response.data], {
      type: response.headers["content-type"],
    });
  },
};

export default api;
