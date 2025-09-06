import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<{ url: string, filename: string, type: string }> {
    const formData = new FormData();
    formData.append('file', file);

    // Nếu backend trả plain text URL
    return this.http.post('http://localhost:8080/api/files/upload', formData, { responseType: 'text' })
      .pipe(
        map(url => ({
          url,             // chuỗi URL trả về
          filename: file.name,
          type: file.type
        }))
      );
  }
}
