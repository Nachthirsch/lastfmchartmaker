import { defineStore } from "pinia";
import { lastfmService } from "../services/lastfm.api";

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
        // Get artist images if available - prioritize from detailed info if available
        images: artists.map((artist) => {
          const detailedInfo = state.detailedArtistsInfo[artist.name];
          if (detailedInfo && detailedInfo.artist && detailedInfo.artist.image) {
            return lastfmService.getLargeImage(detailedInfo.artist.image);
          }
          return lastfmService.getLargeImage(artist.image || []);
        }),
      };
    },

    // Get artist image URL from selected artist info - prioritize large images
    selectedArtistImage: (state) => {
      if (!state.selectedArtistInfo || !state.selectedArtistInfo.artist) return "";

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

    // Get artist large image for a specific artist
    getArtistLargeImage: (state) => (artistName) => {
      const detailedInfo = state.detailedArtistsInfo[artistName];
      if (detailedInfo && detailedInfo.artist && detailedInfo.artist.image) {
        return lastfmService.getLargeImage(detailedInfo.artist.image);
      }

      // Fallback to image from top artists list
      const artist = state.topArtists.find((a) => a.name === artistName);
      return artist && artist.image ? lastfmService.getLargeImage(artist.image) : "";
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
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getTopArtists(this.username, period, limit, page);

        if (response && response.topartists && response.topartists.artist) {
          this.topArtists = response.topartists.artist;

          // After getting top artists, fetch detailed info for the top 12 that will be displayed
          await this.fetchDetailedInfoForTopArtists(12);
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

    // Fetch detailed artist info
    async fetchArtistInfo(artistName) {
      try {
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getArtistInfo(artistName);

        if (response && response.artist) {
          this.selectedArtistInfo = response;
        } else {
          throw new Error("Invalid response format");
        }

        return this.selectedArtistInfo;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch artist info",
        };
        console.error("Error in fetchArtistInfo:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch detailed info for multiple artists
    async fetchDetailedInfoForTopArtists(count = 12) {
      try {
        // Get the top N artists to fetch detailed info for
        const artistsToFetch = this.topArtists.slice(0, count);

        // Create an array of promises for parallel fetching
        const fetchPromises = artistsToFetch.map((artist) =>
          lastfmService
            .getArtistInfo(artist.name)
            .then((info) => ({ name: artist.name, info }))
            .catch((error) => {
              console.error(`Error fetching info for ${artist.name}:`, error);
              return { name: artist.name, info: null };
            })
        );

        // Wait for all promises to resolve
        const results = await Promise.all(fetchPromises);

        // Update the detailed artists info state
        const newDetailedInfo = {};
        results.forEach((result) => {
          if (result.info) {
            newDetailedInfo[result.name] = result.info;
          }
        });

        this.detailedArtistsInfo = { ...this.detailedArtistsInfo, ...newDetailedInfo };

        return this.detailedArtistsInfo;
      } catch (error) {
        console.error("Error fetching detailed info for multiple artists:", error);
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
      this.error = null;
    },
  },
});
