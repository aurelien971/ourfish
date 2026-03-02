const admin = require('firebase-admin');
const fs = require('fs');
const Papa = require('papaparse');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'ourfish-c7f56.firebasestorage.app',
});

const db = admin.firestore();

const CSV_PATH = './data/species.csv';

const regions = [
  { csv: 'Amerique du Nord', folder: 'Amerique du Nord' },
  { csv: 'Guyane mer', folder: 'guyane mer' },
  { csv: 'Guyane riviere', folder: 'guyane riviere' },
  { csv: 'France - Normandie - lacs - etangs', folder: 'France - Manche - Etangs' },
  { csv: 'France-mediterranee', folder: 'France - Mediterrannee' },
  { csv: 'Grenadines', folder: 'Grenadines' },
  { csv: 'Antilles-st barts', folder: 'Sbh-antilles' },
  { csv: 'Atlantique Est', folder: 'Atlantique' },
  { csv: 'Pacifique-Mer de Chine', folder: 'Pacifique-mer de chine' },
  { csv: 'Ocean Indien et asie du Sud-est', folder: 'Ocean Indien - asie du Sud-Est' },
];

async function startUpload() {
  // 1. Load all existing docs into a lookup map by lowercase name
  console.log('Loading existing Firestore documents...');
  const snapshot = await db.collection('species').get();
  const existingByName = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    const key = data.name?.trim().toLowerCase();
    if (key) {
      // If multiple docs share a name, store as array
      if (!existingByName[key]) existingByName[key] = [];
      existingByName[key].push({ id: doc.id, data });
    }
  });
  console.log(`Found ${snapshot.size} existing documents.\n`);

  // 2. Parse CSV
  const csvFile = fs.readFileSync(CSV_PATH, 'utf8');
  const { data } = Papa.parse(csvFile, { header: false, skipEmptyLines: true });

  let currentRegionName = '';
  let updated = 0;
  let created = 0;
  let skipped = 0;

  for (const row of data.slice(1)) {
    let colA = row[0]?.trim() || '';
    const name = row[1]?.trim();
    const englishName = row[2]?.trim() || '';
    const quantity = row[3]?.trim() || '';
    const commonWeight = row[4]?.trim() || '';
    const locationDetails = row[5]?.trim() || '';
    const fishingTechnique = row[6]?.trim() || '';
    const photoType = row[7]?.trim()?.toLowerCase() || '';
    const scientificName = row[8]?.trim() || '';
    const family = row[9]?.trim() || 'Unknown';
    const order = row[10]?.trim() || 'Unknown';

    if (!name) { skipped++; continue; }

    // Detect region
    const foundRegion = regions.find(r => colA.toLowerCase().includes(r.csv.toLowerCase()));
    if (foundRegion) {
      currentRegionName = foundRegion.csv;
      colA = '1';
    }

    const speciesId = colA;
    const nameKey = name.trim().toLowerCase();

    // New fields to merge (won't touch images or hasImages)
    const newFields = {
      englishName,
      scientificName,
      speciesId,
      region: currentRegionName,
      family: family.toLowerCase(),
      order: order.toLowerCase(),
      quantity,
      commonWeight,
      locationDetails,
      fishingTechnique,
      photoSource: photoType === 'web' ? 'web' : 'reelle',
    };

    // 3. Check if doc already exists
    const matches = existingByName[nameKey];

    if (matches && matches.length > 0) {
      // Update the first match, merge so images stay untouched
      const docId = matches[0].id;
      await db.collection('species').doc(docId).update(newFields);
      updated++;
      console.log(`[UPDATED] ${name} — added ${Object.keys(newFields).length} fields`);
    } else {
      // No match — create new doc (no images since they weren't uploaded before)
      await db.collection('species').add({
        name,
        ...newFields,
        images: [],
        hasImages: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      created++;
      console.log(`[CREATED] ${name} — new species`);
    }
  }

  console.log(`\n--- Done! ---`);
  console.log(`Updated: ${updated}`);
  console.log(`Created: ${created}`);
  console.log(`Skipped (empty rows): ${skipped}`);
}

startUpload();