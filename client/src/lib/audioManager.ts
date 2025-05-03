import { Howl } from "howler";

export type SoundType = 
  | "none" 
  | "brown-noise" 
  | "white-noise" 
  | "pink-noise" 
  | "rain" 
  | "storm" 
  | "ocean" 
  | "clock";

export type AlertSound = "bell" | "chime" | "gentle" | "digital";

interface Sound {
  howl: Howl | null;
  url: string;
  loop?: boolean;
}

class AudioManager {
  private sounds: Record<SoundType, Sound> = {
    "none": { howl: null, url: "" },
    "brown-noise": { 
      howl: null, 
      url: "/sounds/brown-noise.mp3", 
      loop: true 
    },
    "white-noise": { 
      howl: null, 
      url: "/sounds/white-noise.mp3", 
      loop: true 
    },
    "pink-noise": { 
      howl: null, 
      url: "/sounds/pink-noise.mp3", 
      loop: true 
    },
    "rain": { 
      howl: null, 
      url: "/sounds/rain.mp3", 
      loop: true 
    },
    "storm": { 
      howl: null, 
      url: "/sounds/storm.mp3", 
      loop: true 
    },
    "ocean": { 
      howl: null, 
      url: "/sounds/ocean.mp3", 
      loop: true 
    },
    "clock": { 
      howl: null, 
      url: "/sounds/clock.mp3", 
      loop: true 
    }
  };

  private alerts: Record<AlertSound, Sound> = {
    "bell": { 
      howl: null, 
      url: "/sounds/bell.mp3" 
    },
    "chime": { 
      howl: null, 
      url: "/sounds/chime.mp3" 
    },
    "gentle": { 
      howl: null, 
      url: "/sounds/gentle.mp3" 
    },
    "digital": { 
      howl: null, 
      url: "/sounds/digital.mp3" 
    }
  };

  private currentSound: SoundType = "none";
  private initialized = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize with a silent sound to unlock audio
    const silentSound = new Howl({
      src: ['data:audio/wav;base64,UklGRnoCAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoCAgAAAAA='],
      volume: 0,
      onload: () => {
        this.initialized = true;
        console.log('Audio initialized');
      },
      onloaderror: (_, err) => {
        console.error('Error initializing audio:', err);
        this.initialized = true; // Still mark as initialized even if silent sound fails
      }
    });
    silentSound.play();

    // Add click event listener to resume audio context
    document.addEventListener('click', this.resumeAudioContext.bind(this));
  }

  private async resumeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('AudioContext resumed');
      } catch (error) {
        console.error('Error resuming AudioContext:', error);
      }
    }
  }

  private createHowl(sound: Sound): Howl {
    return new Howl({
      src: [sound.url],
      loop: sound.loop || false,
      volume: 0.5,
      html5: true,
      onload: () => console.log(`Sound loaded: ${sound.url}`),
      onloaderror: (_, err) => {
        console.error(`Error loading sound:`, err);
        // Try to load the sound again after a delay
        setTimeout(() => {
          if (!sound.howl?.state()) {
            console.log(`Retrying to load sound: ${sound.url}`);
            sound.howl = this.createHowl(sound);
          }
        }, 1000);
      },
      onplayerror: (_, err) => {
        console.error(`Error playing sound:`, err);
        // Try to resume audio context if there's a play error
        this.resumeAudioContext();
      }
    });
  }

  private getSound(type: SoundType): Sound {
    const sound = this.sounds[type];
    if (!sound.howl && sound.url) {
      sound.howl = this.createHowl(sound);
    }
    return sound;
  }

  private getAlert(type: AlertSound): Sound {
    const alert = this.alerts[type];
    if (!alert.howl && alert.url) {
      alert.howl = this.createHowl(alert);
    }
    return alert;
  }

  async playSound(type: SoundType): Promise<void> {
    if (!this.initialized) {
      console.log('Audio not initialized yet');
      return;
    }

    try {
      // Ensure audio context is resumed
      await this.resumeAudioContext();

      if (this.currentSound !== "none") {
        this.stopSound();
      }

      if (type === "none") {
        this.currentSound = "none";
        return;
      }

      const sound = this.getSound(type);
      if (sound.howl) {
        const state = sound.howl.state();
        if (state === 'loaded') {
          sound.howl.play();
          this.currentSound = type;
        } else {
          console.log(`Sound ${type} not ready, state: ${state}`);
          // Wait for the sound to load
          sound.howl.once('load', () => {
            sound.howl?.play();
            this.currentSound = type;
          });
        }
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  stopSound(): void {
    if (this.currentSound !== "none") {
      const sound = this.sounds[this.currentSound];
      if (sound.howl) {
        sound.howl.stop();
      }
      this.currentSound = "none";
    }
  }

  async playAlert(type: AlertSound = "bell"): Promise<void> {
    if (!this.initialized) {
      console.log('Audio not initialized yet');
      return;
    }

    try {
      // Ensure audio context is resumed
      await this.resumeAudioContext();

      const alert = this.getAlert(type);
      if (alert.howl) {
        const state = alert.howl.state();
        if (state === 'loaded') {
          alert.howl.play();
        } else {
          console.log(`Alert ${type} not ready, state: ${state}`);
          // Wait for the alert to load
          alert.howl.once('load', () => {
            alert.howl?.play();
          });
        }
      }
    } catch (error) {
      console.error('Error playing alert:', error);
    }
  }

  setVolume(volume: number): void {
    if (this.currentSound !== "none") {
      const sound = this.sounds[this.currentSound];
      if (sound.howl) {
        sound.howl.volume(volume);
      }
    }
  }
}

export const audioManager = new AudioManager();
