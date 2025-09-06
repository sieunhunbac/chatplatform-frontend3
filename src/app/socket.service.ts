import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';

export interface ChatMessage {
  sender: string;
  content: string;
  roomId: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'SYSTEM' | 'KICK'| 'IMAGE' | 'FILE';
  targetUid?: string | number;
  userId?: number;
  filename?: string;
  senderId?: number;
    isMine?: boolean;

}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  
  private client: Client;
  private messageSubject = new Subject<ChatMessage>();
  private isConnected = false; // ✅ Để tránh kết nối nhiều lần

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('https://chatplatform3-11-yl72.onrender.com/ws'),
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
    });
  }

  connect(roomId: string): void {
    if (this.isConnected) {
      console.log('⚠️ Already connected. Skipping...');
      return;
    }

    this.client.onConnect = () => {
      this.isConnected = true;
      console.log('✅ STOMP connected!');

      const topic = `/topic/room/${roomId}`;
      this.client.subscribe(topic, (message: IMessage) => {
        if (message.body) {
          console.log(`📩 Received from room ${roomId}:`, message.body);
          this.messageSubject.next(JSON.parse(message.body));
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
    };

    this.client.activate();
  }

  sendMessage(msg: ChatMessage) {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(msg)
      });
    } else {
      console.warn('⚠️ Not connected to STOMP.');
    }
  }

  addUser(msg: ChatMessage) {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify(msg)
      });
    } else {
      console.warn('⚠️ Not connected to STOMP.');
    }
  }

  getMessages(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  sendJoinMessage(sender: string, roomId: string): void {
  if (!this.client.connected) {
    console.warn('⚠️ Not connected to STOMP.');
    return;
  }

  const message: ChatMessage = {
    type: 'JOIN',
    sender: sender,
    roomId: roomId,
    content: '' // hoặc thêm nội dung nếu muốn
  };

  this.client.publish({
    destination: '/app/chat.addUser', // ✅ Đúng endpoint xử lý JOIN
    body: JSON.stringify(message)
  });
}


}
