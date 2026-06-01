
import { auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  
  // Check if this is a "permission-denied" or security rule block
  const isPermissionError = 
    errMsg.includes('Missing or insufficient permissions') || 
    errMsg.includes('permission-denied') || 
    (error as any)?.code === 'permission-denied' ||
    (error as any)?.code === 'firestore/permission-denied';

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  let jsonError: string;
  try {
    jsonError = JSON.stringify(errInfo);
  } catch (stringifyError) {
    console.error('Failed to stringify Firestore error info:', stringifyError);
    // Fallback to a simpler, guaranteed safe structure
    jsonError = JSON.stringify({
      error: errInfo.error,
      operationType: errInfo.operationType,
      path: errInfo.path,
      message: 'Full error details could not be serialized'
    });
  }

  if (isPermissionError) {
    console.error('Firestore Security Rule Blocked: ', jsonError);
    throw new Error(jsonError);
  } else {
    // Non-blocking graceful degradation logs for offline/network issues
    console.warn(`[Firestore Graceful Degradation] Operational warning during '${operationType}' at path '${path}':`, errMsg);
  }
}
