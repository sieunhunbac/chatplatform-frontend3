// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/.netlify/functions',   // relative path đúng trên Netlify
  backendUrl: 'https://chatplatform3-11-yl72.onrender.com',
  agoraAppId: '0230bbbb0b254599b2357e880af89d62',
  wsReconnectDelay: 5000,
  enableDebugLogs: false
};