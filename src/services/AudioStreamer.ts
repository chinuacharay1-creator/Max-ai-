import { base64ToArrayBuffer, pcm16ToFloat32 } from "./audioUtils";

export type SpeakingCallback = (speaking: boolean) => void;
export type StreamerVolumeCallback = (volume: number) => void;

export class AudioStreamer {
  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private nextStartTime = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private onSpeakingChange?: SpeakingCallback;
  private onVolume?: StreamerVolumeCallback;
  private sampleRate = 24000;
  private isSpeaking = false;
  private volumeInterval: number | null = null;

  constructor(onSpeakingChange?: SpeakingCallback, onVolume?: StreamerVolumeCallback) {
    this.onSpeakingChange = onSpeakingChange;
    this.onVolume = onVolume;
  }

  private async ensureAudioContext(): Promise<AudioContext> {
    if (!this.audioCtx || this.audioCtx.state === "closed") {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: this.sampleRate });

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.6;
      this.analyserNode.connect(this.audioCtx.destination);

      this.startVolumeMonitoring();
    }

    if (this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  private startVolumeMonitoring(): void {
    if (this.volumeInterval) return;

    const dataArray = new Uint8Array(128);
    this.volumeInterval = window.setInterval(() => {
      if (!this.analyserNode || !this.isSpeaking) {
        if (this.onVolume) this.onVolume(0);
        return;
      }
      this.analyserNode.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalized = Math.min(1, avg / 120);
      if (this.onVolume) {
        this.onVolume(normalized);
      }
    }, 50);
  }

  public async playChunk(base64Audio: string): Promise<void> {
    try {
      const ctx = await this.ensureAudioContext();
      const arrayBuffer = base64ToArrayBuffer(base64Audio);
      const float32Samples = pcm16ToFloat32(arrayBuffer);

      if (float32Samples.length === 0) return;

      const audioBuffer = ctx.createBuffer(1, float32Samples.length, this.sampleRate);
      audioBuffer.copyToChannel(float32Samples as any, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.analyserNode) {
        source.connect(this.analyserNode);
      } else {
        source.connect(ctx.destination);
      }

      // Schedule gapless playback
      const currentTime = ctx.currentTime;
      const scheduledTime = Math.max(currentTime + 0.01, this.nextStartTime);
      source.start(scheduledTime);
      this.nextStartTime = scheduledTime + audioBuffer.duration;

      this.activeSources.add(source);
      this.updateSpeakingState(true);

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0 && ctx.currentTime >= this.nextStartTime - 0.05) {
          this.updateSpeakingState(false);
          this.nextStartTime = 0;
        }
      };
    } catch (err) {
      console.error("[AudioStreamer] Error playing audio chunk:", err);
    }
  }

  private updateSpeakingState(speaking: boolean): void {
    if (this.isSpeaking !== speaking) {
      this.isSpeaking = speaking;
      if (this.onSpeakingChange) {
        this.onSpeakingChange(speaking);
      }
    }
  }

  public interrupt(): void {
    // Immediately stop and drop all queued audio
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // already stopped
      }
    }
    this.activeSources.clear();
    this.nextStartTime = 0;
    this.updateSpeakingState(false);
    if (this.onVolume) {
      this.onVolume(0);
    }
  }

  public stop(): void {
    this.interrupt();
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyserNode && this.isSpeaking) {
      this.analyserNode.getByteFrequencyData(array as any);
    } else {
      array.fill(0);
    }
  }
}
