import { DownloadDebugResponse, DownloadJob, DownloadProgress } from "@/types/download";
import { API_BASE_URL } from "@/environments/environments";

const API_BASE = API_BASE_URL;

export async function getDownloadDebug(url: string, desiredTrackName?: string): Promise<DownloadDebugResponse> {
  const response = await fetch(`${API_BASE}/downloads/debug`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch download info");
  }
  const data = await response.json();
  // Backend returns DebugResponse { job_id, status, return_code, debug: TrackDebug[] }
  const list: any[] = Array.isArray(data?.debug) ? data.debug : [];
  if (!list.length) {
    throw new Error("No debug info returned");
  }
  // Try to pick the track matching desiredTrackName
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/^\d{1,3}\.?\s+/, "")
      .replace(/[^a-z0-9\s]+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  let chosen = list[0];
  if (desiredTrackName) {
    const target = normalize(desiredTrackName);
    chosen =
      list.find((t) => normalize(t.name) === target) ||
      list.find((t) => normalize(t.name).includes(target)) ||
      list[0];
  }
  return {
    name: chosen.name,
    variants: chosen.variants,
    available_formats: chosen.available_formats,
  } as DownloadDebugResponse;
}

export async function createDownloadJob(payload: any): Promise<DownloadJob> {
  const response = await fetch(`${API_BASE}/downloads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to create download job");
  }
  return response.json();
}

export async function createBatchDownload(items: any[]): Promise<{ jobs: { job_id: string }[] }> {
  const response = await fetch(`${API_BASE}/downloads/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error("Failed to create batch jobs");
  }
  return response.json();
}

export async function getJobStatus(jobId: string): Promise<DownloadJob> {
  const response = await fetch(`${API_BASE}/downloads/${jobId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch job status");
  }
  return response.json();
}

export async function getJobProgress(jobId: string): Promise<DownloadProgress> {
  const response = await fetch(`${API_BASE}/downloads/${jobId}/progress`);
  if (!response.ok) {
    throw new Error("Failed to fetch job progress");
  }
  return response.json();
}

export async function cancelJob(jobId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/downloads/${jobId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to cancel job");
  }
}

export function createSSEConnection(
  jobId: string,
  onMessage: (event: MessageEvent) => void,
  onError: () => void
): EventSource {
  const eventSource = new EventSource(`${API_BASE}/downloads/${jobId}/events`);
  eventSource.onmessage = onMessage;
  eventSource.onerror = onError;
  return eventSource;
}

export function buildArchiveUrl(relativePath: string): string {
  const params = new URLSearchParams({ path: relativePath });
  return `${API_BASE}/archive?${params.toString()}`;
}

export function buildJobArchiveUrl(jobId: string): string {
  return `${API_BASE}/downloads/${jobId}/archive`;
}
