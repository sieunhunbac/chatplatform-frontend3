import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Không gắn token khi gọi API login hoặc register
  if (token && !req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/register')) {
    console.log('👉 Interceptor chạy, token:', token);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};