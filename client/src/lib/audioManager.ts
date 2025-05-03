import { Howl } from "howler";

export type SoundType = 
  | "none" 
  | "crowd-talking" 
  | "ocean-wave-1" 
  | "ocean-wave-2" 
  | "rain-07";

export type AlertSound = "bell-ring-01" | "bell-ringing-03a" | "bell-ringing-05";

interface Sound {
  howl: Howl | null;
  url: string;
  loop?: boolean;
}

class AudioManager {
  private sounds: Record<SoundType, Sound> = {
    "none": { howl: null, url: "" },
    "crowd-talking": { 
      howl: null, 
      url: "/sounds/crowd-talking-2.mp3", 
      loop: true 
    },
    "ocean-wave-1": { 
      howl: null, 
      url: "/sounds/ocean-wave-1.mp3", 
      loop: true 
    },
    "ocean-wave-2": { 
      howl: null, 
      url: "/sounds/ocean-wave-2.mp3", 
      loop: true 
    },
    "rain-07": { 
      howl: null, 
      url: "/sounds/rain-07.mp3", 
      loop: true 
    }
  };

  private alerts: Record<AlertSound, Sound> = {
    "bell-ring-01": { 
      howl: null, 
      url: "/sounds/bell-ring-01.mp3" 
    },
    "bell-ringing-03a": { 
      howl: null, 
      url: "/sounds/bell-ringing-03a.mp3" 
    },
    "bell-ringing-05": { 
      howl: null, 
      url: "/sounds/bell-ringing-05.mp3" 
    }
  };

  private currentSound: SoundType = "none";
  private initialized = false;
  private audioContext: AudioContext | null = null;
  private userInteracted = false;

  constructor() {
    // Add click event listener to handle user interaction
    document.addEventListener('click', this.handleUserInteraction.bind(this));
    document.addEventListener('keydown', this.handleUserInteraction.bind(this));
    document.addEventListener('touchstart', this.handleUserInteraction.bind(this));
  }

  private handleUserInteraction(): void {
    if (!this.userInteracted) {
      this.userInteracted = true;
      this.initializeAudio();
    }
  }

  private async initializeAudio(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create and resume audio context
      this.audioContext = new AudioContext();
      await this.audioContext.resume();
      
      // Initialize with a silent sound
      const silentSound = new Howl({
        src: ['data:audio/wav;base64,UklGRnoCAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoCAgAAAAA='],
        volume: 0,
        onload: () => {
          this.initialized = true;
          console.log('Audio initialized');
          // Preload all sounds after initialization
          this.preloadSounds();
        },
        onloaderror: (_, err) => {
          console.error('Error initializing audio:', err);
          this.initialized = true; // Still mark as initialized even if silent sound fails
          // Preload all sounds even if initialization fails
          this.preloadSounds();
        }
      });
      silentSound.play();
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  private preloadSounds(): void {
    // Preload all sounds
    Object.entries(this.sounds).forEach(([type, sound]) => {
      if (type !== "none" && sound.url) {
        this.getSound(type as SoundType);
      }
    });

    // Preload all alerts
    Object.entries(this.alerts).forEach(([type, alert]) => {
      if (alert.url) {
        this.getAlert(type as AlertSound);
      }
    });
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
      preload: true,
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
    if (!this.userInteracted) {
      console.log('Waiting for user interaction before playing sound');
      return;
    }

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

  async playAlert(type: AlertSound = "bell-ring-01"): Promise<void> {
    if (!this.userInteracted) {
      console.log('Waiting for user interaction before playing alert');
      return;
    }

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
