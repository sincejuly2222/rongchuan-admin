import { getAccessToken, logout } from '../auth';
import type {
  ActivityItem,
  ActivityListParams,
  ActivityListResponse,
  ApiResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
  UpdateActivityStatusResponse,
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

export async function fetchActivities(params: ActivityListParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/activities?${query.toString()}`, {
    headers: withAuthHeaders(),
    credentials: 'include',
  });

  await ensureAuthorized(response);
  return parseResponse<ActivityListResponse>(response, '获取活动列表失败');
}

export async function createActivity(params: CreateActivityRequest) {
  const response = await fetch(`${API_BASE_URL}/api/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  await ensureAuthorized(response);
  return parseResponse<ActivityItem>(response, '新增活动失败');
}

export async function updateActivity(id: number, params: UpdateActivityRequest) {
  const response = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  await ensureAuthorized(response);
  return parseResponse<ActivityItem>(response, '更新活动失败');
}

export async function updateActivityStatus(id: number, status: number) {
  const response = await fetch(`${API_BASE_URL}/api/activities/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  await ensureAuthorized(response);
  return parseResponse<UpdateActivityStatusResponse>(response, '更新活动状态失败');
}
