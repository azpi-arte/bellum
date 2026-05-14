<script>
  import { onMount } from 'svelte';
  import { createCaptureState } from '$lib/capture.svelte.js';
  
  const capture = createCaptureState();

  onMount(() => {
    capture.loadFlowers();
  });
</script>

<div class="container">
  <h1>📸 FloraScan Capture</h1>

  <section class="card form-section">
    <label class="btn-primary camera-btn">
      Take or Upload Photo
      <input 
        type="file" 
        accept="image/*" 
        onchange={capture.handlePhotoCapture}
        hidden
      />
    </label>

    {#if capture.previewUrl}
      <img src={capture.previewUrl} alt="Preview" class="preview-img" />
    {/if}

    <div class="status-bar" class:warning={capture.exifWarning}>
      {capture.locationStatus}
    </div>

    {#if capture.exifWarning}
      <div class="fallback-ui">
        <p class="helper-text">Could not extract location from image.</p>
        <button 
          class="btn-secondary" 
          onclick={capture.getManualLocation} 
          disabled={capture.manualGpsLoading}
        >
          {capture.manualGpsLoading ? 'Loading...' : 'Use Current Device Location 📍'}
        </button>
      </div>
    {/if}

    {#if capture.isIdentifying}
      <div class="ai-box loading">
        <p>🤖 AI is identifying this plant...</p>
      </div>
    {:else if capture.identificationComplete}
      <div class="ai-box success">
        <h3>{capture.commonName}</h3>
        <p class="botanical-name">{capture.botanicalName}</p>
        
        {#if !capture.aiSummary && !capture.isSummarizing}
          <button class="btn-secondary prompt-btn" onclick={capture.generateSummary}>
            ✨ Get Fun AI Facts?
          </button>
        {/if}

        {#if capture.isSummarizing}
          <p class="loading-text">Writing a cute summary...</p>
        {/if}

        {#if capture.aiSummary}
          <div class="ai-summary-card">
            <p>{capture.aiSummary}</p>
          </div>
        {/if}
      </div>
    {/if}

    <button 
      class="btn-primary submit-btn" 
      onclick={capture.submitFlower} 
      disabled={capture.isUploading || !capture.hasLocation || !capture.identificationComplete}
    >
      {capture.isUploading ? 'Saving...' : 'Save to Map 🗺️'}
    </button>
  </section>

  <h2>Recent Scans</h2>
  <div class="feed">
    {#each capture.flowers as flower (flower.id)}
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
  /* Base styles */
  .container { padding: 1rem; padding-bottom: 5rem; }
  .card { background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
  .form-section { display: flex; flex-direction: column; gap: 1rem; background-color: #f8fcf8; }
  
  /* Buttons */
  .camera-btn { text-align: center; background-color: #2e7d32; color: white; font-size: 1.1rem; padding: 1rem; border-radius: 8px; cursor: pointer; display: block; }
  .submit-btn { margin-top: 1rem; background-color: #4caf50; color: white; font-size: 1.1rem; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; }
  .submit-btn:disabled { background-color: #ccc; cursor: not-allowed; }
  .btn-secondary { background: white; color: #2e7d32; border: 1px solid #4caf50; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: bold; }
  .prompt-btn { width: 100%; margin-top: 0.5rem; font-size: 0.9rem; background: #e8f5e9; }
  
  /* UI Elements */
  .preview-img { width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; }
  .status-bar { padding: 0.8rem; background: #81c587; border-radius: 8px; text-align: center; color: #2e7d32; font-weight: bold; }
  .status-bar.warning { background: #ffebee; color: #c62828; }
  .helper-text { font-size: 0.8rem; color: #c62828; margin: -0.5rem 0 0.5rem 0; text-align: center; }
  
  /* Fallback Box */
  .fallback-ui { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #fff3e0; border: 1px solid #ffb74d; border-radius: 8px; }
  
  /* AI Identification Box */
  .ai-box { padding: 1rem; border-radius: 8px; text-align: center; }
  .ai-box.loading { background: #e3f2fd; color: #1565c0; border: 1px dashed #64b5f6; }
  .ai-box.success { background: white; border: 1px solid #a5d6a7; }
  .ai-box h3 { margin: 0; color: #2e7d32; font-size: 1.2rem; }
  .botanical-name { margin: 0.2rem 0; font-style: italic; color: #666; font-size: 0.9rem; }
  .ai-summary-card { background: #fff8e1; border-left: 4px solid #ffb300; padding: 0.8rem; text-align: left; margin-top: 1rem; border-radius: 4px; font-size: 0.9rem; color: #555; }
  .loading-text { font-size: 0.9rem; color: #888; font-style: italic; }

  /* Feed */
  .feed { display: flex; flex-direction: column; gap: 1rem; }
  .feed-item { display: flex; gap: 1rem; padding: 0.5rem; }
  .feed-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
  .info { display: flex; flex-direction: column; justify-content: center; }
  .info h3 { margin: 0 0 0.2rem 0; color: #2e7d32; font-size: 1.1rem; }
  .coords { margin: 0.3rem 0 0 0; font-size: 0.8rem; color: #888; }
</style>