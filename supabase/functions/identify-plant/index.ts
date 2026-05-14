import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight requests (required for browsers)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Extract the image sent from SvelteKit
    const formData = await req.formData()
    const imageFile = formData.get('image')

    if (!imageFile) throw new Error('No image provided in request')

    // 3. Prepare the exact format Pl@ntNet requires
    const plantNetData = new FormData()
    plantNetData.append('images', imageFile)
    plantNetData.append('organs', 'auto') // Let Pl@ntNet figure out if it's a leaf, flower, bark, etc.

    const apiKey = Deno.env.get('PLANTNET_API_KEY')
    const apiUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`

    // 4. Send to Pl@ntNet API
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: plantNetData
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Pl@ntNet API Error')
    }

    // 5. Pl@ntNet returns an array of matches. Grab the one with the highest confidence score.
    const bestMatch = result.results[0]
    
    // Send clean data back to our Svelte app
    return new Response(JSON.stringify({
      botanicalName: bestMatch.species.scientificNameWithoutAuthor,
      commonName: bestMatch.species.commonNames[0] || bestMatch.species.scientificNameWithoutAuthor,
      score: bestMatch.score
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 400 
    })
  }
})