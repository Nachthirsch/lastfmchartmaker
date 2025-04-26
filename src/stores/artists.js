import { defineStore } from "pinia";
import { lastfmService } from "../services/lastfm.api";
import { spotifyService } from "../services/spotify.api";

// Define a type for the artist state
/**
 * @typedef {Object} ArtistState
 * @property {string} username - The Last.fm username
 * @property {Array} topArtists - List of top artists
 * @property {Array} weeklyArtists - List of weekly artists
 * @property {boolean} loading - Loading state flag
 * @property {Object|null} error - Error information
 * @property {Object|null} selectedArtistInfo - Detailed info for selected artist
 * @property {Object} detailedArtistsInfo - Detailed info for multiple artists
 */

// Define the artists store
export const useArtistsStore = defineStore("artists", {
  // State
  state: () => ({
    username: "yuunaagi", // Default username set to 'yuunaagi'
    topArtists: [],
    weeklyArtists: [],
    loading: false,
    error: null,
    selectedArtistInfo: null, // State for storing detailed artist info
    detailedArtistsInfo: {}, // State for storing detailed info for multiple artists
    correctedArtistNames: {}, // Store for mapping original names to corrected names
    artistImages: {}, // Store for Spotify artist images
  }),

  // Getters
  getters: {
    // Get artists sorted by playcount
    sortedByPlaycount: (state) => {
      return [...state.topArtists].sort((a, b) => parseInt(b.playcount) - parseInt(a.playcount));
    },

    // Get top 10 artists
    topTenArtists: (state) => {
      return state.topArtists.slice(0, 10);
    },

    // Get chart data formatted for Chart.js
    chartData: (state) => {
      // Take top 15 artists for the chart
      const artists = state.topArtists.slice(0, 15);

      return {
        labels: artists.map((artist) => artist.name),
        values: artists.map((artist) => parseInt(artist.playcount)),
        // Generate random colors for each artist
        colors: artists.map(() => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.7)`),
        // Get artist images if available - prioritize Spotify images
        images: artists.map((artist) => {
          // First try Spotify image
          if (state.artistImages[artist.name]) {
            return state.artistImages[artist.name];
          }
          
          // Fall back to Last.fm image if available
          const detailedInfo = state.detailedArtistsInfo[artist.name];
          if (detailedInfo && detailedInfo.artist && detailedInfo.artist.image) {
            return lastfmService.getLargeImage(detailedInfo.artist.image);
          }
          
          return lastfmService.getLargeImage(artist.image || []);
        }),
      };
    },

    // Get artist image URL from selected artist info - prioritize Spotify images
    selectedArtistImage: (state) => {
      if (!state.selectedArtistInfo || !state.selectedArtistInfo.artist) return "";

      // First check if we have a Spotify image
      const artistName = state.selectedArtistInfo.artist.name;
      if (artistName && state.artistImages[artistName]) {
        return state.artistImages[artistName];
      }

      // Fall back to Last.fm image
      const images = state.selectedArtistInfo.artist.image || [];
      return lastfmService.getLargeImage(images);
    },

    // Get similar artists from the detailed artist info
    similarArtists: (state) => {
      if (!state.selectedArtistInfo || !state.selectedArtistInfo.artist || !state.selectedArtistInfo.artist.similar) {
        return [];
      }

      const similar = state.selectedArtistInfo.artist.similar.artist || [];
      return Array.isArray(similar) ? similar : [similar];
    },

    // Get formatted artist stats
    artistStats: (state) => {
      if (!state.selectedArtistInfo || !state.selectedArtistInfo.artist) return null;

      const artist = state.selectedArtistInfo.artist;
      const stats = artist.stats || {};

      return {
        listeners: stats.listeners ? parseInt(stats.listeners).toLocaleString() : "Unknown",
        playcount: stats.playcount ? parseInt(stats.playcount).toLocaleString() : "Unknown",
        userPlaycount: stats.userplaycount ? parseInt(stats.userplaycount).toLocaleString() : "Unknown",
      };
    },

    // Get artist large image for a specific artist - prioritize Spotify images
    getArtistLargeImage: (state) => (artistName) => {
      console.log(`[STORE] Attempting to get large image for artist: "${artistName}"`);
      
      // First check if we have a Spotify image
      if (state.artistImages[artistName]) {
        console.log(`[STORE] Found Spotify image for "${artistName}": ${state.artistImages[artistName]}`);
        return state.artistImages[artistName];
      }
      
      // Next check if we have detailed info for this artist (Last.fm image)
      const detailedInfo = state.detailedArtistsInfo[artistName];
      if (detailedInfo && detailedInfo.artist && detailedInfo.artist.image) {
        const imageUrl = lastfmService.getLargeImage(detailedInfo.artist.image);
        console.log(`[STORE] Found Last.fm image from detailed info for "${artistName}":`, imageUrl || 'No valid URL');
        return imageUrl;
      }

      // Next check if we have the corrected name version
      const correctedName = state.correctedArtistNames[artistName];
      if (correctedName) {
        // Check for Spotify image with corrected name
        if (state.artistImages[correctedName]) {
          console.log(`[STORE] Found Spotify image using corrected name: "${correctedName}" for artist "${artistName}"`);
          return state.artistImages[correctedName];
        }
        
        // Then check for Last.fm image with corrected name
        if (state.detailedArtistsInfo[correctedName]) {
          console.log(`[STORE] Using corrected name: "${correctedName}" for artist "${artistName}"`);
          const correctedInfo = state.detailedArtistsInfo[correctedName];
          if (correctedInfo.artist && correctedInfo.artist.image) {
            const imageUrl = lastfmService.getLargeImage(correctedInfo.artist.image);
            console.log(`[STORE] Found Last.fm image from corrected name "${correctedName}":`, imageUrl || 'No valid URL');
            return imageUrl;
          }
        }
      }

      // Fallback to image from top artists list
      const artist = state.topArtists.find((a) => a.name === artistName);
      if (artist && artist.image) {
        const imageUrl = lastfmService.getLargeImage(artist.image);
        console.log(`[STORE] Found Last.fm image from top artists list for "${artistName}":`, imageUrl || 'No valid URL');
        return imageUrl;
      }

      // Default placeholder if no image found
      console.log(`[STORE] No image found for artist "${artistName}", using placeholder`);
      return "https://via.placeholder.com/300?text=No+Image";
    },
  },

  // Actions
  actions: {
    // Set username
    setUsername(username) {
      this.username = username;
    },

    // Fetch top artists from Last.fm API
    async fetchTopArtists(period = "overall", limit = 50, page = 1) {
      try {
        console.log(`[STORE] Fetching top artists for user: ${this.username}, period: ${period}`);
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getTopArtists(this.username, period, limit, page);

        if (response && response.topartists && response.topartists.artist) {
          this.topArtists = response.topartists.artist;
          console.log(`[STORE] Fetched ${this.topArtists.length} top artists`);

          // After getting top artists, fetch detailed info and Spotify images
          await this.fetchDetailedInfoForTopArtists(12);
          await this.fetchSpotifyImagesForTopArtists(12);
        } else {
          throw new Error("Invalid response format");
        }

        return this.topArtists;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch top artists",
        };
        console.error("Error in fetchTopArtists:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch Spotify images for top artists
    async fetchSpotifyImagesForTopArtists(count = 12) {
      try {
        console.log(`[STORE] Fetching Spotify images for top ${count} artists`);
        
        // Get the top N artists to fetch images for
        const artistsToFetch = this.topArtists.slice(0, count);
        
        if (artistsToFetch.length === 0) {
          console.log(`[STORE] No artists to fetch images for`);
          return;
        }
        
        const artistNames = artistsToFetch.map(artist => artist.name);
        console.log(`[STORE] Artists to fetch Spotify images for:`, artistNames);
        
        // Fetch images for all artists in one batch (more efficient)
        const images = await spotifyService.getMultipleArtistImages(artistNames);
        
        // Update the store with new images
        this.artistImages = { ...this.artistImages, ...images };
        
        console.log(`[STORE] Fetched ${Object.keys(images).length} Spotify images`);
        
        // Also get images for corrected artist names
        const correctedNames = Object.values(this.correctedArtistNames)
          .filter(name => !artistNames.includes(name) && !images[name]);
        
        if (correctedNames.length > 0) {
          console.log(`[STORE] Fetching additional Spotify images for ${correctedNames.length} corrected names`);
          const additionalImages = await spotifyService.getMultipleArtistImages(correctedNames);
          this.artistImages = { ...this.artistImages, ...additionalImages };
        }
        
        return this.artistImages;
      } catch (error) {
        console.error("[STORE ERROR] Error fetching Spotify images:", error);
        // Don't throw the error, as this is a supplementary operation
        return null;
      }
    },

    // Fetch weekly artist chart from Last.fm API
    async fetchWeeklyArtistChart(from = null, to = null) {
      try {
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getWeeklyArtistChart(this.username, from, to);

        if (response && response.weeklyartistchart && response.weeklyartistchart.artist) {
          this.weeklyArtists = response.weeklyartistchart.artist;
        } else {
          throw new Error("Invalid response format");
        }

        return this.weeklyArtists;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch weekly artist chart",
        };
        console.error("Error in fetchWeeklyArtistChart:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch detailed artist info with name correction
    async fetchArtistInfo(artistName) {
      try {
        console.log(`[STORE] Fetching detailed info for artist: "${artistName}"`);
        this.loading = true;
        this.error = null;

        // Use the new method that includes name correction
        const response = await lastfmService.getArtistInfoWithCorrection(artistName);

        if (response && response.artist) {
          console.log(`[STORE] Successfully fetched info for artist: "${artistName}"`);
          this.selectedArtistInfo = response;
          
          // If the artist name was corrected, store the mapping
          if (response.artist.name !== artistName) {
            console.log(`[STORE] Storing correction mapping: "${artistName}" -> "${response.artist.name}"`);
            this.correctedArtistNames[artistName] = response.artist.name;
            // Also store the detailed info under the corrected name
            this.detailedArtistsInfo[response.artist.name] = response;
            console.log(`[STORE] Stored detailed info under corrected name: "${response.artist.name}"`);
          }
          
          // Always store the result under the original name too
          this.detailedArtistsInfo[artistName] = response;
          console.log(`[STORE] Stored detailed info under original name: "${artistName}"`);
          
          // Check for images
          if (response.artist.image && response.artist.image.length > 0) {
            const imageUrl = lastfmService.getLargeImage(response.artist.image);
            console.log(`[STORE] Artist "${response.artist.name}" has Last.fm image URL:`, imageUrl || 'No valid URL');
          } else {
            console.log(`[STORE] Artist "${response.artist.name}" has no images in the Last.fm response`);
          }
          
          // Also fetch Spotify image if we don't have it yet
          if (!this.artistImages[response.artist.name]) {
            console.log(`[STORE] Fetching Spotify image for "${response.artist.name}"`);
            const spotifyImageUrl = await spotifyService.getArtistImageUrl(response.artist.name);
            
            if (spotifyImageUrl) {
              console.log(`[STORE] Found Spotify image for "${response.artist.name}": ${spotifyImageUrl}`);
              this.artistImages[response.artist.name] = spotifyImageUrl;
              
              // Also store under the original name if it was corrected
              if (response.artist.name !== artistName) {
                this.artistImages[artistName] = spotifyImageUrl;
              }
            }
          }
        } else {
          console.warn(`[STORE] Invalid response format for artist: "${artistName}"`, response);
          throw new Error("Invalid response format");
        }

        return this.selectedArtistInfo;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch artist info",
        };
        console.error(`[STORE ERROR] Error in fetchArtistInfo for "${artistName}":`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch detailed info for multiple artists with name correction
    async fetchDetailedInfoForTopArtists(count = 12) {
      try {
        console.log(`[STORE] Fetching detailed info for top ${count} artists`);
        
        // Get the top N artists to fetch detailed info for
        const artistsToFetch = this.topArtists.slice(0, count);
        console.log(`[STORE] Artists to fetch:`, artistsToFetch.map(a => a.name));

        // Create an array of promises for parallel fetching
        const fetchPromises = artistsToFetch.map((artist) =>
          lastfmService.getArtistInfoWithCorrection(artist.name)
            .then((info) => {
              // If the artist name was corrected, store the mapping
              if (info.artist && info.artist.name !== artist.name) {
                console.log(`[STORE] Found correction for "${artist.name}" -> "${info.artist.name}"`);
                this.correctedArtistNames[artist.name] = info.artist.name;
              }
              return { 
                name: artist.name, 
                correctedName: info.artist ? info.artist.name : artist.name, 
                info,
                hasImages: info.artist && info.artist.image && info.artist.image.length > 0
              };
            })
            .catch((error) => {
              console.error(`[STORE ERROR] Error fetching info for "${artist.name}":`, error);
              return { name: artist.name, info: null };
            })
        );

        // Wait for all promises to resolve
        const results = await Promise.all(fetchPromises);
        console.log(`[STORE] Got detailed info for ${results.filter(r => r.info).length}/${count} artists`);

        // Update the detailed artists info state
        const newDetailedInfo = {};
        results.forEach((result) => {
          if (result.info) {
            // Store under both original and corrected names for easy lookup
            newDetailedInfo[result.name] = result.info;
            console.log(`[STORE] Storing info for "${result.name}"${result.hasImages ? ' (has images)' : ' (no images)'}`);
            
            if (result.correctedName && result.correctedName !== result.name) {
              newDetailedInfo[result.correctedName] = result.info;
              console.log(`[STORE] Also storing info under corrected name "${result.correctedName}"`);
            }
          }
        });

        this.detailedArtistsInfo = { ...this.detailedArtistsInfo, ...newDetailedInfo };
        console.log(`[STORE] Updated detailed artists info. Total artists with info:`, Object.keys(this.detailedArtistsInfo).length);
        console.log(`[STORE] Artist corrections mapping:`, this.correctedArtistNames);

        return this.detailedArtistsInfo;
      } catch (error) {
        console.error("[STORE ERROR] Error fetching detailed info for multiple artists:", error);
        // Don't throw the error here, as this is a supplementary operation
        return null;
      }
    },

    // Clear all artist data
    clearArtists() {
      this.topArtists = [];
      this.weeklyArtists = [];
      this.selectedArtistInfo = null;
      this.detailedArtistsInfo = {};
      this.correctedArtistNames = {};
      this.artistImages = {};
      this.error = null;
    },
  },
});
