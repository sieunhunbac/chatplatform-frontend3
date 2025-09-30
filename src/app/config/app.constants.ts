/**
 * Application Constants
 * Contains all constant values used across the application
 */
export class AppConstants {
  // LocalStorage Keys
  static readonly STORAGE = {
    TOKEN: 'token',
    USER: 'user',
    USERNAME: 'username',
  };
  
  // WebSocket Configuration
  static readonly WEBSOCKET = {
    RECONNECT_DELAY: 5000,
    JOIN_DELAY: 1000, // Delay before sending JOIN message
  };
  
  // Agora Configuration
  static readonly AGORA = {
    APP_ID: '0230bbbb0b254599b2357e880af89d62', // Should be in environment
    CODEC: 'vp8',
    MODE: 'rtc',
    SCREEN_ENCODER_CONFIG: '1080p_1',
  };
  
  // File Upload Configuration
  static readonly FILE = {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
  };
  
  // UI Configuration
  static readonly UI = {
    DEFAULT_ROOM_ID: 'default-room',
    VIDEO_DIMENSIONS: {
      LOCAL: { width: 320, height: 240 },
      REMOTE: { width: 320, height: 240 },
    },
  };
  
  // Message Types
  static readonly MESSAGE_TYPES = {
    CHAT: 'CHAT',
    JOIN: 'JOIN',
    LEAVE: 'LEAVE',
    SYSTEM: 'SYSTEM',
    KICK: 'KICK',
    IMAGE: 'IMAGE',
    FILE: 'FILE',
  } as const;
}
