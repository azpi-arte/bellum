<script>
  import { onMount } from 'svelte';
  import { addFlowerPin, getAllFlowers } from '$lib/db.js';

  let flowers = $state([]);
  let isUploading = $state(false);
  
  let imageFile = $state(null);
  let previewUrl = $state(null);
  let lat = $state(null);
  let lng = $state(null);
  let commonName = $state('');
  let botanicalName = $state('');
  
  let locationStatus = $state('Waiting for photo... 📷');
  let exifWarning = $state(false);
  let manualGpsLoading = $state(false);

  onMount(async () => {
    flowers = await getAllFlowers();
  });

  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Import it dynamically only when the button is clicked
    const exifr = (await import('exifr')).default; 

    imageFile = file;
    previewUrl = URL.createObjectURL(file);
    
    locationStatus = 'Scanning image for GPS data... 🔍';
    exifWarning = false;

    try {
      const gps = await exifr.gps(file);
      
      if (gps) {
        lat = gps.latitude;
        lng = gps.longitude;
        locationStatus = `Location found! Lat: ${lat.toFixed(4)} ✅`;
      } else {
        lat = null;
        lng = null;
        locationStatus = 'No GPS data in this photo ❌';
        exifWarning = true;
      }
    } catch (error) {
      console.error("EXIF Error:", error);
      locationStatus = 'Error reading image data ❌';
      exifWarning = true;
    }
  }

  // The fallback method
  function getManualLocation() {
    manualGpsLoading = true;
    locationStatus = 'Locating device... 📡';
    
    if (!navigator.geolocation) {
      locationStatus = 'Geolocation is not supported by your browser';
      manualGpsLoading = false;
      return;
    }
    
    // DuckDuckGo will likely prompt you for permission here
    navigator.geolocation.getCurrentPosition(
      (position) => {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        locationStatus = `Live Location found! Lat: ${lat.toFixed(4)} ✅`;
        exifWarning = false; // Turn off the warning since we got coordinates
        manualGpsLoading = false;
      },
      (error) => {
        console.error(error);
        locationStatus = 'Browser denied location access ❌';
        manualGpsLoading = false;
      },
      { enableHighAccuracy: true, timeout: 10000 } // Ask for accurate GPS
    );
  }

  async function submitFlower() {
    if (!imageFile || !lat || !lng) {
      alert("Please ensure you have an image and location data!");
      return;
    }

    isUploading = true;

    const newFlower = await addFlowerPin({ lat, lng, commonName, botanicalName, file: imageFile });

    if (newFlower) {
      flowers = [newFlower, ...flowers];
      imageFile = null;
      previewUrl = null;
      commonName = '';
      botanicalName = '';
      lat = null;
      lng = null;
      locationStatus = 'Waiting for photo... 📷';
      exifWarning = false;
    } else {
      alert("Failed to upload. Check console.");
    }
    isUploading = false;
  }
</script>

<div class="container">
  <h1>📸 FloraScan Capture</h1>

  <section class="card form-section">
    <label class="btn-primary camera-btn">
      Take or Upload Photo
      <input 
        type="file" 
        accept="image/*" 
        onchange={handleFileSelect}
        hidden
      />
    </label>

    {#if previewUrl}
      <img src={previewUrl} alt="Preview" class="preview-img" />
    {/if}

    <div class="status-bar" class:warning={exifWarning}>
      {locationStatus}
    </div>

    {#if exifWarning}
      <div class="fallback-ui">
        <p class="helper-text">Could not extract location from image.</p>
        <button 
          class="btn-secondary" 
          onclick={getManualLocation} 
          disabled={manualGpsLoading}
        >
          {manualGpsLoading ? 'Loading...' : 'Use Current Device Location 📍'}
        </button>
      </div>
    {/if}

    <input type="text" placeholder="Common Name (e.g. Daisy)" bind:value={commonName} />
    <input type="text" placeholder="Botanical Name (Optional)" bind:value={botanicalName} />

    <button class="btn-primary submit-btn" onclick={submitFlower} disabled={isUploading || !lat}>
      {isUploading ? 'Uploading...' : 'Save to Map 🗺️'}
    </button>
  </section>

  <h2>Recent Scans</h2>
  <div class="feed">
    {#each flowers as flower (flower.id)}
      <div class="card feed-item">
        <img src={flower.image_path} alt={flower.common_name} loading="lazy" />
        <div class="info">
          <h3>{flower.common_name || 'Unknown Flower'}</h3>
          <p class="botanical">{flower.botanical_name || 'Unknown'}</p>
          <p class="coords">
            📍 {flower.location_json?.coordinates?.[1]?.toFixed(4) ?? '??'}, 
              {flower.location_json?.coordinates?.[0]?.toFixed(4) ?? '??'}
          </p>
        </div>
      </div>
    {:else}
      <p>No flowers mapped yet!</p>
    {/each}
  </div>
</div>

<style>
  /* Keep your existing styles and add these: */
  .status-bar {
    padding: 0.8rem;
    background: #e8f5e9;
    border-radius: 8px;
    text-align: center;
    color: #2e7d32;
    font-weight: bold;
  }
  .status-bar.warning {
    background: #ffebee;
    color: #c62828;
  }
  .helper-text {
    font-size: 0.8rem;
    color: #c62828;
    margin: -0.5rem 0 0.5rem 0;
    text-align: center;
  }
  
  /* Copy the rest from the previous CSS snippet */
  .container { padding: 1rem; padding-bottom: 5rem; }
  .card { background: white; border-radius: var(--radius); padding: 1rem; box-shadow: var(--shadow); margin-bottom: 1.5rem; }
  .form-section { display: flex; flex-direction: column; gap: 1rem; background-color: var(--primary-light); }
  input[type="text"] { padding: 0.8rem; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; }
  .camera-btn { text-align: center; background-color: var(--primary); font-size: 1.1rem; padding: 1rem; cursor: pointer; }
  .submit-btn { margin-top: 1rem; background-color: var(--accent); color: white; font-size: 1.1rem; border: none; padding: 1rem; border-radius: 8px; cursor: pointer;}
  .submit-btn:disabled { background-color: #ccc; cursor: not-allowed; }
  .preview-img { width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; }
  .feed { display: flex; flex-direction: column; gap: 1rem; }
  .feed-item { display: flex; gap: 1rem; padding: 0.5rem; }
  .feed-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
  .info { display: flex; flex-direction: column; justify-content: center; }
  .info h3 { margin: 0 0 0.2rem 0; color: var(--primary); font-size: 1.1rem;}
  .botanical { margin: 0; font-size: 0.9rem; font-style: italic; color: #666; }
  .coords { margin: 0.3rem 0 0 0; font-size: 0.8rem; color: #888; }

  .fallback-ui {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #fff3e0;
    border: 1px solid #ffb74d;
    border-radius: 8px;
  }
  .btn-secondary {
    background: white;
    color: var(--text);
    border: 1px solid var(--accent);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
  }
</style>