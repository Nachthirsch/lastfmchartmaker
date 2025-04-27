import axios from "axios";

// Create an Axios instance for Spotify API requests
const spotifyAPI = axios.create({
  baseURL: "https://api.spotify.com/v1",
  timeout: 10000,
});

// Create a separate instance for authentication requests
const spotifyAuthAPI = axios.create({
  baseURL: "https://accounts.spotify.com/api/token",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
});

// Spotify API service
export const spotifyService = {
  // Authentication state
  token: null,
  tokenExpiry: null,
  
  // Get access token using client credentials flow
  async getToken() {
    try {
      // Return existing token if still valid
      if (this.token && this.tokenExpiry > Date.now()) {
        console.log("[SPOTIFY] Using existing token");
        return this.token;
      }
      
      console.log("[SPOTIFY] Getting new access token");
      
      // Get the client ID and client secret from environment variables
      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        console.error("[SPOTIFY ERROR] Missing client ID or client secret");
        throw new Error("Spotify API credentials are missing");
      }
      
      // Encode credentials for Authorization header
      const credentials = btoa(`${clientId}:${clientSecret}`);
      
      // Request a new token
      const response = await spotifyAuthAPI.post('', 'grant_type=client_credentials', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });
      
      this.token = response.data.access_token;
      // Convert expiry time to milliseconds and store as timestamp
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      console.log("[SPOTIFY] New token acquired, expires in", response.data.expires_in, "seconds");
      
      return this.token;
    } catch (error) {
      console.error("[SPOTIFY ERROR] Failed to get access token:", error);
      throw error;
    }
  },
  
  // Set authorization header for requests
  async setAuthHeader() {
    const token = await this.getToken();
    spotifyAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  // Search for an artist by name
  async searchArtist(artistName) {
    try {
      console.log(`[SPOTIFY] Searching for artist: "${artistName}"`);
      
      await this.setAuthHeader();
      
      const response = await spotifyAPI.get('/search', {
        params: {
          q: artistName,
          type: 'artist',
          limit: 1
        }
      });
      
      if (response.data.artists.items.length === 0) {
        console.log(`[SPOTIFY] No artists found for "${artistName}"`);
        return null;
      }
      
      const artist = response.data.artists.items[0];
      console.log(`[SPOTIFY] Found artist: "${artist.name}" (ID: ${artist.id})`);
      
      return artist;
    } catch (error) {
      console.error(`[SPOTIFY ERROR] Failed to search for artist "${artistName}":`, error);
      return null;
    }
  },
  
  // Get artist by Spotify ID
  async getArtist(artistId) {
    try {
      console.log(`[SPOTIFY] Getting artist with ID: ${artistId}`);
      
      await this.setAuthHeader();
      
      const response = await spotifyAPI.get(`/artists/${artistId}`);
      return response.data;
    } catch (error) {
      console.error(`[SPOTIFY ERROR] Failed to get artist with ID ${artistId}:`, error);
      return null;
    }
  },
  
  // Get artist data by name (for compatibility with apiUtils)
  async getArtistData(artistName) {
    try {
      console.log(`[SPOTIFY] Getting artist data for: "${artistName}"`);
      
      // First search for the artist
      const artist = await this.searchArtist(artistName);
      
      if (!artist) {
        console.log(`[SPOTIFY] No artist found for "${artistName}"`);
        return null;
      }
      
      // Return the artist data directly
      return artist;
    } catch (error) {
      console.error(`[SPOTIFY ERROR] Failed to get artist data for "${artistName}":`, error);
      return null;
    }
  },
  
  // Get artist image URL by artist name
  async getArtistImageUrl(artistName) {
    try {
      // First search for the artist
      const artist = await this.searchArtist(artistName);
      
      if (!artist) {
        return null;
      }
      
      // Check if artist has images
      if (!artist.images || artist.images.length === 0) {
        console.log(`[SPOTIFY] No images available for artist "${artistName}"`);
        return null;
      }
      
      // Get the best image (preferably medium size for balance between quality and performance)
      let imageUrl;
      
      if (artist.images.length >= 2) {
        // If multiple images, use the medium-sized one (usually index 1)
        imageUrl = artist.images[1].url;
      } else {
        // Otherwise use the first available image
        imageUrl = artist.images[0].url;
      }
      
      console.log(`[SPOTIFY] Got image URL for "${artistName}":`, imageUrl);
      return imageUrl;
    } catch (error) {
      console.error(`[SPOTIFY ERROR] Failed to get image for artist "${artistName}":`, error);
      return null;
    }
  },
  
  // Get multiple artist image URLs in one batch (to reduce API calls)
  async getMultipleArtistImages(artistNames) {
    try {
      console.log(`[SPOTIFY] Getting images for ${artistNames.length} artists`);
      
      const results = {};
      
      // Process in batches to avoid rate limiting
      const batchSize = 10;
      for (let i = 0; i < artistNames.length; i += batchSize) {
        const batch = artistNames.slice(i, i + batchSize);
        console.log(`[SPOTIFY] Processing batch ${i/batchSize + 1}: ${batch.join(', ')}`);
        
        // Create promises for each artist in the batch
        const promises = batch.map(name => 
          this.getArtistImageUrl(name)
            .then(url => ({ name, url }))
            .catch(() => ({ name, url: null }))
        );
        
        // Wait for all promises in this batch
        const batchResults = await Promise.all(promises);
        
        // Add results to the output object
        batchResults.forEach(result => {
          results[result.name] = result.url;
        });
        
        // Small delay between batches to be gentle on the API
        if (i + batchSize < artistNames.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`[SPOTIFY] Completed fetching images for ${Object.keys(results).length} artists`);
      return results;
    } catch (error) {
      console.error('[SPOTIFY ERROR] Failed to get multiple artist images:', error);
      return {};
    }
  }
};

export default spotifyService; 