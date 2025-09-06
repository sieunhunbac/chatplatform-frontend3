import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class RoomService {
  // URL backend public
  private baseUrl = 'https://chatplatform3-11-yl72.onrender.com/api/chatrooms';
  private roomsUrl = 'https://chatplatform3-11-yl72.onrender.com/api/rooms';

  constructor(private http: HttpClient) {}

  // Lấy danh sách user trong room
  getUsersInRoom(roomId: string) {
    return this.http.get<UserDto[]>(`${this.baseUrl}/${roomId}/users`);
  }

  // Lấy tất cả phòng
  getAllRooms() {
    return this.http.get<any[]>(this.roomsUrl);
  }
  
  // Kick user khỏi room
  kickUser(roomId: string, userId: number) {
    return this.http.delete(`${this.roomsUrl}/${roomId}/kick/${userId}`);
  }
}

// DTO user
export interface UserDto {
  id: number;
  username: string;
}
