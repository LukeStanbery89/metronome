import { Platform } from 'react-native';
import { AudioBackend } from './types';
import { WebAudioBackend } from './webAudio';
import { NativeAudioBackend } from './nativeAudio';

// Picks the audio driver for the current platform. Web (including iOS
// Chrome, which is a WKWebView) uses the Web Audio API; the native app uses
// expo-audio. The Scheduler talks to whichever one through AudioBackend.
export function createAudioBackend(): AudioBackend {
  return Platform.OS === 'web' ? new WebAudioBackend() : new NativeAudioBackend();
}
