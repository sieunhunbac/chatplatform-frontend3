import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/files';

  constructor(private http: HttpClient) {}

  // Upload file
  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // 👈 trùng với @RequestParam("file")

    return this.http.post(this.apiUrl + '/upload', formData, { responseType: 'text' });
  }

  // Gửi tin nhắn (tùy bạn đã làm WebSocket hay REST)
  sendMessage(message: string) {
    // Ví dụ: gửi qua WebSocket
    // socketService.sendMessage(message);

    // Nếu bạn đang dùng REST thì đổi sang http.post
  }
}
