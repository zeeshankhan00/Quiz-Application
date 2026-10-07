export const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
export const ADMIN_MUTATIONS_ENABLED = import.meta.env?.VITE_ADMIN_MUTATIONS_ENABLED === 'true';

export class ApiError extends Error {
  constructor(message, status) { super(message); this.name = 'ApiError'; this.status = status; }
}

export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  const token = localStorage.getItem('jwt');
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) };
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method, headers, signal, ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach the server. Please try again.', 0);
  }
  const text = await response.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }
  if (response.status === 401) {
    localStorage.removeItem('jwt');
    throw new ApiError('Session expired. Please sign in again.', 401);
  }
  if (response.status === 403) throw new ApiError('Your account does not have admin access.', 403);
  if (!response.ok) throw new ApiError(
    (typeof data?.message === 'string' && data.message)
      || (typeof data?.detail === 'string' && data.detail)
      || `Request failed (status ${response.status}).`, response.status);
  return data;
}

export function getCurrentUser(options) { return apiRequest('/auth/me', options); }

export async function createQuiz(title, category) {
  const data = await apiRequest(`/quiz/create?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`,
    { method: 'POST' });
  const id = Number(data);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError('Unexpected quiz ID from server.', 0);
  return { id };
}

export async function getQuiz(id) {
  const data = await apiRequest(`/quiz/get/${id}`);
  const rawQuestions = Array.isArray(data) ? data : (data?.questions || data?.questionList || []);
  return rawQuestions.map(q => ({
    id: q.id ?? q.questionId,
    text: q.question ?? q.questionTitle ?? q.questionText ?? q.title ?? '',
    options: Array.isArray(q.options) ? q.options
      : [q.option1, q.option2, q.option3, q.option4].filter(o => o !== undefined && o !== null && o !== ''),
    raw: q,
  }));
}

export async function submitQuiz(id, answers) {
  const data = await apiRequest(`/quiz/submit/${id}`, {
    method: 'POST', body: answers.map(a => ({ id: a.questionId, userResponse: a.response ?? '' })),
  });
  if (typeof data?.score !== 'number') throw new ApiError('Unexpected quiz result from server.', 0);
  return { score: data.score, total: answers.length, questionResults: data.questionResults || [] };
}

export async function getAdminQuestions(category, options) {
  const data = await apiRequest(`/admin/questions?category=${encodeURIComponent(category)}`, options);
  if (!Array.isArray(data)) throw new ApiError('Unexpected question list from server.', 0);
  return data;
}
export function createAdminQuestion(question) {
  return apiRequest('/admin/questions', { method: 'POST', body: question });
}
// The update/delete handlers are yours to implement; enable the feature flag when ready.
export function updateAdminQuestion(id, question) {
  return apiRequest(`/admin/questions/${id}`, { method: 'PUT', body: question });
}
export function deleteAdminQuestion(id) {
  return apiRequest(`/admin/questions/${id}`, { method: 'DELETE' });
}
