import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfig } from './config/api.config';
import { AppConstants } from './config/app.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: any = null;

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  /** ✅ Tải user từ localStorage, có thể gọi lại bất cứ lúc nào */
  public loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(AppConstants.STORAGE.USER);
    if (storedUser && storedUser !== 'undefined') {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        console.error('❌ Lỗi parse user từ localStorage', e);
        this.user = null;
      }
    } else {
      this.user = null;
    }
  }

  /** Lấy toàn bộ thông tin user hiện tại */
  getCurrentUser(): any {
    if (!this.user) this.loadUserFromStorage();
    return this.user;
  }

  /** Lấy ID của user hiện tại */
  getCurrentUserId(): number | null {
    const currentUser = this.getCurrentUser();
    return currentUser?.id ?? null;
  }

  /** Lấy token JWT */
  getToken(): string | null {
    return localStorage.getItem(AppConstants.STORAGE.TOKEN);
  }

  /** Đăng xuất */
  logout(): void {
    localStorage.removeItem(AppConstants.STORAGE.TOKEN);
    localStorage.removeItem(AppConstants.STORAGE.USER);
    localStorage.removeItem(AppConstants.STORAGE.USERNAME);
    this.user = null;
  }

  /** Login */
  login(username: string, password: string) {
    return this.http.post<{ token: string; user: any }>(
      ApiConfig.AUTH.LOGIN,
      { username, password } 
    );
  }

  /** Register */
  register(username: string, password: string) {
    return this.http.post<{ token: string; user: any }>(
      ApiConfig.AUTH.REGISTER,
      { username, password }
    );
  }

  /** Lưu user + token vào service và localStorage */
  setUser(user: any, token: string): void {
    if (!user || !token) return;
    this.user = user;
    localStorage.setItem(AppConstants.STORAGE.TOKEN, token);
    localStorage.setItem(AppConstants.STORAGE.USER, JSON.stringify(user));
    localStorage.setItem(AppConstants.STORAGE.USERNAME, user.username || '');
    console.log('💾 setUser xong', this.user);
  }

  /** Lấy headers kèm token JWT */
  getAuthHeaders(): { headers: any } {
    const token = this.getToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  }
}
