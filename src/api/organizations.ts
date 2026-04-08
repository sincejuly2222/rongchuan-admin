import { getAccessToken, logout } from '../auth';
import type {
  ApiResponse,
  CreateOrganizationRequest,
  OrganizationItem,
  OrganizationListParams,
  OrganizationListResponse,
  UpdateOrganizationRequest,
  UpdateOrganizationStatusResponse,
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

export async function fetchOrganizations(params: OrganizationListParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/organizations?${query.toString()}`, {
    headers: withAuthHeaders(),
    credentials: 'include',
  });

  await ensureAuthorized(response);
  return parseResponse<OrganizationListResponse>(response, '获取组织列表失败');
}

export async function createOrganization(params: CreateOrganizationRequest) {
  const response = await fetch(`${API_BASE_URL}/api/organizations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  await ensureAuthorized(response);
  return parseResponse<OrganizationItem>(response, '新增组织失败');
}

export async function updateOrganization(id: number, params: UpdateOrganizationRequest) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  await ensureAuthorized(response);
  return parseResponse<OrganizationItem>(response, '更新组织失败');
}

export async function updateOrganizationStatus(id: number, status: number) {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  await ensureAuthorized(response);
  return parseResponse<UpdateOrganizationStatusResponse>(response, '更新组织状态失败');
}
