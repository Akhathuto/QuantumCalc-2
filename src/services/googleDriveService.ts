
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const FILE_NAME = 'quantum_calc_profile.json';

export interface UserProfileData {
  role: string;
  grade?: string;
  school?: string;
  onboarded: boolean;
  lastSynced?: string;
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
  }
};
