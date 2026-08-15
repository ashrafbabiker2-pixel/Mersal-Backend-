import { IOrder, IService, IUser, IDashboardStats, IApiLog } from '../types';

class MersalApiClient {
  private token: string | null = null;
  private currentUser: IUser | null = null;

  constructor() {
    this.token = localStorage.getItem('mersal_jwt_token');
    const storedUser = localStorage.getItem('mersal_user_data');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch {
        this.currentUser = null;
      }
    }
  }

  public setAuth(token: string, user: IUser) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('mersal_jwt_token', token);
    localStorage.setItem('mersal_user_data', JSON.stringify(user));
  }

  public clearAuth() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('mersal_jwt_token');
    localStorage.removeItem('mersal_user_data');
  }

  public getToken(): string | null {
    return this.token;
  }

  public getCurrentUser(): IUser | null {
    return this.currentUser;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      const data = await response.json();
      return {
        ...data,
        status: response.status,
        ok: response.ok,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'تعذر الاتصال بالخادم المركزي لمرسال',
        error: error.message,
      };
    }
  }

  // --- System Health ---
  async getHealth() {
    return this.request('/api/health');
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    const res = await this.request<{ token: string; user: IUser; message: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (res.success && res.token && res.user) {
      this.setAuth(res.token, res.user);
    }
    return res;
  }

  async register(data: { name: string; email: string; phone: string; password: string; city?: string; role?: string }) {
    const res = await this.request<{ token: string; user: IUser; message: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (res.success && res.token && res.user) {
      this.setAuth(res.token, res.user);
    }
    return res;
  }

  async getMe() {
    return this.request<{ user: IUser }>('/api/auth/me');
  }

  // --- Services ---
  async getServices() {
    return this.request<{ services: IService[] }>('/api/services');
  }

  async createService(data: Partial<IService>) {
    return this.request<{ service: IService }>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Customer Orders ---
  async createOrder(orderPayload: any) {
    return this.request<{ order: IOrder }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  }

  async getMyOrders(params?: { status?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ orders: IOrder[] }>(`/api/orders/my-orders?${query}`);
  }

  async trackOrder(trackingNumber: string) {
    return this.request<{ tracking: any }>(`/api/orders/track/${encodeURIComponent(trackingNumber)}`);
  }

  async cancelOrder(orderId: string, reason?: string) {
    return this.request<{ order: IOrder }>(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // --- Employee Tasks ---
  async getEmployeeTasks(params?: { status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ tasks: IOrder[] }>(`/api/employees/my-tasks?${query}`);
  }

  async getAvailablePool() {
    return this.request<{ orders: IOrder[] }>('/api/employees/available-pool');
  }

  async getAvailableOrders() {
    return this.getAvailablePool();
  }

  async claimOrder(orderId: string) {
    return this.request<{ order: IOrder }>(`/api/employees/claim-order/${orderId}`, {
      method: 'POST',
    });
  }

  async updateTaskStatus(orderId: string, status: string, notes?: string, location?: string) {
    return this.request<{ order: IOrder }>(`/api/employees/tasks/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes, location }),
    });
  }

  async completeDeliveryWithPOD(orderId: string, data: { recipientName: string; notes?: string; signatureReceived?: boolean }) {
    return this.request<{ order: IOrder }>(`/api/employees/tasks/${orderId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeTask(orderId: string, recipientName: string, notes?: string, signatureReceived?: boolean) {
    return this.completeDeliveryWithPOD(orderId, { recipientName, notes, signatureReceived });
  }

  // --- Admin Endpoints ---
  async getAdminStats() {
    return this.request<{ stats: IDashboardStats }>('/api/admin/stats');
  }

  async getAllOrders(params?: { status?: string; serviceId?: string; employeeId?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ orders: IOrder[] }>(`/api/admin/orders?${query}`);
  }

  async assignEmployeeToOrder(orderId: string, employeeId: string) {
    return this.request<{ order: IOrder }>(`/api/admin/orders/${orderId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ employeeId }),
    });
  }

  async assignEmployee(orderId: string, employeeId: string) {
    return this.assignEmployeeToOrder(orderId, employeeId);
  }

  async overrideOrderStatus(orderId: string, status: string, notes?: string) {
    return this.request<{ order: IOrder }>(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getAllUsers(params?: { role?: string; status?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ users: IUser[] }>(`/api/admin/users?${query}`);
  }

  async createEmployee(data: any) {
    return this.request<{ employee: IUser }>('/api/admin/create-employee', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleUserStatus(userId: string) {
    return this.request<{ user: IUser }>(`/api/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getLogs(limit = 100) {
    return this.request<{ logs: IApiLog[] }>(`/api/admin/logs?limit=${limit}`);
  }
}

export const api = new MersalApiClient();
