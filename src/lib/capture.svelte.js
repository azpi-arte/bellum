import { addFlowerPin, getAllFlowers } from '$lib/db.js';

export function createCaptureState() {
  // --- 1. State Declarations ---
  let flowers = $state([]);
  let imageFile = $state(null);
  let previewUrl = $state(null);
  
  // Location States
  let lat = $state(null);
  let lng = $state(null);
  let locationStatus = $state('');
  let exifWarning = $state(false); // <-- This was the culprit!
  let manualGpsLoading = $state(false);
  
  // AI / ID States
  let isIdentifying = $state(false);
  let identificationComplete = $state(false);
  let commonName = $state('');
  let botanicalName = $state('');
  let isSummarizing = $state(false);
  let aiSummary = $state('');
  
  // Network States
  let isUploading = $state(false);

  // --- 2. Database Functions ---
  async function loadFlowers() {
    try {
      flowers = await getAllFlowers();
    } catch (e) {
      console.error("Could not load flowers yet:", e);
    }
  }

  // --- 3. UI Flow Functions ---
  function resetCapture() {
    imageFile = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    lat = null;
    lng = null;
    locationStatus = '';
    exifWarning = false;
    isIdentifying = false;
    identificationComplete = false;
    commonName = '';
    botanicalName = '';
    aiSummary = '';
  }

  async function handlePhotoCapture(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Reset everything for a fresh photo
    resetCapture();

    // Set the new photo and preview
    imageFile = file;
    previewUrl = URL.createObjectURL(file);
    locationStatus = 'Scanning image for GPS data... 🔍';

    // Step 1: GPS Extraction
    try {
      const module = await import('exifr');
      const exifr = module.default || module; 
      const gps = await exifr.gps(file);
      
      if (gps) {
        lat = gps.latitude;
        lng = gps.longitude;
        locationStatus = `Location found! ✅`;
      } else {
        locationStatus = 'No GPS in photo. Use live location! 📍';
        exifWarning = true;
      }
    } catch (err) {
      locationStatus = 'Error reading GPS. Try manual location. 📍';
      exifWarning = true;
    }

    // Step 2: Auto-Identify Plant
    isIdentifying = true;
    try {
      // Mocking the Pl@ntNet API delay for now
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      commonName = 'Common Sunflower';
      botanicalName = 'Helianthus annuus';
      identificationComplete = true;
    } catch (err) {
      console.error("Identification failed:", err);
      commonName = 'Unknown Flower';
      botanicalName = 'Unknown';
    } finally {
      isIdentifying = false;
    }
  }

  function getManualLocation() {
    manualGpsLoading = true;
    locationStatus = 'Locating device... 📡';
    
    if (!navigator.geolocation) {
      locationStatus = 'Geolocation is not supported';
      manualGpsLoading = false;
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        locationStatus = `Live Location found! ✅`;
        exifWarning = false; 
        manualGpsLoading = false;
      },
      (error) => {
        locationStatus = 'Browser denied location access ❌';
        manualGpsLoading = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function generateSummary() {
    isSummarizing = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      aiSummary = "Sunflowers track the sun across the sky, a behavior called heliotropism! Plus, one sunflower is actually made of thousands of tiny flowers packed together.";
    } catch (err) {
      aiSummary = "Oops, the AI is taking a nap. Could not generate facts.";
    } finally {
      isSummarizing = false;
    }
  }

  async function submitFlower() {
    if (!imageFile || !lat || !lng) {
      alert("Please ensure you have an image and location data!");
      return;
    }

    isUploading = true;
    
    const newFlower = await addFlowerPin({ 
      lat, 
      lng, 
      commonName, 
      botanicalName, 
      ai_summary: aiSummary,
      file: imageFile 
    });

    if (newFlower) {
      flowers = [newFlower, ...flowers];
      resetCapture(); // Clears everything upon success
    } else {
      alert("Failed to upload. Check console.");
    }
    isUploading = false;
  }

  // --- 4. Expose Data and Methods to the Component ---
  return {
    get flowers() { return flowers; },
    get imageFile() { return imageFile; },
    get previewUrl() { return previewUrl; },
    get locationStatus() { return locationStatus; },
    get exifWarning() { return exifWarning; },
    get manualGpsLoading() { return manualGpsLoading; },
    get isUploading() { return isUploading; },
    get hasLocation() { return lat !== null && lng !== null; },
    
    get isIdentifying() { return isIdentifying; },
    get identificationComplete() { return identificationComplete; },
    get commonName() { return commonName; },
    get botanicalName() { return botanicalName; },
    get isSummarizing() { return isSummarizing; },
    get aiSummary() { return aiSummary; },
    
    resetCapture,
    loadFlowers,
    handlePhotoCapture,
    getManualLocation,
    generateSummary,
    submitFlower
  };
}