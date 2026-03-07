const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function capitalize(str) {
  if (!str) return str;
  return str
    .split(/(\s+|-|,\s*)/)
    .map(part => {
      if (part.trim().length === 0 || part === '-' || part === ', ' || part === ',') return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

async function fixNames() {
  const snapshot = await db.collection('species').get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const oldName = data.name || '';
    const newName = capitalize(oldName);

    if (oldName !== newName) {
      await db.collection('species').doc(doc.id).update({ name: newName });
      updated++;
      console.log(`${oldName}  =>  ${newName}`);
    }
  }

  console.log(`\nDone! Updated ${updated} of ${snapshot.size} names.`);
}

fixNames();