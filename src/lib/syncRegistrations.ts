import registrationService from '@/services/registrations';
import { getUnsyncedRegistrations, markRegistrationSynced } from './offlineRegistrations';

export async function syncOfflineRegistrations() {
  const unsynced = await getUnsyncedRegistrations();

  for (const record of unsynced) {
    try {
      await registrationService.create(record);
      await markRegistrationSynced(record.local_id);
    } catch (err) {
      console.error('Failed to sync one registration:', err);
    }
  }
}
