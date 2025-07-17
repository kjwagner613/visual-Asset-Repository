async function loadAssetData() {
  try {
    const response = await fetch('./public/assets-data.json');
    const data = await response.json();
    populateMetadataTable(data);
    updateCategoryCounts(data);
  } catch (error) {
    console.error('Failed to load asset data:', error);
  }
}

function populateMetadataTable(data) {
  const tbody = document.querySelector('#metadataTable tbody');
  tbody.innerHTML = '';
  
  Object.values(data.categories).flat().forEach(asset => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${asset.name}</td>
      <td>${asset.extension}</td>
      <td>${asset.sizeKB}</td>
      <td>${new Date(asset.created).toLocaleDateString()}</td>
      <td>${new Date(asset.modified).toLocaleDateString()}</td>
      <td title="${asset.hash}">${asset.hash.substring(0, 8)}...</td>
      <td>
        <select onchange="updateAssetStatus('${asset.hash}', this.value)">
          <option value="unchecked" ${asset.status === 'unchecked' ? 'selected' : ''}>Unchecked</option>
          <option value="cleared" ${asset.status === 'cleared' ? 'selected' : ''}>Cleared</option>
          <option value="pending" ${asset.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="restricted" ${asset.status === 'restricted' ? 'selected' : ''}>Restricted</option>
        </select>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updateCategoryCounts(data) {
  const categories = document.querySelectorAll('.category');
  categories[0].querySelector('h2').textContent = `Commercial Use (${data.categories.commercial_use.length})`;
  categories[1].querySelector('h2').textContent = `Creative Commons (${data.categories.creative_commons.length})`;
  categories[2].querySelector('h2').textContent = `Source Unknown (${data.categories.source_unknown.length})`;
}

function updateAssetStatus(hash, status) {
  console.log(`Updating asset ${hash} to status: ${status}`);
  // Save to localStorage for now, or implement server-side updates later
  localStorage.setItem(`asset_${hash}`, status);
}

document.addEventListener('DOMContentLoaded', loadAssetData);