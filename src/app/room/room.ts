import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { AuthService } from '../auth.service';

interface MeetingRoom {
  id: number;
  name: string;
  description?: string;
  adminId?: number;
}

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, Header, Footer],
  templateUrl: './room.html',
  styleUrls: ['./room.css']
})
export class RoomComponent implements OnInit {
  rooms: MeetingRoom[] = [];
  roomName = '';
  roomDesc = '';

  private readonly API_BASE = 'https://chatplatform3-11-yl72.onrender.com/api/rooms';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('🔧 RoomComponent init');
    this.loadRooms();
  }

  // Load danh sách phòng
  loadRooms(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<MeetingRoom[]>(this.API_BASE, headers)
      .subscribe({
        next: (data) => this.rooms = data || [],
        error: (err) => console.error('❌ Lỗi load rooms:', err)
      });
  }

  // Tạo phòng mới
  createRoom(): void {
    const adminId = this.authService.getCurrentUserId();
    if (!adminId) {
      alert('❌ Bạn chưa đăng nhập!');
      return;
    }

    if (!this.roomName.trim()) {
      alert('❌ Vui lòng nhập tên phòng!');
      return;
    }

    const body = {
      name: this.roomName,
      description: this.roomDesc,
      adminId
    };

    const headers = this.authService.getAuthHeaders();

    this.http.post<MeetingRoom>(this.API_BASE, body, headers)
      .subscribe({
        next: (newRoom) => {
          console.log('✅ Tạo phòng thành công:', newRoom);
          this.rooms.push(newRoom); // thêm vào danh sách phòng đang hiển thị
          this.roomName = '';
          this.roomDesc = '';
        },
        error: (err) => console.error('❌ Lỗi tạo phòng:', err)
      });
  }

  // Vào phòng
  enterRoom(roomId: number): void {
    this.router.navigate(['/chat', roomId]);
  }
}
