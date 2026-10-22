import { NativeModule, requireNativeModule } from "expo";

export type Reading = { x: number; y: number; z: number };

/** ApplicationExitInfo: reason (REASON_*), process importance when it died and description. */
export type AppExit = { timestamp: number; reason: number; importance: number; description: string };

type Events = {
  onReading: (reading: Reading) => void;
  /** An evidence audio chunk finished (file ready to upload). */
  onAudioChunk: (chunk: { uri: string; durationMs: number }) => void;
  onRecordingError: (error: { message: string }) => void;
  /** The screen turned on or off (each power button press). Not sent during calls. */
  onScreenChange: (change: { screenOn: boolean }) => void;
};

declare class ShakeSensorModule extends NativeModule<Events> {
  /** The phone has an accelerometer. */
  available(): boolean;
  /** Starts emitting onReading (in g) every intervalMs, also in the background. */
  start(intervalMs: number): boolean;
  stop(): void;
  /** Starts emitting onScreenChange with each power button press. */
  startPowerButton(): void;
  stopPowerButton(): void;
  /** Waits with a native timer (keeps running with the screen off). */
  wait(ms: number): Promise<void>;
  ignoresBatteryOptimization(): boolean;
  /** false if the app already had the permission or it failed: the app's page in Settings was opened. */
  requestIgnoreBatteryOptimization(): boolean;
  manufacturer(): string;
  /** App exits recorded by Android (11+) since sinceMs. */
  exitReasons(sinceMs: number): AppExit[];
  canUseFullScreen(): boolean;
  requestFullScreen(): void;
  hasAutoStartSetting(): boolean;
  /** Opens the brand's "auto start" screen; false if it does not exist and the app info was opened. */
  openAutoStart(): boolean;
  /**
   * Microphone service for an alert's evidence: records in chunks and keeps going with the screen
   * off. It can only be started with the app open; false if the microphone permission is missing.
   * record=false keeps it running without using the microphone (while the camera records video).
   */
  startAudioRecording(secondsPerChunk: number, record: boolean): boolean;
  pauseAudioRecording(): void;
  resumeAudioRecording(): void;
  stopAudioRecording(): void;
  isAudioRecording(): boolean;
  /** Finished audio chunks still on the phone. */
  pendingAudios(): string[];
  /** Deletes an evidence file from the app cache (already uploaded). */
  deleteFile(uri: string): boolean;
}

/** Accelerometer for "shake the phone" that does not stop when the app is minimized (Android only). */
export default requireNativeModule<ShakeSensorModule>("ShakeSensor");
