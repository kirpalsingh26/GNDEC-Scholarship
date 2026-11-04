import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

let vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
let vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:scholarship@gndec.ac.in';

// File where generated VAPID keys persist if not specified in .env
const vapidKeyPath = path.resolve(process.cwd(), '.vapid.json');

export const initVapidKeys = () => {
  if (!vapidPublicKey || !vapidPrivateKey) {
    if (fs.existsSync(vapidKeyPath)) {
      try {
        const stored = JSON.parse(fs.readFileSync(vapidKeyPath, 'utf8'));
        vapidPublicKey = stored.publicKey;
        vapidPrivateKey = stored.privateKey;
      } catch (err) {
        console.warn('⚠️ Could not parse .vapid.json, generating fresh keys...');
      }
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.log('🔑 Generating new VAPID keys for Web Push Notifications...');
      const keys = webpush.generateVAPIDKeys();
      vapidPublicKey = keys.publicKey;
      vapidPrivateKey = keys.privateKey;

      try {
        fs.writeFileSync(
          vapidKeyPath,
          JSON.stringify({ publicKey: vapidPublicKey, privateKey: vapidPrivateKey }, null, 2),
          'utf8'
        );
        console.log('✅ VAPID keys saved to .vapid.json');
      } catch (err) {
        console.warn('⚠️ Could not save .vapid.json to disk:', err);
      }
    }
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  console.log('✅ Web Push VAPID initialized successfully.');
};

export const getVapidPublicKey = (): string => {
  if (!vapidPublicKey) {
    initVapidKeys();
  }
  return vapidPublicKey;
};
