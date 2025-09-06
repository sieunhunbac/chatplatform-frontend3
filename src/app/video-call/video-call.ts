import { Component, AfterViewInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
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
  @Input() roomId!: string;

  private client!: IAgoraRTCClient;
  private localTracks: { videoTrack: ILocalVideoTrack | null; audioTrack: ILocalAudioTrack | null } = {
    videoTrack: null,
    audioTrack: null,
  };
  private screenTrack: ILocalTrack | null = null;

  private isCameraOn = true;
  private isMicOn = true;
  private isSharingScreen = false;

  async ngAfterViewInit() {
    if (!this.roomId) this.roomId = 'default-room';
    const channelName = this.roomId;
    const uid = Math.floor(Math.random() * 100000);
    const appId = environment.agoraAppId;

    // **URL backend deploy**
    const backendUrl = 'https://chatplatform3-11-yl72.onrender.com';

    try {
      const token = await this.http
        .get(`${backendUrl}/api/agora/token?channelName=${channelName}&uid=${uid}`, { responseType: 'text' })
        .toPromise();

      if (!token) {
        console.error('Token chưa nhận được từ backend!');
        return;
      }

      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      await this.client.join(appId, channelName, token, uid);

      // Tạo local tracks
      this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
      this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      await this.client.publish([this.localTracks.videoTrack, this.localTracks.audioTrack]);
      this.localTracks.videoTrack.play('local-player');

      // Remote users
      this.client.on('user-published', async (user, mediaType) => {
        await this.client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          const container = document.getElementById('remote-container');
          const remoteDiv = document.createElement('div');
          remoteDiv.id = `remote-${user.uid}`;
          remoteDiv.style.width = '320px';
          remoteDiv.style.height = '240px';
          remoteDiv.style.border = '1px solid gray';
          remoteDiv.style.marginBottom = '8px';
          container?.appendChild(remoteDiv);
          user.videoTrack?.play(remoteDiv);
        }
        if (mediaType === 'audio') user.audioTrack?.play();
      });

      this.client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          const remoteDiv = document.getElementById(`remote-${user.uid}`);
          remoteDiv?.remove();
        }
        if (mediaType === 'audio') user.audioTrack?.stop();
      });

    } catch (err) {
      console.error('Lỗi khi join Agora:', err);
    }
  }

  // Toggle camera
  toggleCamera() {
    if (!this.localTracks.videoTrack) return;
    this.isCameraOn = !this.isCameraOn;
    this.localTracks.videoTrack.setEnabled(this.isCameraOn);
  }

  // Toggle mic
  toggleMic() {
    if (!this.localTracks.audioTrack) return;
    this.isMicOn = !this.isMicOn;
    this.localTracks.audioTrack.setEnabled(this.isMicOn);
  }

  // Share screen
  async toggleScreenShare() {
    if (!this.isSharingScreen) {
      try {
        this.screenTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '1080p_1' }) as ILocalVideoTrack;

        if (this.localTracks.videoTrack) {
          await this.client.unpublish(this.localTracks.videoTrack);
          this.localTracks.videoTrack.stop();
        }

        await this.client.publish(this.screenTrack);
        this.screenTrack.play('local-player');
        this.isSharingScreen = true;
      } catch (err) {
        console.error('Lỗi share screen:', err);
      }
    } else {
      if (this.screenTrack) {
        await this.client.unpublish(this.screenTrack);
        this.screenTrack.stop();
        this.screenTrack.close();
        this.screenTrack = null;
      }

      if (this.localTracks.videoTrack) {
        await this.client.publish(this.localTracks.videoTrack);
        this.localTracks.videoTrack.play('local-player');
      }
      this.isSharingScreen = false;
    }
  }
}
