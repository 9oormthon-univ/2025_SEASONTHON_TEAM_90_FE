import { Platform } from 'react-native';

export const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080' // ✅ Android Emulator → PC localhost
    : 'http://localhost:8080'; // iOS Simulator or Web
