import { downsampleBuffer, floatTo16BitPCM, arrayBufferToBase64 } from "./audioUtils";

export type AudioChunkCallback = (base64Audio: string) => void;
export type VolumeCallback = (level: number) => void;

export class AudioRecorder {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private onAudioChunk: AudioChunkCallback;
  private onVolume?: VolumeCallback;
  private isMutedState = false;
  private isRecording = false;

  constructor(onAudioChunk: AudioChunkCallback, onVolume?: VolumeCallback) {
    this.onAudioChunk = onAudioChunk;
    this.onVolume = onVolume;
  }

  public async start(): Promise<void> {
    if (this.isRecording) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      const sampleRate = this.audioCtx.sampleRate;
      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);

      // Setup analyser for real-time visualizer
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.5;

      // ScriptProcessor with 4096 buffer size
      this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isRecording || this.isMutedState) {
          if (this.onVolume) this.onVolume(0);
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate RMS volume for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const normalizedVolume = Math.min(1, rms * 4.5);
        if (this.onVolume) {
          this.onVolume(normalizedVolume);
        }

        // Downsample to 16kHz for Gemini Live
        const downsampled = downsampleBuffer(inputData, sampleRate, 16000);
        const pcm16 = floatTo16BitPCM(downsampled);
        const base64 = arrayBufferToBase64(pcm16);

        this.onAudioChunk(base64);
      };

      // Connect graph
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.processorNode);
      this.processorNode.connect(this.audioCtx.destination);

      this.isRecording = true;
    } catch (err: any) {
      console.error("[AudioRecorder] Error accessing microphone:", err);
      throw err;
    }
  }

  public stop(): void {
    this.isRecording = false;

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  public setMuted(muted: boolean): void {
    this.isMutedState = muted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyserNode && !this.isMutedState && this.isRecording) {
      this.analyserNode.getByteFrequencyData(array as any);
    } else {
      array.fill(0);
    }
  }
}
