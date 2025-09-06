import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/auth.interceptor';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(), // Dùng Fetch API thay vì XMLHttpRequest
      withInterceptors([authInterceptor]) // Gắn token tự động
    ),
    importProvidersFrom(FormsModule) // Cho phép dùng [(ngModel)] với FormsModule
  ]
});
