import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../socket.service';
import { Input } from '@angular/core';

import AgoraRTC, {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
  ILocalTrack,
} from 'agora-rtc-sdk-ng';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.html',
})
export class VideoCall implements AfterViewInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private socketService = inject(SocketService);
  @Input() roomId!: string;

  usersInCall: number[] = [];

  // Agora
  private client!: IAgoraRTCClient;
  private localTracks = {
    videoTrack: null as ILocalVideoTrack | null,
    audioTrack: null as ILocalAudioTrack | null,
  };
  private screenTrack: ILocalTrack | null = null;

  // States
  private isCameraOn = true;
  private isMicOn = true;
  private isSharingScreen = false;

  async ngAfterViewInit() {
    console.log('📹 [VideoCall] roomId =', this.roomId);
    if (typeof window === 'undefined') return;
    const roomId = this.roomId ?? 'default-room';

    const channelName = roomId;
    const appId = environment.agoraAppId;
    const uid = Math.floor(Math.random() * 100000);

    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Lấy token từ backend
    const token = await this.http
      .get(`http://localhost:8080/api/agora/token?channelName=${channelName}&uid=${uid}`, {
        responseType: 'text',
      })
      .toPromise();

    if (!token) return;

    // Join Agora
    await this.client.join(appId, channelName, null, uid);

    const senderName = 'User ' + uid;
    this.socketService.connect(roomId);
    setTimeout(() => {
      this.socketService.sendJoinMessage(senderName, roomId);
    }, 1000);

    // Khi user khác publish
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);

      if (mediaType === 'video') {
        const remoteContainer = document.getElementById('remote-container');
        const remoteDiv = document.createElement('div');
        remoteDiv.id = `remote-${user.uid}`;
        remoteDiv.style.width = '320px';
        remoteDiv.style.height = '240px';
        remoteDiv.style.border = '1px solid gray';
        remoteDiv.style.marginBottom = '8px';
        remoteContainer?.appendChild(remoteDiv);

        user.videoTrack?.play(remoteDiv);
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });

    // Khi user rời
    this.client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        const remoteDiv = document.getElementById(`remote-${user.uid}`);
        if (remoteDiv) remoteDiv.remove();
      }
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
    });

    // Local tracks
    this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
    this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    await this.client.publish([this.localTracks.videoTrack, this.localTracks.audioTrack]);

    // Local video element
    const localVideoEl = document.querySelector('video');
    if (localVideoEl) {
      this.localTracks.videoTrack.play(localVideoEl);
    }

    // Buttons
    this.attachToggleButtons();
  }

  private attachToggleButtons() {
    const camBtn = document.getElementById('toggle-camera');
    const micBtn = document.getElementById('toggle-mic');
    const shareBtn = document.getElementById('share-screen');

    camBtn?.addEventListener('click', () => {
      if (this.localTracks.videoTrack) {
        this.localTracks.videoTrack.setEnabled(!this.isCameraOn);
        this.isCameraOn = !this.isCameraOn;
      }
    });

    micBtn?.addEventListener('click', () => {
      if (this.localTracks.audioTrack) {
        this.localTracks.audioTrack.setEnabled(!this.isMicOn);
        this.isMicOn = !this.isMicOn;
      }
    });

    shareBtn?.addEventListener('click', async () => {
      await this.toggleScreenShare();
    });
  }

  // ✅ Hàm chia sẻ màn hình
  private async toggleScreenShare() {
  if (!this.isSharingScreen) {
    try {
      // Lấy track màn hình
      const screenTrack = await AgoraRTC.createScreenVideoTrack(
        { encoderConfig: "1080p_1" }
      ) as ILocalVideoTrack;

      this.screenTrack = screenTrack;

      // Tắt camera nếu đang mở
      if (this.localTracks.videoTrack) {
        await this.client.unpublish(this.localTracks.videoTrack);
        this.localTracks.videoTrack.stop();
      }

      // Publish màn hình
      await this.client.publish(this.screenTrack);

      // Hiển thị lên giao diện local
      this.screenTrack.play("local-player");

      this.isSharingScreen = true;
    } catch (error) {
      console.error("Lỗi share screen:", error);
    }
  } else {
    // Ngưng share
    if (this.screenTrack) {
      await this.client.unpublish(this.screenTrack);
      this.screenTrack.stop();
      this.screenTrack.close();
      this.screenTrack = null;
    }

    // Bật lại camera
    if (this.localTracks.videoTrack) {
      await this.client.publish(this.localTracks.videoTrack);
      this.localTracks.videoTrack.play("localVideo");
    }

    this.isSharingScreen = false;
  }
}
}
