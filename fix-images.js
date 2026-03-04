const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'ourfish-c7f56.firebasestorage.app',
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const CSV_PATH = './data/species.csv';
const IMAGES_DIR = './data/images';

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

async function fixImages() {
  // ─── 1. Load Firestore docs ───
  console.log('Loading Firestore documents...');
  const snapshot = await db.collection('species').get();
  const firestoreByName = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    const key = data.name?.trim().toLowerCase();
    if (key) {
      if (!firestoreByName[key]) firestoreByName[key] = [];
      firestoreByName[key].push({ id: doc.id, data });
    }
  });
  console.log(`Loaded ${snapshot.size} docs from Firestore.\n`);

  // ─── 2. Parse CSV and build expected mapping ───
  const csvFile = fs.readFileSync(CSV_PATH, 'utf8');
  const { data } = Papa.parse(csvFile, { header: false, skipEmptyLines: true });

  let currentFolder = '';
  let currentRegionName = '';

  const csvEntries = [];

  for (const row of data.slice(1)) {
    let colA = row[0]?.trim() || '';
    const name = row[1]?.trim();
    const photoType = row[7]?.trim()?.toLowerCase() || '';

    if (!name) continue;

    const foundRegion = regions.find(r => colA.toLowerCase().includes(r.csv.toLowerCase()));
    if (foundRegion) {
      currentFolder = foundRegion.folder;
      currentRegionName = foundRegion.csv;
      colA = '1';
    }

    csvEntries.push({
      name,
      speciesId: colA,
      cleanId: colA.replace(/\./g, '').toLowerCase(),
      photoType,
      folder: currentFolder,
      region: currentRegionName,
    });
  }

  // ─── 3. Diagnose: check each CSV entry for local files ───
  console.log('=== DIAGNOSIS ===\n');

  const noLocalFiles = [];
  const hasLocalButNoFirebase = [];
  let fixedCount = 0;
  let alreadyGood = 0;

  for (const entry of csvEntries) {
    const nameKey = entry.name.trim().toLowerCase();
    const fbMatches = firestoreByName[nameKey];

    if (!fbMatches || fbMatches.length === 0) {
      console.log(`[NOT IN FIRESTORE] ${entry.name}`);
      continue;
    }

    const fbDoc = fbMatches[0];
    const existingImages = fbDoc.data.images || [];

    // If already has images, skip
    if (existingImages.length > 0) {
      alreadyGood++;
      continue;
    }

    // Check if local image files exist
    const folderPath = path.join(IMAGES_DIR, entry.folder);
    let matchedFiles = [];

    if (fs.existsSync(folderPath)) {
      const allFiles = fs.readdirSync(folderPath);

      // Try multiple matching strategies
      // Strategy 1: match by speciesId number (e.g., "3. Bar raye" matches cleanId "3")
      matchedFiles = allFiles.filter(f =>
        new RegExp(`^${entry.cleanId}(\\s|\\.|_|-)`, 'i').test(f)
      );

      // Strategy 2: if no match, try matching by name
      if (matchedFiles.length === 0) {
        const nameParts = entry.name.toLowerCase().split(/[\s,]+/).filter(p => p.length > 3);
        matchedFiles = allFiles.filter(f => {
          const fLower = f.toLowerCase();
          return nameParts.some(part => fLower.includes(part));
        });
      }
    }

    if (matchedFiles.length === 0) {
      noLocalFiles.push({ name: entry.name, region: entry.region, folder: entry.folder, id: entry.cleanId, photoType: entry.photoType });
    } else {
      hasLocalButNoFirebase.push({ name: entry.name, files: matchedFiles, folder: entry.folder, docId: fbDoc.id });
    }
  }

  // ─── 4. Print report ───
  console.log(`\n=== REPORT ===`);
  console.log(`Already have images: ${alreadyGood}`);
  console.log(`Missing images + no local files: ${noLocalFiles.length}`);
  console.log(`Missing images + local files found (FIXABLE): ${hasLocalButNoFirebase.length}`);

  if (noLocalFiles.length > 0) {
    console.log(`\n--- Species with NO local image files ---`);
    noLocalFiles.forEach(s => {
      console.log(`  ${s.name} | region: ${s.region} | folder: "${s.folder}" | id: ${s.id} | type: ${s.photoType}`);
    });
  }

  if (hasLocalButNoFirebase.length > 0) {
    console.log(`\n--- Species with local files ready to upload ---`);
    hasLocalButNoFirebase.forEach(s => {
      console.log(`  ${s.name} => ${s.files.join(', ')}`);
    });
  }

  // ─── 5. Ask to proceed ───
  if (hasLocalButNoFirebase.length === 0) {
    console.log('\nNothing to fix. The species without images have no local files either.');
    console.log('For those, you would need to add the image files to the correct folders in ./data/images/');
    return;
  }

  console.log(`\nUploading images for ${hasLocalButNoFirebase.length} species...\n`);

  // ─── 6. Upload and update ───
  for (const entry of hasLocalButNoFirebase) {
    const imageUrls = [];

    for (const file of entry.files) {
      try {
        const localPath = path.join(IMAGES_DIR, entry.folder, file);
        const destination = `species/${entry.folder}/${file}`;

        await bucket.upload(localPath, { destination });
        const [url] = await bucket.file(destination).getSignedUrl({
          action: 'read',
          expires: '03-01-2030',
        });
        imageUrls.push(url);
      } catch (err) {
        console.log(`  Error uploading ${file}: ${err.message}`);
      }
    }

    if (imageUrls.length > 0) {
      await db.collection('species').doc(entry.docId).update({
        images: imageUrls,
        hasImages: true,
      });
      fixedCount++;
      console.log(`[FIXED] ${entry.name} — ${imageUrls.length} image(s) uploaded`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Fixed: ${fixedCount}`);
  console.log(`Still missing (no local files): ${noLocalFiles.length}`);
}

fixImages();