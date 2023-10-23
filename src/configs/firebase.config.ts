import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import * as fireorm from 'fireorm'

const app = admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID
  })
})

export const firestore = getFirestore(app)
fireorm.initialize(firestore)