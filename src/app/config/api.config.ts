import { environment } from '../../environments/environment';

/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */
export class ApiConfig {
  // Base URLs
  static readonly BACKEND_URL = environment.backendUrl;
  static readonly API_URL = environment.apiUrl;
  
  // WebSocket
  static readonly WS_ENDPOINT = `${ApiConfig.BACKEND_URL}/ws`;
  
  // API Endpoints
  static readonly AUTH = {
    BASE: `${ApiConfig.BACKEND_URL}/api/auth`,
    LOGIN: `${ApiConfig.BACKEND_URL}/api/auth/login`,
    REGISTER: `${ApiConfig.BACKEND_URL}/api/auth/register`,
  };
  
  static readonly ROOMS = {
    BASE: `${ApiConfig.BACKEND_URL}/api/rooms`,
    CHATROOMS: `${ApiConfig.BACKEND_URL}/api/chatrooms`,
    getUsersInRoom: (roomId: string) => `${ApiConfig.ROOMS.CHATROOMS}/${roomId}/users`,
    kickUser: (roomId: string, userId: number) => `${ApiConfig.ROOMS.BASE}/${roomId}/kick/${userId}`,
  };
  
  static readonly FILES = {
    UPLOAD: `${ApiConfig.BACKEND_URL}/api/files/upload`,
  };
  
  static readonly AGORA = {
    GET_TOKEN: (channelName: string, uid: number) => 
      `${ApiConfig.BACKEND_URL}/api/agora/token?channelName=${channelName}&uid=${uid}`,
  };
  
  // STOMP Destinations
  static readonly STOMP = {
    SEND_MESSAGE: '/app/chat.sendMessage',
    ADD_USER: '/app/chat.addUser',
    ROOM_TOPIC: (roomId: string) => `/topic/room/${roomId}`,
  };
}
