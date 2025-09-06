import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: any = null; // lưu user hiện tại
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  // URL backend online Render
  private readonly baseUrl = 'https://chatplatform3-11.onrender.com/api/auth';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // ✅ Tải user từ localStorage, bỏ qua nếu undefined hoặc lỗi parse
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser && storedUser !== 'undefined') {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        console.error('❌ Lỗi parse user từ localStorage', e);
        this.user = null;
      }
    }
  }

  // Lấy toàn bộ thông tin user hiện tại
  getCurrentUser(): any {
    return this.user;
  }

  // Lấy ID của user hiện tại (dùng làm adminId)
  getCurrentUserId(): number | null {
    return this.user?.id ?? null;
  }

  // Lấy token JWT
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Đăng xuất
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.user = null;
  }

  // Login
  login(username: string, password: string) {
    return this.http.post<{ token: string; user: any }>(
      `${this.baseUrl}/login`,
      { username, password }
    );
  }

  // Lưu user + token
  setUser(user: any, token: string): void {
    if (!user || !token) return;
    this.user = user;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Lấy headers kèm token JWT
  getAuthHeaders(): { headers: any } {
    const token = this.getToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  }
}
