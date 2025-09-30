import { Component, AfterViewInit, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiConfig } from '../config/api.config';
import { AppConstants } from '../config/app.constants';
import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack, ILocalAudioTrack, ILocalTrack, UID } from 'agora-rtc-sdk-ng';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.html',
})
export class VideoCall implements AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  @Input() roomId!: string;

  private client!: IAgoraRTCClient;
  private localTracks: { videoTrack: ILocalVideoTrack | null; audioTrack: ILocalAudioTrack | null } = { videoTrack: null, audioTrack: null };
  private screenTrack: ILocalTrack | null = null;

  isCameraOn = true;
  isMicOn = true;
  isSharingScreen = false;
  private uid!: UID;
  isJoining = false;
  errorMessage = '';

  async ngAfterViewInit() {
    if (!this.roomId) {
      this.roomId = AppConstants.UI.DEFAULT_ROOM_ID;
    }
    
    const channelName = this.roomId;
    this.uid = Math.floor(Math.random() * 100000);
    const appId = environment.agoraAppId;

    try {
      this.isJoining = true;
      
      // Fetch token from backend
      const token = await this.http
        .get(ApiConfig.AGORA.GET_TOKEN(channelName, this.uid), { responseType: 'text' })
        .toPromise();
        
      if (environment.enableDebugLogs) {
        console.log('UID:', this.uid, 'Token:', token);
      }
      
      if (!token) {
        throw new Error('Token không hợp lệ!');
      }

      // Join channel
      this.client = AgoraRTC.createClient({ 
        mode: AppConstants.AGORA.MODE as 'rtc', 
        codec: AppConstants.AGORA.CODEC as 'vp8' 
      });
      
      await this.client.join(appId, channelName, token, this.uid);
      
      if (environment.enableDebugLogs) {
        console.log('Joined channel with UID:', this.uid);
      }

      // Create local tracks
      this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
      this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      // Publish
      await this.client.publish([this.localTracks.videoTrack, this.localTracks.audioTrack]);
      this.localTracks.videoTrack.play('local-player');
      
      if (environment.enableDebugLogs) {
        console.log('Local video published');
      }
      
      this.isJoining = false;

      // Handle remote users
      this.client.on('user-published', async (user, mediaType) => {
        await this.client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          const container = document.getElementById('remote-container');
          let remoteDiv = document.getElementById(`remote-${user.uid}`);
          if (!remoteDiv && container) {
            remoteDiv = document.createElement('div');
            remoteDiv.id = `remote-${user.uid}`;
            remoteDiv.style.width = `${AppConstants.UI.VIDEO_DIMENSIONS.REMOTE.width}px`;
            remoteDiv.style.height = `${AppConstants.UI.VIDEO_DIMENSIONS.REMOTE.height}px`;
            remoteDiv.style.border = '1px solid gray';
            remoteDiv.style.marginBottom = '8px';
            remoteDiv.style.borderRadius = '8px';
            remoteDiv.style.overflow = 'hidden';
            container.appendChild(remoteDiv);
          }
          user.videoTrack?.play(remoteDiv!);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      this.client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          const remoteDiv = document.getElementById(`remote-${user.uid}`);
          remoteDiv?.remove();
        }
        if (mediaType === 'audio') {
          user.audioTrack?.stop();
        }
      });

    } catch (err) {
      console.error('❌ Lỗi khi join Agora:', err);
      this.errorMessage = 'Không thể kết nối video call. Vui lòng thử lại.';
      this.isJoining = false;
    }
  }

  toggleCamera() {
    if (this.localTracks.videoTrack) {
      this.isCameraOn = !this.isCameraOn;
      this.localTracks.videoTrack.setEnabled(this.isCameraOn);
    }
  }

  toggleMic() {
    if (this.localTracks.audioTrack) {
      this.isMicOn = !this.isMicOn;
      this.localTracks.audioTrack.setEnabled(this.isMicOn);
    }
  }

  async toggleScreenShare() {
    try {
      if (!this.isSharingScreen) {
        this.screenTrack = await AgoraRTC.createScreenVideoTrack({ 
          encoderConfig: AppConstants.AGORA.SCREEN_ENCODER_CONFIG as '1080p_1'
        }) as ILocalVideoTrack;
        
        if (this.localTracks.videoTrack) {
          await this.client.unpublish(this.localTracks.videoTrack);
          this.localTracks.videoTrack.stop();
        }
        
        await this.client.publish(this.screenTrack);
        this.screenTrack.play('local-player');
        this.isSharingScreen = true;
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
    } catch (err) {
      console.error('❌ Screen share error:', err);
      this.isSharingScreen = false;
    }
  }

  async ngOnDestroy() {
    try {
      // Close local tracks
      this.localTracks.videoTrack?.stop();
      this.localTracks.videoTrack?.close();
      this.localTracks.audioTrack?.stop();
      this.localTracks.audioTrack?.close();
      
      // Close screen track if exists
      if (this.screenTrack) {
        this.screenTrack.stop();
        this.screenTrack.close();
      }
      
      // Leave channel
      if (this.client) {
        await this.client.leave();
        if (environment.enableDebugLogs) {
          console.log('Left Agora channel');
        }
      }
    } catch (err) {
      console.error('❌ Error during cleanup:', err);
    }
  }
}
