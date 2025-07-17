const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getAssetMetadata(filePath) {
  const stats = fs.statSync(filePath);
  const hash = crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');

  return {
    name: path.basename(filePath),
    path: filePath,
    extension: path.extname(filePath),
    sizeKB: (stats.size / 1024).toFixed(2),
    created: stats.birthtime.toISOString(),
    modified: stats.mtime.toISOString(),
    hash,
    status: 'unchecked', // default value for copyright status
  };
}
function scanDirectory(directory) {
  const assets = [];
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const filePath = path.join(directory, file);
    if (fs.statSync(filePath).isDirectory()) {
      assets.push(...scanDirectory(filePath)); // recursive scan for subdirectories
    }
    else {
      const metadata = getAssetMetadata(filePath);
      assets.push(metadata);
    }
  });
  return assets;
}

function buildIndex(folderPath, outputPath = './index.json') {
  const files = fs.readdirSync(folderPath);
  const index = files
    .filter(file => fs.statSync(path.join(folderPath, file)).isFile())
    .map(file => getAssetMetadata(path.join(folderPath, file)));

  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
}

function printMetadataTable(indexPath) {
  const assets = JSON.parse(fs.readFileSync(indexPath));
  console.table(assets, ['name', 'sizeKB', 'extension', 'created', 'status']);
}

function scanDigitalAssets() {
  const digitalAssetsPath = './digital-assets';
    if (!fs.existsSync(digitalAssetsPath)) {
    console.log('❌ digital-assets folder not found');
    return { commercial_use: [], creative_commons: [], source_unknown: [] };
  }

  const allAssets = scanDirectory(digitalAssetsPath);

  const categorizedAssets = {
    commercial_use: [],
    creative_commons: [],
    source_unknown: []
  };


  allAssets.forEach(asset => {
    // Use the path field to determine category
    if (asset.path.includes('commercial_use')) {
      categorizedAssets.commercial_use.push(asset);
    } else if (asset.path.includes('creative_commons')) {
      categorizedAssets.creative_commons.push(asset);
    } else if (asset.path.includes('source_unknown')) {
      categorizedAssets.source_unknown.push(asset);
    } else {
      categorizedAssets.source_unknown.push(asset);
    }
  });

  console.log('📊 Categories:', {
    commercial_use: categorizedAssets.commercial_use.length,
    creative_commons: categorizedAssets.creative_commons.length,
    source_unknown: categorizedAssets.source_unknown.length
  });

  return categorizedAssets;
}

function generateWebData() {
  const assets = scanDigitalAssets();
  const webData = {
    timestamp: new Date().toISOString(),
    totalAssets: Object.values(assets).flat().length,
    categories: assets
  };

  fs.writeFileSync('./public/assets-data.json', JSON.stringify(webData, null, 2));
  console.log('✅ Web data generated at ./public/assets-data.json');
  return webData;
}

module.exports = {
  getAssetMetadata,
  scanDirectory,
  buildIndex,
  printMetadataTable,
  scanDigitalAssets,
  generateWebData,
};
