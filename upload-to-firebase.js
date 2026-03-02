const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// 1. INITIALIZE FIREBASE
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
storageBucket: "ourfish-c7f56.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const CSV_PATH = './data/species.csv';
const IMAGES_DIR = './data/images';

const regions = [
    { csv: "Amerique du Nord", folder: "Amerique du Nord" },
    { csv: "Guyane mer", folder: "guyane mer" },
    { csv: "Guyane riviere", folder: "guyane riviere" },
    { csv: "France - Normandie - lacs - etangs", folder: "France - Manche - Etangs" },
    { csv: "France-mediterranee", folder: "France - Mediterrannee" },
    { csv: "Grenadines", folder: "Grenadines" },
    { csv: "Antilles-st barts", folder: "Sbh-antilles" },
    { csv: "Atlantique Est", folder: "Atlantique" },
    { csv: "Pacifique-Mer de Chine", folder: "Pacifique-mer de chine" },
    { csv: "Ocean Indien et asie du Sud-est", folder: "Ocean Indien - asie du Sud-Est" }
];

async function startUpload() {
    const csvFile = fs.readFileSync(CSV_PATH, 'utf8');
    const { data } = Papa.parse(csvFile, { header: false, skipEmptyLines: true });
    
    let currentFolder = "";
    let currentRegionName = "";

    console.log("🚀 Starting Upload Process...");

    for (const row of data.slice(1)) {
        let colA = row[0]?.trim() || "";
        const name = row[1]?.trim();
        const family = row[9]?.trim() || "Unknown";
        const photoType = row[7]?.trim()?.toLowerCase(); // 'reelle' or 'web'

        if (!name) continue;

        // Detect New Region
        const foundRegion = regions.find(r => colA.toLowerCase().includes(r.csv.toLowerCase()));
        if (foundRegion) {
            currentFolder = foundRegion.folder;
            currentRegionName = foundRegion.csv;
            colA = "1";
        }

        const speciesId = colA;
        const cleanId = speciesId.replace(/\./g, '').toLowerCase();
        let imageUrls = [];

        // HANDLE "REELLE" - Upload local images
        if (photoType === 'reelle' && currentFolder) {
            const folderPath = path.join(IMAGES_DIR, currentFolder);
            if (fs.existsSync(folderPath)) {
                const files = fs.readdirSync(folderPath);
                const matchedFiles = files.filter(f => new RegExp(`^${cleanId}(\\s|\\.|_|$)`, 'i').test(f));

                for (const file of matchedFiles) {
                    const localPath = path.join(folderPath, file);
                    const destination = `species/${currentFolder}/${file}`;
                    
                    await bucket.upload(localPath, { destination });
                    const [url] = await bucket.file(destination).getSignedUrl({ action: 'read', expires: '03-01-2030' });
                    imageUrls.push(url);
                }
            }
        }

        // SAVE TO FIRESTORE (Both Web and Real)
        await db.collection('species').add({
            name: name,
            speciesId: speciesId,
            region: currentRegionName,
            family: family,
            photoSource: photoType === 'web' ? 'web' : 'reelle',
            images: imageUrls,
            hasImages: imageUrls.length > 0,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`[${photoType.toUpperCase()}] Processed: ${name}`);
    }
    console.log("✅ All data synced to Firebase!");
}

startUpload();