const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'ourfish-c7f56.firebasestorage.app',
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function fixUrls() {
  const snapshot = await db.collection('species').get();
  let fixed = 0;
  let skipped = 0;

  console.log(`Processing ${snapshot.size} documents...\n`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const images = data.images || [];

    if (images.length === 0) {
      skipped++;
      continue;
    }

    const newUrls = [];

    for (const oldUrl of images) {
      try {
        // Extract the file path from the old signed URL
        // The path is between "/ourfish-c7f56.firebasestorage.app/" and "?"
        const match = oldUrl.match(/firebasestorage\.app\/(.+?)\?/);
        if (!match) {
          console.log(`  Could not parse URL for ${data.name}, skipping this image`);
          continue;
        }

        const filePath = decodeURIComponent(match[1]);
        const file = bucket.file(filePath);

        // Check file exists
        const [exists] = await file.exists();
        if (!exists) {
          console.log(`  File not found: ${filePath}`);
          continue;
        }

        // Generate new signed URL with the new key
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2030',
        });

        newUrls.push(url);
      } catch (err) {
        console.log(`  Error re-signing for ${data.name}: ${err.message}`);
      }
    }

    if (newUrls.length > 0) {
      await db.collection('species').doc(doc.id).update({
        images: newUrls,
        hasImages: true,
      });
      fixed++;
      console.log(`[FIXED] ${data.name} — ${newUrls.length} image(s) re-signed`);
    } else {
      skipped++;
    }
  }

  console.log(`\n--- Done! ---`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Skipped (no images): ${skipped}`);
}

fixUrls();