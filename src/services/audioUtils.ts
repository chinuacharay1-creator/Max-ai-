/**
 * Audio conversion utilities for Gemini Live API
 * - Input: 16kHz PCM16 Mono Little-Endian (Base64)
 * - Output: 24kHz PCM16 Mono Little-Endian (Base64)
 */

// Convert Float32Array from AudioContext to 16-bit PCM ArrayBuffer
export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return output.buffer;
}

// Convert ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert 16-bit PCM Little Endian ArrayBuffer to Float32Array
export function pcm16ToFloat32(buffer: ArrayBuffer): Float32Array {
  const dataView = new DataView(buffer);
  const length = buffer.byteLength / 2;
  const float32 = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
  }
  return float32;
}

// Simple Downsampler for converting any browser sample rate to target (16000Hz)
export function downsampleBuffer(
  buffer: Float32Array,
  sourceRate: number,
  targetRate = 16000
): Float32Array {
  if (sourceRate === targetRate) {
    return buffer;
  }
  if (sourceRate < targetRate) {
    return buffer; // Avoid upsampling artifacts
  }
  const sampleRateRatio = sourceRate / targetRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}
