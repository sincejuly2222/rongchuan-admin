import { getAccessToken, logout } from '../auth';
import type {
  ApiResponse,
  StudentRecordListParams,
  StudentRecordListResponse,
  UpdateStudentRecordStatusResponse,
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

export async function fetchStudentRecords(params: StudentRecordListParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/student-records?${query.toString()}`, {
    headers: withAuthHeaders(),
    credentials: 'include',
  });

  await ensureAuthorized(response);
  return parseResponse<StudentRecordListResponse>(response, '获取学籍列表失败');
}

export async function updateStudentRecordStatus(id: number, status: number) {
  const response = await fetch(`${API_BASE_URL}/api/student-records/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  await ensureAuthorized(response);
  return parseResponse<UpdateStudentRecordStatusResponse>(response, '更新学籍状态失败');
}
