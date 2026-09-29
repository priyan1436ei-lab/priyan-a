import { Platform } from 'react-native';

declare const process: { env: { [key: string]: string | undefined } };

// Android Emulator uses 10.0.2.2 to connect to local dev machine, Physical devices use LAN IP or EXPO_PUBLIC_API_URL
const DEFAULT_DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_DEV_API_URL;

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(id);
    return response;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Network request timed out. Please check your connection.');
    }
    throw err;
  }
}
