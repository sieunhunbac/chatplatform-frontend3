import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { SocketService, ChatMessage } from '../socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute } from '@angular/router';
import { RoomService, UserDto } from '../room/room.service';
import { AuthService } from '../auth.service'; 
import { HttpClient } from '@angular/common/http';
import { FileService } from '../file.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  http = inject(HttpClient);

  private boundBeforeUnloadHandler: any;
  @Input() roomId!: string;
  usersInRoom: UserDto[] = [];
  messages: ChatMessage[] = [];
  messageContent: string = '';
  sender: string = 'User1';
  currentUserId = 1; // 🔧 Tạm hard-code
  isAdmin = false;

  constructor(
    private socketService: SocketService, 
    private route: ActivatedRoute,
    private roomService: RoomService,
    private authService: AuthService,
    private fileService: FileService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.sender = currentUser.username;
    this.currentUserId = currentUser.id;
    this.isAdmin = currentUser.isAdmin;

    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
    this.loadUsers();

    this.socketService.connect(this.roomId);

    setTimeout(() => {
      this.socketService.addUser({
        sender: this.sender,
        content: '',
        roomId: this.roomId,
        type: 'JOIN',
        userId: this.currentUserId
      });
    }, 1000);

    this.socketService.getMessages().subscribe(msg => {
  if (msg.roomId === this.roomId) {
    switch (msg.type) {
      case 'CHAT':
      case 'IMAGE':
      case 'FILE':
        this.messages.push(msg);
        break;
      case 'JOIN':
      case 'LEAVE':
        this.messages.push({ sender: 'Hệ thống', content: msg.content, roomId: this.roomId, type: 'SYSTEM' });
        this.loadUsers();
        break;
    }
  }
});

    this.boundBeforeUnloadHandler = this.beforeUnloadHandler.bind(this);
    window.addEventListener('beforeunload', this.boundBeforeUnloadHandler);
  }

  sendMessage() {
  if (this.messageContent.trim() !== '') {
    const msg: ChatMessage = {
      content: this.messageContent,
      senderId: this.currentUserId,
      sender: this.sender,
      roomId: this.roomId,
      type: 'CHAT'
    };
    // Chỉ gửi socket
    this.socketService.sendMessage(msg);
    this.messageContent = '';
  }
}


  loadUsers() {
    if (!this.roomId) return;

    this.roomService.getUsersInRoom(this.roomId).subscribe({
      next: users => this.usersInRoom = users,
      error: err => console.error('Lỗi loadUsers:', err)
    });
  }

  kickUser(userId: number) {
    if (confirm('Bạn chắc chắn muốn kick user này?')) {
      this.roomService.kickUser(this.roomId, userId).subscribe({
        next: () => {
          console.log('✅ Kick thành công');
          this.loadUsers();
        },
        error: err => console.error('❌ Kick thất bại:', err)
      });
    }
  }

  beforeUnloadHandler(event: BeforeUnloadEvent) {
    const leaveMsg: ChatMessage = {
      sender: this.sender,
      content: '',
      roomId: this.roomId,
      type: 'LEAVE'
    };
    if (navigator.sendBeacon) {
      const url = 'http://localhost:8080/api/leave';
      const data = JSON.stringify(leaveMsg);
      navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
    } else {
      this.socketService.sendMessage(leaveMsg);
    }
  }

  ngOnDestroy(): void {
    const leaveMsg: ChatMessage = {
      sender: this.sender,
      content: '',
      roomId: this.roomId,
      type: 'LEAVE'
    };
    this.socketService.sendMessage(leaveMsg);
    window.removeEventListener('beforeunload', this.boundBeforeUnloadHandler);
  }

  async onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (!file) return;

  this.fileService.uploadFile(file).subscribe({
    next: (res) => {
      const msg: ChatMessage = {
        senderId: this.currentUserId,
        sender: this.sender,
        content: res.url,
        roomId: this.roomId,
        type: res.type.startsWith('image/') ? 'IMAGE' : 'FILE',
        filename: res.filename
      };
      // Chỉ gửi socket
      this.socketService.sendMessage(msg);
    },
    error: (err) => console.error('Upload failed:', err)
  });
}
}
