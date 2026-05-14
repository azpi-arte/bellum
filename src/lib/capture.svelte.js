import { addFlowerPin, getAllFlowers } from '$lib/db.js';

export function createCaptureState() {
  let flowers = $state([]);
  let imageFile = $state(null);
  let previewUrl = $state(null);
  let lat = $state(null);
  let lng = $state(null);
  
  let locationStatus = $state('Waiting for photo... 📷');
  let exifWarning = $state(false);
  let manualGpsLoading = $state(false);
  let isUploading = $state(false);

  // New AI/Identification States
  let isIdentifying = $state(false);
  let identificationComplete = $state(false);
  let commonName = $state('');
  let botanicalName = $state('');
  let isSummarizing = $state(false);
  let aiSummary = $state('');

  async function loadFlowers() {
    flowers = await getAllFlowers();
  }

  async function handlePhotoCapture(event) {
    const file = event.target.files[0];
    if (!file) return;

    imageFile = file;
    previewUrl = URL.createObjectURL(file);
    
    // Reset all states for a new photo
    lat = null;
    lng = null;
    exifWarning = false;
    identificationComplete = false;
    commonName = '';
    botanicalName = '';
    aiSummary = '';
    locationStatus = 'Scanning image for GPS data... 🔍';

    // 1. GPS Extraction
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

    // 2. Auto-Identify Plant (Simulating Pl@ntNet API call)
    isIdentifying = true;
    try {
      // TODO: Replace with actual fetch to Supabase Edge Function -> Pl@ntNet
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
      // TODO: Replace with actual fetch to Supabase Edge Function -> Gemini 1.5 Flash
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
      ai_summary: aiSummary, // Storing the optional summary
      file: imageFile 
    });

    if (newFlower) {
      flowers = [newFlower, ...flowers];
      imageFile = null;
      previewUrl = null;
      lat = null;
      lng = null;
      identificationComplete = false;
      commonName = '';
      botanicalName = '';
      aiSummary = '';
      locationStatus = 'Waiting for photo... 📷';
      exifWarning = false;
    } else {
      alert("Failed to upload. Check console.");
    }
    isUploading = false;
  }

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
    
    loadFlowers,
    handlePhotoCapture,
    getManualLocation,
    generateSummary,
    submitFlower
  };
}