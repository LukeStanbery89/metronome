import { Platform } from 'react-native';
import { AudioBackend } from './types';
import { WebAudioBackend } from './webAudio';
import { NativeAudioBackend } from './nativeAudio';

export function createAudioBackend(): AudioBackend {
  return Platform.OS === 'web' ? new WebAudioBackend() : new NativeAudioBackend();
}
