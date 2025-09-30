# Frontend Environment Configuration

## Environment Files

### Development (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8888/.netlify/functions',
  backendUrl: 'http://localhost:8080',
  agoraAppId: '0230bbbb0b254599b2357e880af89d62',
  wsReconnectDelay: 5000,
  enableDebugLogs: true
};
```

### Production (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: '/.netlify/functions',
  backendUrl: 'https://chatplatform3-11-yl72.onrender.com',
  agoraAppId: '0230bbbb0b254599b2357e880af89d62',
  wsReconnectDelay: 5000,
  enableDebugLogs: false
};
```

## Update for Your Deployment

1. Replace `backendUrl` with your Render backend URL
2. Update `agoraAppId` with your Agora App ID
3. Set `enableDebugLogs` to `false` in production

## Build Commands

### Development
```bash
npm run start
```

### Production Build
```bash
npm run build
```

This will use `environment.prod.ts` automatically.
