import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Option 1: Use service account file path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(path.resolve(serviceAccountPath));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized with service account file');
      return firebaseApp;
    }

    // Option 2: Use individual environment variables
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('Firebase Admin initialized with environment variables');
      return firebaseApp;
    }

    throw new Error(
      'Firebase configuration not found. Please set FIREBASE_SERVICE_ACCOUNT_PATH or provide FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL'
    );
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
};

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; token: string; error?: Error }> => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token: fcmToken,
      android: {
        priority: 'high' as const,
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent push notification:', response);
    return { success: true, token: fcmToken };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, token: fcmToken, error: error as Error };
  }
};

export const sendPushNotificationToMultiple = async (
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<Array<{ success: boolean; token: string; error?: Error }>> => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin not initialized');
  }

  if (fcmTokens.length === 0) {
    return [];
  }

  try {
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens: fcmTokens,
      android: {
        priority: 'high' as const,
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} push notifications`);
    if (response.failureCount > 0) {
      console.error(`Failed to send ${response.failureCount} push notifications`);
    }

    // Map responses to tokens
    const results: Array<{ success: boolean; token: string; error?: Error }> = [];
    response.responses.forEach((resp, idx) => {
      results.push({
        success: resp.success,
        token: fcmTokens[idx],
        error: resp.error ? new Error(resp.error.message) : undefined,
      });
    });

    return results;
  } catch (error) {
    console.error('Error sending push notifications:', error);
    // Return all as failed
    return fcmTokens.map((token) => ({
      success: false,
      token,
      error: error as Error,
    }));
  }
};

export default firebaseApp;
