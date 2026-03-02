const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = './data/species.csv';
const IMAGES_DIR = './data/images';

// We define exactly what the regions are so the script doesn't guess
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

const csvFile = fs.readFileSync(CSV_PATH, 'utf8');
const { data } = Papa.parse(csvFile, { header: false, skipEmptyLines: true });

let currentFolder = ""; 

console.log(`--- Starting Fixed Verification ---\n`);

data.slice(1).forEach((row) => {
    let colA = row[0]?.trim() || ""; 
    const fishName = row[1]?.trim();
    const photoType = row[7]?.trim()?.toLowerCase();

    // 1. CHECK IF THIS ROW IS A NEW REGION
    // We only change the folder if Col A contains one of our region names
    const foundRegion = regions.find(r => colA.toLowerCase().includes(r.csv.toLowerCase()));
    
    if (foundRegion) {
        currentFolder = foundRegion.folder;
        // The ID for the first fish in a region is usually "1"
        var speciesId = "1";
    } else {
        // If it's not a region name, Col A is just the ID (like "37.bis" or "41bis")
        var speciesId = colA;
    }

    if (!currentFolder || !speciesId) return;

    // 2. CLEAN THE ID (37.bis -> 37bis)
    const cleanId = speciesId.replace(/\./g, '').toLowerCase();

    // 3. FIND THE IMAGES
    const folderPath = path.join(IMAGES_DIR, currentFolder);
    if (!fs.existsSync(folderPath)) {
        console.log(`[❌] ERROR: Folder "${currentFolder}" not found on disk.`);
        return;
    }

    const allFiles = fs.readdirSync(folderPath);
    
    // Look for files starting with the ID (handling spaces, dots, or underscores)
    const matchedImages = allFiles.filter(file => {
        // Regex: starts with ID, followed by a space, dot, underscore, or the end of the filename
        const pattern = new RegExp(`^${cleanId}(\\s|\\.|_|$)`, 'i');
        return pattern.test(file);
    });

    if (photoType === 'reelle') {
        if (matchedImages.length > 0) {
            console.log(`[✅] MATCH: [${currentFolder}] ${fishName} (ID: ${speciesId}) -> Found ${matchedImages.length} images.`);
        } else {
            console.log(`[⚠️] MISSING: [${currentFolder}] ${fishName} (ID: ${speciesId}) - No image starting with "${cleanId}"`);
        }
    }
});