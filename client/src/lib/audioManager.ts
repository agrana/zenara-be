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
      url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_2de89c3def.mp3?filename=brown-noise-20602.mp3", 
      loop: true 
    },
    "white-noise": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_22588b738a.mp3?filename=white-noise-20-minutes-74577.mp3", 
      loop: true 
    },
    "pink-noise": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2022/11/17/audio_0e31dc3bef.mp3?filename=pink-noise-20-min-163366.mp3", 
      loop: true 
    },
    "rain": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2021/08/12/audio_36781c2f47.mp3?filename=light-rain-ambient-114354.mp3", 
      loop: true 
    },
    "storm": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_a4f8cc3e31.mp3?filename=storm-thunder-nature-sounds-125237.mp3", 
      loop: true 
    },
    "ocean": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_54ca2dc150.mp3?filename=ocean-waves-112924.mp3", 
      loop: true 
    },
    "clock": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3?filename=clock-ticking-60-second-loop-443.mp3", 
      loop: true 
    }
  };

  private alerts: Record<AlertSound, Sound> = {
    "bell": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=meditation-bell-sound-64368.mp3" 
    },
    "chime": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2022/10/30/audio_f1b4f0fbcc.mp3?filename=fairy-chimes-180352.mp3" 
    },
    "gentle": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0b9b82326.mp3?filename=alert-gentle-745.mp3" 
    },
    "digital": { 
      howl: null, 
      url: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_c8c8a73471.mp3?filename=digital-alarm-clock-151918.mp3" 
    }
  };

  private currentSound: SoundType = "none";

  constructor() {
    this.preloadAlerts();
  }

  private preloadAlerts() {
    Object.keys(this.alerts).forEach((key) => {
      const alertType = key as AlertSound;
      const sound = this.alerts[alertType];
      
      if (sound.url) {
        sound.howl = new Howl({
          src: [sound.url],
          preload: true,
          volume: 0.7,
        });
      }
    });
  }

  private loadSound(type: SoundType): Promise<void> {
    return new Promise((resolve) => {
      if (type === "none") {
        resolve();
        return;
      }

      const sound = this.sounds[type];
      
      if (!sound.howl && sound.url) {
        sound.howl = new Howl({
          src: [sound.url],
          loop: sound.loop || false,
          volume: 0.5,
          onload: () => resolve(),
        });
      } else {
        resolve();
      }
    });
  }

  async playSound(type: SoundType): Promise<void> {
    if (this.currentSound !== "none") {
      this.stopSound();
    }

    if (type === "none") {
      this.currentSound = "none";
      return;
    }

    await this.loadSound(type);
    const sound = this.sounds[type];
    
    if (sound.howl) {
      sound.howl.play();
      this.currentSound = type;
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
    const alert = this.alerts[type];
    
    if (alert.howl) {
      alert.howl.play();
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
