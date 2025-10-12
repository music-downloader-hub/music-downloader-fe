export interface DownloadVariant {
  codec: string;
  audio_profile: string;
  bandwidth: number;
}

export interface AvailableFormats {
  aac: string;
  lossless: string;
  hires_lossless: string;
  dolby_atmos: string;
  dolby_audio: string;
}

export interface DownloadDebugResponse {
  name: string;
  variants: DownloadVariant[];
  available_formats: AvailableFormats;
}

export interface DownloadJob {
  job_id: string;
  status: "running" | "completed" | "failed" | "cancelled";
  return_code: number;
  args: string[];
  created_at: number;
  updated_at: number;
}

export interface DownloadProgress {
  phase: "Downloading" | "Decrypting" | null;
  percent: number;
  speed: string;
  downloaded: string;
  total: string;
  updated_at: number;
}

export interface SSEProgressEvent {
  type: "start" | "progress" | "end";
  job_id?: string;
  phase?: string;
  percent?: number;
  speed?: string;
  downloaded?: string;
  total?: string;
  status?: "completed" | "failed" | "cancelled";
  return_code?: number;
}

export interface DownloadState {
  job_id: string;
  name: string;
  format: string;
  status: "running" | "completed" | "failed" | "cancelled";
  progress: DownloadProgress | null;
}
