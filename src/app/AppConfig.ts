export type AppMode = 'MANAGEMENT' | 'PUBLIC';

export interface AppConfig {
  mode: AppMode;
}

let appConfig: AppConfig | null = null;

export async function loadAppConfig(): Promise<void> {
  const response = await fetch('/app-config', {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to load app config (${response.status})`);
  }

  appConfig = (await response.json()) as AppConfig;
}

export function getAppConfig(): AppConfig {
  if (!appConfig) {
    throw new Error('App config not initialized');
  }
  return appConfig;
}

