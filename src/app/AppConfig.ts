import { http } from '../services/httpClient';

export type AppMode = 'MANAGEMENT' | 'PUBLIC';

export interface AppConfig {
  mode: AppMode;
  /** UTC Instant; changes on every JVM restart / redeploy. */
  serverStartedAt: string;
}

const SERVER_STARTED_AT_STORAGE_KEY = 'atypicalbacklog.serverStartedAt';

let appConfig: AppConfig | null = null;
let deployWatchStarted = false;

async function fetchAppConfig(): Promise<AppConfig> {
  return http<AppConfig>('/api/app-config', { cache: 'no-store' });
}

/**
 * If this tab previously saw a different server start time, accept the new value and
 * force a full reload so hashed JS/CSS from the new deploy are picked up.
 * Returns true when a reload was triggered (caller should stop bootstrapping).
 */
function reloadIfServerRestarted(serverStartedAt: string): boolean {
  const previous = sessionStorage.getItem(SERVER_STARTED_AT_STORAGE_KEY);
  sessionStorage.setItem(SERVER_STARTED_AT_STORAGE_KEY, serverStartedAt);
  if (previous != null && previous !== serverStartedAt) {
    window.location.reload();
    return true;
  }
  return false;
}

/** @returns false when a deploy reload was triggered and bootstrap must stop. */
export async function loadAppConfig(): Promise<boolean> {
  try {
    const next = await fetchAppConfig();
    if (reloadIfServerRestarted(next.serverStartedAt)) {
      return false;
    }
    appConfig = next;
    return true;
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

/**
 * Re-fetch app-config when the tab becomes visible / focused so open tabs
 * pick up a redeploy without waiting for a manual refresh.
 */
export function startAppConfigDeployWatch(): void {
  if (deployWatchStarted || typeof window === 'undefined') return;
  deployWatchStarted = true;

  const check = async () => {
    if (document.visibilityState === 'hidden') return;
    try {
      const next = await fetchAppConfig();
      if (reloadIfServerRestarted(next.serverStartedAt)) return;
      if (appConfig) {
        appConfig = { ...appConfig, ...next };
      }
    } catch {
      // Ignore transient errors; next focus/visibility will retry.
    }
  };

  window.addEventListener('focus', () => {
    void check();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void check();
  });
}
