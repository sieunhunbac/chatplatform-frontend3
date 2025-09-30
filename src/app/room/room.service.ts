import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfig } from '../config/api.config';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoomService {
  constructor(private http: HttpClient) {}

  /** Lấy danh sách user trong room */
  getUsersInRoom(roomId: string): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(ApiConfig.ROOMS.getUsersInRoom(roomId));
  }

  /** Lấy tất cả phòng */
  getAllRooms(): Observable<any[]> {
    return this.http.get<any[]>(ApiConfig.ROOMS.BASE);
  }
  
  /** Kick user khỏi room */
  kickUser(roomId: string, userId: number): Observable<any> {
    return this.http.delete(ApiConfig.ROOMS.kickUser(roomId, userId));
  }
}

// DTO user
export interface UserDto {
  id: number;
  username: string;
}
