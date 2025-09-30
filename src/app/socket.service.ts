import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { ApiConfig } from './config/api.config';
import { AppConstants } from './config/app.constants';
import { environment } from '../environments/environment';

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
  private isConnected = false;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(ApiConfig.WS_ENDPOINT),
      reconnectDelay: environment.wsReconnectDelay,
      debug: environment.enableDebugLogs ? (str) => console.log('[STOMP]', str) : () => {},
    });
  }

  connect(roomId: string): void {
    if (this.isConnected) {
      if (environment.enableDebugLogs) {
        console.log('⚠️ Already connected. Skipping...');
      }
      return;
    }

    this.client.onConnect = () => {
      this.isConnected = true;
      if (environment.enableDebugLogs) {
        console.log('✅ STOMP connected!');
      }

      const topic = ApiConfig.STOMP.ROOM_TOPIC(roomId);
      this.client.subscribe(topic, (message: IMessage) => {
        if (message.body) {
          if (environment.enableDebugLogs) {
            console.log(`📩 Received from room ${roomId}:`, message.body);
          }
          this.messageSubject.next(JSON.parse(message.body));
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
      this.isConnected = false;
      // Auto-reconnect handled by client
    };

    this.client.onDisconnect = () => {
      if (environment.enableDebugLogs) {
        console.log('🔌 STOMP disconnected');
      }
      this.isConnected = false;
    };

    this.client.activate();
  }

  sendMessage(msg: ChatMessage) {
    if (this.client.connected) {
      this.client.publish({
        destination: ApiConfig.STOMP.SEND_MESSAGE,
        body: JSON.stringify(msg)
      });
    } else {
      console.warn('⚠️ Not connected to STOMP. Message not sent.');
    }
  }

  addUser(msg: ChatMessage) {
    if (this.client.connected) {
      this.client.publish({
        destination: ApiConfig.STOMP.ADD_USER,
        body: JSON.stringify(msg)
      });
    } else {
      console.warn('⚠️ Not connected to STOMP. User not added.');
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
      content: ''
    };

    this.client.publish({
      destination: ApiConfig.STOMP.ADD_USER,
      body: JSON.stringify(message)
    });
  }

  disconnect(): void {
    if (this.client.connected) {
      this.client.deactivate();
      this.isConnected = false;
      if (environment.enableDebugLogs) {
        console.log('🔌 STOMP manually disconnected');
      }
    }
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }


}
