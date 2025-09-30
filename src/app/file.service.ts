import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiConfig } from './config/api.config';
import { AppConstants } from './config/app.constants';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<{ url: string, filename: string, type: string }> {
    // Validate file size
    if (file.size > AppConstants.FILE.MAX_SIZE) {
      return throwError(() => new Error(`File size exceeds ${AppConstants.FILE.MAX_SIZE / 1024 / 1024}MB limit`));
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(ApiConfig.FILES.UPLOAD, formData, { responseType: 'text' })
      .pipe(
        map(url => ({
          url,
          filename: file.name,
          type: file.type
        })),
        catchError(error => {
          console.error('File upload failed:', error);
          return throwError(() => new Error('Failed to upload file. Please try again.'));
        })
      );
  }
}
