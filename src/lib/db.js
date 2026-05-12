import { supabase } from './supabase';

/**
 * Fetches all validated flower pins.
 * We will handle the filtering (search bar/dropdown) directly in Svelte for instant UI updates.
 */
// Inside src/lib/db.js

export async function getAllFlowers() {
	// We use a PostGIS function via Supabase to get the coordinates as JSON
	const { data, error } = await supabase
		.from('flower_pins_view') // Use the view!
		.select('*');

	// NOTE: If your Supabase is still returning hex, we might need a
	// Database View or a simpler trick below.
	if (error) return [];
	return data;
}

/**
 * Uploads an image file to Supabase Storage and returns the public URL.
 */
export async function uploadFlowerImage(file) {
	// Generate a unique file name to prevent overwriting
	const fileExt = file.name.split('.').pop();
	const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
	const filePath = `${fileName}`;

	const { data, error } = await supabase.storage.from('flower-images').upload(filePath, file);

	if (error) {
		console.error('Error uploading image:', error.message);
		throw error;
	}

	// Get the public URL to save in our database
	const { data: publicUrlData } = supabase.storage.from('flower-images').getPublicUrl(filePath);

	return publicUrlData.publicUrl;
}

/**
 * Inserts a new flower into the database.
 */
export async function addFlowerPin({ lat, lng, commonName, botanicalName, file }) {
	try {
		// 1. Upload the image first
		const imageUrl = await uploadFlowerImage(file);

		// 2. Format the location for PostGIS
		// PostGIS expects coordinates in 'POINT(longitude latitude)' format
		const pointLocation = `POINT(${lng} ${lat})`;

		// 3. Insert the record
		const { data, error } = await supabase
			.from('flower_pins')
			.insert([
				{
					location: pointLocation,
					image_path: imageUrl,
					common_name: commonName,
					botanical_name: botanicalName
				}
			])
			.select();

		if (error) throw error;
		return data[0];
	} catch (error) {
		console.error('Failed to add flower:', error);
		return null;
	}
}
