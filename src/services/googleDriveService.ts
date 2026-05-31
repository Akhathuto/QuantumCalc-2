
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const FILE_NAME = 'quantum_calc_profile.json';

// Global state trackers for coalesced sync saving
let syncDebounceTimeout: any = null;
let activeSyncPromise: Promise<void> | null = null;
let lastSyncTime = 0;
const MIN_SYNC_INTERVAL = 8000; // At most once every 8 seconds to guard API rates

export interface UserProfileData {
  role: string;
  grade?: string;
  school?: string;
  onboarded: boolean;
  lastSynced?: string;
  calcHistory?: string;
  quantum_notes?: string;
  localStorageDump?: Record<string, string>;
}

export const googleDriveService = {
  async findProfileFile(accessToken: string): Promise<string | null> {
    const query = encodeURIComponent(`name = '${FILE_NAME}' and trashed = false and 'appDataFolder' in parents`);
    const response = await fetch(`${DRIVE_API_URL}?spaces=appDataFolder&q=${query}&fields=files(id, name)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to search Google Drive: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  },

  async saveProfile(accessToken: string, data: UserProfileData): Promise<void> {
    const fileId = await this.findProfileFile(accessToken);
    const syncedData = { ...data, lastSynced: new Date().toISOString() };
    
    if (fileId) {
      // Update existing file
      const response = await fetch(`${UPLOAD_API_URL}/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile on Google Drive');
      }
    } else {
      // Create new file using multipart upload
      const metadata = {
        name: FILE_NAME,
        mimeType: 'application/json',
        parents: ['appDataFolder'],
      };

      const boundary = 'quantum_calc_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const body =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(syncedData) +
        closeDelimiter;

      const response = await fetch(`${UPLOAD_API_URL}?uploadType=multipart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: body,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create profile on Google Drive: ${error.error?.message || response.statusText}`);
      }
    }
  },

  async getProfile(accessToken: string): Promise<UserProfileData | null> {
    try {
      const fileId = await this.findProfileFile(accessToken);
      if (!fileId) return null;

      const response = await fetch(`${DRIVE_API_URL}/${fileId}?alt=media`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to read profile from Google Drive');
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  },

  triggerAutoSync(accessToken: string): void {
    const autoSyncEnabled = localStorage.getItem('google_drive_auto_sync') === 'true';
    if (!autoSyncEnabled) return;

    if (syncDebounceTimeout) {
      clearTimeout(syncDebounceTimeout);
    }

    syncDebounceTimeout = setTimeout(() => {
      this.executeAutoSync(accessToken);
    }, 3500); // 3.5 seconds silence debounce
  },

  async executeAutoSync(accessToken: string): Promise<void> {
    if (activeSyncPromise) {
      // If a sync operation is currently active, queue another cycle after it finishes
      activeSyncPromise.then(() => {
        this.triggerAutoSync(accessToken);
      });
      return;
    }

    const now = Date.now();
    const elapsedSinceLastSync = now - lastSyncTime;
    if (elapsedSinceLastSync < MIN_SYNC_INTERVAL) {
      // Rate-limit guard: defer execution to respect Google API quota buckets
      const waitTime = MIN_SYNC_INTERVAL - elapsedSinceLastSync;
      if (syncDebounceTimeout) clearTimeout(syncDebounceTimeout);
      syncDebounceTimeout = setTimeout(() => {
        this.executeAutoSync(accessToken);
      }, waitTime);
      return;
    }

    try {
      const dump: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== 'google_access_token' && !key.includes('firebase:authUser') && !key.startsWith('firebase:')) {
          const val = localStorage.getItem(key);
          if (val !== null) {
            dump[key] = val;
          }
        }
      }

      const fullBackupData = {
        role: localStorage.getItem('profile_role') || 'normal_user',
        onboarded: true,
        calcHistory: localStorage.getItem('calcHistory') || '',
        quantum_notes: localStorage.getItem('quantum_notes') || '',
        localStorageDump: dump
      };

      console.log('[Google Drive] Initiating coalesced background backup cycle...');
      activeSyncPromise = this.saveProfile(accessToken, fullBackupData);
      await activeSyncPromise;
      lastSyncTime = Date.now();
      console.log('[Google Drive] Background backup sync executed successfully.');
    } catch (err: any) {
      console.warn('[Google Drive] Coalesced write warning:', err.message || err);
    } finally {
      activeSyncPromise = null;
    }
  }
};

export function triggerCloudSync(): void {
  try {
    window.dispatchEvent(new CustomEvent('trigger-cloud-sync'));
  } catch (e) {
    console.warn('Sync trigger event delivery failed:', e);
  }
}

