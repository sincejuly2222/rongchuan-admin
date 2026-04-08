import { getAccessToken, logout } from '../auth';
import type {
  ApiResponse,
  ImportJobItem,
  ImportJobListParams,
  ImportJobListResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function withAuthHeaders(init?: HeadersInit) {
  return {
    ...(init ?? {}),
    Authorization: `Bearer ${getAccessToken() ?? ''}`,
  };
}

async function parseResponse<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload.data;
}

async function ensureAuthorized(response: Response) {
  if (response.status === 401) {
    await logout();
    throw new Error('登录已失效，请重新登录');
  }
}

export async function fetchImportJobs(params: ImportJobListParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/import-jobs?${query.toString()}`, {
    headers: withAuthHeaders(),
    credentials: 'include',
  });

  await ensureAuthorized(response);
  return parseResponse<ImportJobListResponse>(response, '获取导入任务失败');
}

export async function uploadImportFile(file: File, type: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch(`${API_BASE_URL}/api/import-jobs/upload`, {
    method: 'POST',
    headers: withAuthHeaders(),
    credentials: 'include',
    body: formData,
  });

  await ensureAuthorized(response);
  return parseResponse<ImportJobItem>(response, '上传导入文件失败');
}
