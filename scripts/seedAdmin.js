// scripts/seedAdmin.js
// Run this script to create the initial admin account.
// Usage: node scripts/seedAdmin.js
//
// Prerequisites:
// 1. npm install firebase-admin dotenv
// 2. Download serviceAccountKey.json from Firebase Console >
//    Project Settings > Service Accounts > Generate new private key
// 3. Place serviceAccountKey.json in project root (do NOT commit it)

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const ADMIN_EMAIL = 'admin@pbm.com';       // Change this
const ADMIN_PASSWORD = 'Admin@PBM123';     // Change this - use strong password
const ADMIN_NAME = 'PBM Admin';

async function createAdmin() {
  try {
    console.log('Creating admin account...');

    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_NAME,
      });
      console.log('✓ Auth user created:', userRecord.uid);
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
        console.log('✓ Auth user already exists:', userRecord.uid);
      } else throw err;
    }

    // Store in users collection with admin role
    await db.collection('users').doc(userRecord.uid).set({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      mobile: '',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Also store in admins collection (double check)
    await db.collection('admins').doc(userRecord.uid).set({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('✓ Admin saved in Firestore');
    console.log('\n=== ADMIN CREDENTIALS ===');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Admin URL: /admin/login');
    console.log('=========================');
    console.log('\nIMPORTANT: Change password after first login!');

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
