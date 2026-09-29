const BASE_URL = '/api';

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Habaye ikosa mu gutunganya icyifuzo.');
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: (userId: string) => apiRequest(`/auth/me/${userId}`),
  updateProfile: (body: any) => apiRequest('/profile/update', { method: 'PUT', body: JSON.stringify(body) }),
  updatePassword: (body: any) => apiRequest('/profile/password', { method: 'PUT', body: JSON.stringify(body) }),

  // Videos
  getVideos: () => apiRequest('/videos'),
  claimVideoReward: (videoId: string, userId: string, watchedSeconds: number) =>
    apiRequest(`/videos/${videoId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ userId, watchedSeconds })
    }),

  // Surveys
  getSurveys: () => apiRequest('/surveys'),
  submitSurvey: (surveyId: string, userId: string, answers: Record<string, string>) =>
    apiRequest(`/surveys/${surveyId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ userId, answers })
    }),

  // Tasks
  getTasks: () => apiRequest('/tasks'),
  createTask: (body: any) => apiRequest('/tasks/create', { method: 'POST', body: JSON.stringify(body) }),
  submitTask: (taskId: string, body: any) =>
    apiRequest(`/tasks/${taskId}/submit`, { method: 'POST', body: JSON.stringify(body) }),

  // Products & Deposits
  getProducts: () => apiRequest('/products'),
  depositProduct: (body: any) => apiRequest('/products/deposit', { method: 'POST', body: JSON.stringify(body) }),
  claimDailyProfit: (userId: string) =>
    apiRequest('/products/claim-daily-profit', { method: 'POST', body: JSON.stringify({ userId }) }),

  // Withdrawals
  requestWithdrawal: (body: any) =>
    apiRequest('/withdrawals/request', { method: 'POST', body: JSON.stringify(body) }),

  // Transactions
  getTransactions: (userId?: string) =>
    apiRequest(`/transactions${userId ? `?userId=${userId}` : ''}`),

  // Messaging & Notifications
  getMessages: (userId?: string) => apiRequest(`/messages${userId ? `?userId=${userId}` : ''}`),
  sendMessage: (senderId: string, message: string, receiverId?: string) =>
    apiRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ senderId, message, receiverId })
    }),
  getNotifications: (userId?: string) =>
    apiRequest(`/notifications${userId ? `?userId=${userId}` : ''}`),

  // Admin APIs
  getAdminOverview: () => apiRequest('/admin/overview'),
  reviewDeposit: (id: string, action: 'approve' | 'reject', rejectionReason?: string) =>
    apiRequest(`/admin/deposits/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, rejectionReason })
    }),
  reviewWithdrawal: (id: string, action: 'approve' | 'reject', rejectionReason?: string) =>
    apiRequest(`/admin/withdrawals/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, rejectionReason })
    }),
  reviewSubmission: (id: string, action: 'approve' | 'reject', rejectionReason?: string) =>
    apiRequest(`/admin/submissions/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, rejectionReason })
    }),
  toggleBlockUser: (id: string) =>
    apiRequest(`/admin/users/${id}/block`, { method: 'PUT' }),
  deleteUser: (id: string) =>
    apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  updateProfitSettings: (id: string, dailyProfit: number) =>
    apiRequest(`/admin/profit-settings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ dailyProfit })
    }),
  sendBroadcast: (title: string, message: string) =>
    apiRequest('/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message })
    }),
  getAuditLogs: () => apiRequest('/admin/audit-logs')
};
