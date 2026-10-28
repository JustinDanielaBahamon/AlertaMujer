/**
 * Recording plan of an alert (decided with the team after analysing real situations):
 *  - first 5 minutes: video (the most useful to identify who and where), in chunks of 10 s first and
 *    then 20 s, so the contacts see something within seconds and little is lost if the phone is taken;
 *  - then audio only, in chunks of 30 s (the first one 10 s): about 5 times lighter than video, so an
 *    alert weighs ~25 MB instead of ~75 MB on the server.
 * Without the app on screen Android does not allow the camera: there it is audio from the start.
 */
export const VIDEO_PHASE_MS = 5 * 60 * 1000;
export const FIRST_VIDEO_SECONDS = 10;
export const VIDEO_SECONDS = 20;
export const AUDIO_SECONDS = 30;
export const FIRST_AUDIO_SECONDS = 10;
