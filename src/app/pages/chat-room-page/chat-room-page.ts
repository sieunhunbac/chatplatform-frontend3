import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VideoCall } from '../../video-call/video-call';
import { ChatComponent } from '../../chat/chat';

@Component({
  selector: 'app-chat-room-page',
  standalone: true,
  imports: [CommonModule, VideoCall, ChatComponent],
  templateUrl: './chat-room-page.html',
  styleUrls: ['./chat-room-page.css']
})
export class ChatRoomPage {
  roomId = '';
  username = '';

  constructor(private route: ActivatedRoute, private router: Router) {
    this.roomId = this.route.snapshot.paramMap.get('roomId') ?? '';
    this.username = localStorage.getItem('username') ?? 'Guest';
  }

  leaveRoom() {
    // Ngắt kết nối WebSocket (nếu có)
    this.router.navigate(['/']);
  }
}
