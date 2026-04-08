import { getAccessToken, isDevBypassToken, logout } from '../auth';
import { alumniRecords } from '../views/businessMockData';
import type {
  AlumniDetail,
  AlumniListItem,
  AlumniListParams,
  AlumniListResponse,
  ApiResponse,
  CreateAlumniRequest,
  UpdateAlumniRequest,
  UpdateAlumniStatusResponse,
  UpsertCardRequest,
  UpsertStudentRecordRequest,
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

function buildMockList(params: AlumniListParams): AlumniListResponse {
  const current = params.current ?? 1;
  const pageSize = params.pageSize ?? 10;
  const list: AlumniListItem[] = alumniRecords.map((item) => ({
    id: item.id,
    open_id: null,
    phone: item.phone,
    name: item.name,
    avatar: null,
    gender: null,
    company: item.company,
    position: item.title,
    city: item.city,
    status: item.status === '已冻结' ? 0 : 1,
    verified_status: item.status === '已认证' ? 2 : 0,
    allow_search: 1,
    created_at: item.lastActiveAt,
    school: '融川大学',
    college: item.college,
    major: item.major,
    class_name: item.className,
    enrollment_year: item.graduationYear - 4,
    slogan: item.tags.join(' / '),
  }));

  return {
    list: list.slice((current - 1) * pageSize, current * pageSize),
    total: list.length,
    current,
    pageSize,
  };
}

export async function fetchAlumni(params: AlumniListParams) {
  if (isDevBypassToken(getAccessToken())) {
    return buildMockList(params);
  }

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/alumni-users?${query.toString()}`, {
    headers: withAuthHeaders(),
    credentials: 'include',
  });

  await ensureAuthorized(response);
  return parseResponse<AlumniListResponse>(response, '获取校友列表失败');
}

export async function fetchAlumniDetail(id: number) {
  const response = await fetch(`${API_BASE_URL}/api/alumni-users/${id}`, {
    headers: withAuthHeaders(),
    credentials: 'include',
  });

  await ensureAuthorized(response);
  return parseResponse<AlumniDetail>(response, '获取校友详情失败');
}

export async function createAlumni(params: CreateAlumniRequest) {
  const response = await fetch(`${API_BASE_URL}/api/alumni-users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  await ensureAuthorized(response);
  return parseResponse<AlumniDetail>(response, '新增校友失败');
}

export async function updateAlumni(id: number, params: UpdateAlumniRequest) {
  const response = await fetch(`${API_BASE_URL}/api/alumni-users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  await ensureAuthorized(response);
  return parseResponse<AlumniDetail>(response, '更新校友失败');
}

export async function updateAlumniStatus(id: number, status: number) {
  const response = await fetch(`${API_BASE_URL}/api/alumni-users/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  await ensureAuthorized(response);
  return parseResponse<UpdateAlumniStatusResponse>(response, '更新校友状态失败');
}

export async function upsertStudentRecord(userId: number, params: UpsertStudentRecordRequest) {
  const response = await fetch(`${API_BASE_URL}/api/alumni-users/${userId}/student-record`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  await ensureAuthorized(response);
  return parseResponse<AlumniDetail>(response, '保存学籍失败');
}

export async function upsertAlumniCard(userId: number, params: UpsertCardRequest) {
  const response = await fetch(`${API_BASE_URL}/api/alumni-users/${userId}/card`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  await ensureAuthorized(response);
  return parseResponse<AlumniDetail>(response, '保存名片失败');
}
