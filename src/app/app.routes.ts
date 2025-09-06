import { Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { VideoCall } from './video-call/video-call';
import { ChatRoomPage } from './pages/chat-room-page/chat-room-page'; // đường dẫn đúng
import { HomeComponent } from './home/home';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then(m => m.HomeComponent)  // đổi thành trang chủ
  },
  {
    path: 'room',
    loadComponent: () => import('./room/room').then(m => m.RoomComponent)  // nếu bạn muốn sảnh phòng riêng
  },
  {
    path: 'chat-room/:roomId',
    loadComponent: () => import('./pages/chat-room-page/chat-room-page').then(m => m.ChatRoomPage)
  },
  {
    path: 'video/:roomId',
    component: VideoCall,
  },
  {
    path: 'chat/:roomId',
    loadComponent: () => import('./pages/chat-room-page/chat-room-page').then(m => m.ChatRoomPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login)
  },
  // {
  //   path: 'register',
  //   loadComponent: () => import('./register/register').then(m => m.Register)
  // },
];
