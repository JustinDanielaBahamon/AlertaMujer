import { NativeModule, requireNativeModule } from "expo";

export type Reading = { x: number; y: number; z: number };

/** ApplicationExitInfo: reason (REASON_*), process importance when it died and description. */
/** State of the "Avísame si no llego" service (times in ms since epoch, 0 = never). */
export type TripServiceStatus = {
  running: boolean;
  tripId: number;
  lastSentAt: number;
  lastFixAt: number;
  /** Signals kept on the phone while offline. */
  queued: number;
  error: string | null;
};

export type TripServiceOptions = {
  tripId: number;
  /** Base URL of the service that handles /api/safe-trips. */
  baseUrl: string;
  token: string;
  destination: string;
  destLatitude?: number | null;
  destLongitude?: number | null;
  arrivalMs: number;
  /** JSON list of { name, latitude, longitude, radius } to warn her when she enters or approaches one. */
  riskZones?: string;
};

/** A file of the evidence copy kept inside the app. */
export type LocalEvidenceFile = { uri: string; name: string; sizeBytes: number; modifiedMs: number };

export type AppExit = { timestamp: number; reason: number; importance: number; description: string };

type Events = {
  /** The phone was shaken with the activation pattern (detected on the native side). */
  onShake: () => void;
  /** An evidence audio chunk finished (file ready to upload). */
  onAudioChunk: (chunk: { uri: string; durationMs: number }) => void;
  onRecordingError: (error: { message: string }) => void;
  /** The screen turned on or off (each power button press). Not sent during calls. */
  onScreenChange: (change: { screenOn: boolean }) => void;
  /** 4 presses of "volume down" within 2 s while the countdown runs (startVolumeCancel). */
  onVolumeCancel: () => void;
  /** One press of either volume key while a contact's alert alarm rings (startAlarmSilencer). */
  onAlarmSilence: () => void;
  /** The trip service got a 401: it needs a renewed session token (updateTripToken). */
  onTripAuthExpired: () => void;
  /** The trip ended from the service (arrival confirmed in the notification, or ended on the server). */
  onTripEnded: (event: { status: string }) => void;
};

declare class ShakeSensorModule extends NativeModule<Events> {
  /** The phone has an accelerometer. */
  available(): boolean;
  /** Starts the accelerometer every intervalMs (also in the background) and emits onShake on a detection. */
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
   * off; false if the microphone permission is missing. record=false keeps it running without using
   * the microphone (while the camera records video). The first chunk lasts firstSeconds. background:
   * started without the app on screen (alert by shaking), it runs under the protection service.
   */
  startAudioRecording(secondsPerChunk: number, record: boolean, firstSeconds?: number, background?: boolean): boolean;
  pauseAudioRecording(): void;
  resumeAudioRecording(): void;
  stopAudioRecording(): void;
  isAudioRecording(): boolean;
  /** Finished audio chunks still on the phone. */
  pendingAudios(): string[];
  /** Deletes an evidence file from the app cache (already uploaded). */
  deleteFile(uri: string): boolean;
  /** Moves an uploaded chunk into the app's private evidence folder; its new uri or null. */
  keepEvidence(uri: string, alertId: number): string | null;
  /** The evidence copy of an alert kept on the phone. */
  localEvidence(alertId: number): LocalEvidenceFile[];
  deleteLocalEvidence(alertId: number): boolean;
  deleteAllLocalEvidence(): boolean;
  /** Copies it to Descargas/AlertaMujer; the visible path, or null (Android 9 or older). */
  exportEvidence(uri: string): string | null;
  /** Opens the share sheet with the file. */
  shareEvidence(uri: string): boolean;
  /** Listens to "volume down" (onVolumeCancel) while the countdown runs. */
  startVolumeCancel(): void;
  stopVolumeCancel(): void;
  /** Listens to the volume keys (onAlarmSilence) while a contact's alert alarm rings. */
  startAlarmSilencer(): void;
  stopAlarmSilencer(): void;
  /** Neutral texts in the persistent notifications (protection, recording, trip). */
  setDiscreet(on: boolean): void;
  /**
   * "Avísame si no llego": a location service that sends a signal of life every 2 min (queued while
   * offline) and asks "¿Ya llegaste?" near the destination. Must be called with the app open; false if
   * the location permission is missing. Calling it again with the same trip updates it.
   */
  startTrip(options: TripServiceOptions): boolean;
  updateTripToken(token: string): void;
  stopTrip(): void;
  tripStatus(): TripServiceStatus;
  /**
   * Automatic protection: geofences around her frequent places. places / riskZones are JSON arrays
   * ({id, latitude, longitude, radius} / {name, latitude, longitude, radius}); key = undefined keeps the
   * stored one. false if "Permitir ubicación todo el tiempo" is missing.
   */
  configureAutoProtection(options: AutoProtectionOptions): boolean;
  disableAutoProtection(): void;
  /** "Detener" with her PIN: stops the running automatic protection. */
  stopAutoProtection(): void;
  /** Duress PIN: looks stopped on her phone, but her contacts are alerted silently. */
  duressAutoProtection(): void;
  /** With a cancel PIN, "Detener" opens the app to ask for it instead of stopping right away. */
  setAutoProtectionPin(required: boolean): void;
  /** "Mostrar sobre otras apps": lets a contact's alert bring the app to the front while the phone is in use. */
  canShowOverApps(): boolean;
  requestShowOverApps(): boolean;
  /** Brings the app to the front (only with "Mostrar sobre otras apps"); false if not allowed. */
  bringToFront(): boolean;
  /** Screen on and unlocked: she is using the phone right now. */
  isPhoneInUse(): boolean;
  autoProtectionStatus(): AutoProtectionStatus;
}

export type AutoProtectionOptions = { baseUrl: string; key?: string; places: string; riskZones: string };
export type AutoProtectionStatus = { enabled: boolean; permissions: boolean; running: boolean };

/** Accelerometer for "shake the phone" that does not stop when the app is minimized (Android only). */
export default requireNativeModule<ShakeSensorModule>("ShakeSensor");
