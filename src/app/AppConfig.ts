import { http } from '../services/httpClient';

export type AppMode = 'MANAGEMENT' | 'PUBLIC';

export interface AppConfig {
  mode: AppMode;
}

let appConfig: AppConfig | null = null;

export async function loadAppConfig(): Promise<void> {
  try {
    appConfig = await http<AppConfig>('/api/app-config');
  } catch (e) {
    throw new Error(
      `Failed to load app config: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

export function getAppConfig(): AppConfig {
  if (!appConfig) {
    throw new Error('App config not initialized');
  }
  return appConfig;
}

export function isManagementMode(): boolean {
  return getAppConfig().mode === 'MANAGEMENT';
}

/** Safe before config load (e.g. bootstrap); used for fetch cache policy. */
export function isPublicMode(): boolean {
  return appConfig?.mode === 'PUBLIC';
}

