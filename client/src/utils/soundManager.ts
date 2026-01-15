/**
 * SoundManager - Utility for playing notification sounds
 * Uses Web Audio API for efficient sound playback
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Initialize AudioContext on first user interaction
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext() {
    try {
      const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextConstructor) {
        this.audioContext = new AudioContextConstructor();
      }
    } catch (error) {
      console.error('Web Audio API is not supported in this browser:', error);
    }
  }

  /**
   * Create a simple notification beep sound
   */
  private createBeepSound(frequency: number = 800, duration: number = 0.2): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Create a sine wave that fades out
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-3 * t);
    }

    return buffer;
  }

  /**
   * Play a notification sound
   */
  async playNotification(type: 'new-order' | 'order-ready' | 'warning' = 'new-order') {
    if (!this.enabled || !this.audioContext) return;

    try {
      // Resume audio context if suspended (required by browser autoplay policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      let buffer: AudioBuffer | null = null;

      // Get or create the sound buffer
      if (this.sounds.has(type)) {
        buffer = this.sounds.get(type)!;
      } else {
        // Create different sounds for different notification types
        switch (type) {
          case 'new-order':
            buffer = this.createBeepSound(800, 0.15);
            break;
          case 'order-ready':
            buffer = this.createBeepSound(600, 0.2);
            break;
          case 'warning':
            buffer = this.createBeepSound(400, 0.3);
            break;
        }

        if (buffer) {
          this.sounds.set(type, buffer);
        }
      }

      if (!buffer) return;

      // Create and play the sound
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.3; // 30% volume

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);

      // For new-order, play twice with a gap
      if (type === 'new-order') {
        setTimeout(() => {
          const source2 = this.audioContext!.createBufferSource();
          source2.buffer = buffer;
          source2.connect(gainNode);
          source2.start(0);
        }, 300);
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Enable or disable sounds
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Test the sound system
   */
  async test() {
    await this.playNotification('new-order');
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
export default soundManager;
