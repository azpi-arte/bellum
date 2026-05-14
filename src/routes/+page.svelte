<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';

  // Form State
  let flowerName = '';
  let imageFile = null;
  let previewUrl = null;
  let lat = null;
  let lng = null;
  
  // UI State
  let locationStatus = 'Waiting for photo or manual GPS...';
  let isUploading = false;
  let flowers = [];

  // 1. Fetch flowers on load
  onMount(async () => {
    fetchFlowers();
  });

  async function fetchFlowers() {
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) flowers = data;
  }

  // 2. Handle Image Selection & EXIF
  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    imageFile = file;
    previewUrl = URL.createObjectURL(file);
    locationStatus = 'Scanning photo for GPS data... 🔍';

    try {
      // Dynamic import to prevent Vercel build errors
      const module = await import('exifr');
      const exifr = module.default || module;
      
      const gps = await exifr.gps(file);
      
      if (gps) {
        lat = gps.latitude;
        lng = gps.longitude;
        locationStatus = `Location found in photo! ✅`;
      } else {
        locationStatus = 'No GPS in photo. Please use manual button! 📍';
      }
    } catch (err) {
      console.error("EXIF Error:", err);
      locationStatus = 'GPS Scan failed. Use manual button! 📍';
    }
  }

  // 3. Manual GPS Fallback (The most reliable for campus testing)
  function getManualLocation() {
    locationStatus = 'Fetching live GPS... 🛰️';
    if (!navigator.geolocation) {
      locationStatus = 'Geolocation not supported by browser.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        locationStatus = 'Live GPS Acquired! ✅';
      },
      (err) => {
        locationStatus = 'Could not get live location. Check permissions.';
      }
    );
  }

  // 4. Submit to Supabase
  async function submitFlower() {
    if (!imageFile || !lat || !flowerName) {
      alert('Missing Name, Photo, or Location!');
      return;
    }

    isUploading = true;
    
    try {
      // A. Upload Image
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('flower-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // B. Get Public URL
      const { data: urlData } = supabase.storage
        .from('flower-images')
        .getPublicUrl(fileName);

      // C. Save to Database
      const { error: dbError } = await supabase.from('flowers').insert([
        {
          name: flowerName,
          image_url: urlData.publicUrl,
          location: `SRID=4326;POINT(${lng} ${lat})`
        }
      ]);

      if (dbError) throw dbError;

      alert('Flower Added! 🌸');
      // Reset form
      flowerName = '';
      imageFile = null;
      previewUrl = null;
      lat = null;
      lng = null;
      locationStatus = 'Waiting for next flower...';
      fetchFlowers();
      
    } catch (err) {
      alert(err.message);
    } finally {
      isUploading = false;
    }
  }
</script>

<main class="p-4 max-w-md mx-auto">
  <h1 class="text-2xl font-bold mb-4 text-green-700">FloraScan MVP 🌸</h1>

  <div class="bg-white p-4 rounded-lg shadow-md border border-green-100 mb-6">
    <input 
      type="text" 
      bind:value={flowerName} 
      placeholder="Flower name (e.g. Red Rose)" 
      class="w-full p-2 border rounded mb-4"
    />

    <input 
      type="file" 
      accept="image/*" 
      capture="environment"
      on:change={handleFileSelect}
      class="mb-4 text-sm"
    />

    {#if previewUrl}
      <img src={previewUrl} alt="Preview" class="w-full h-48 object-cover rounded mb-4" />
    {/if}

    <div class="text-sm mb-4 p-2 bg-gray-50 rounded italic text-gray-600">
      {locationStatus}
    </div>

    <div class="flex gap-2 mb-4">
      <button 
        on:click={getManualLocation}
        class="flex-1 bg-blue-500 text-white py-2 rounded text-sm"
      >
        Use Live GPS 📍
      </button>
    </div>

    <button 
      on:click={submitFlower} 
      disabled={isUploading}
      class="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-400"
    >
      {isUploading ? 'Uploading...' : 'Submit Flower 🚀'}
    </button>
  </div>

  <h2 class="text-xl font-bold mb-4">Recent Scans</h2>
  <div class="grid grid-cols-1 gap-4">
    {#each flowers as flower}
      <div class="border rounded-lg overflow-hidden bg-white shadow-sm">
        <img src={flower.image_url} alt={flower.name} class="w-full h-32 object-cover" />
        <div class="p-2">
          <p class="font-bold">{flower.name}</p>
          <p class="text-xs text-gray-500">{new Date(flower.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    {/each}
  </div>
</main>