import { defineStore } from "pinia";
import { lastfmService } from "../services/lastfm.api";

// Define the albums store
export const useAlbumsStore = defineStore("albums", {
  // State
  state: () => ({
    username: "yuunaagi", // Default username set to 'yuunaagi'
    topAlbums: [],
    weeklyAlbums: [],
    loading: false,
    error: null,
    selectedAlbumInfo: null, // New state for storing detailed album info
  }),

  // Getters
  getters: {
    // Get albums sorted by playcount
    sortedByPlaycount: (state) => {
      return [...state.topAlbums].sort((a, b) => parseInt(b.playcount) - parseInt(a.playcount));
    },

    // Get top 10 albums
    topTenAlbums: (state) => {
      return state.topAlbums.slice(0, 10);
    },

    // Get chart data formatted for Chart.js
    chartData: (state) => {
      // Take top 15 albums for the chart
      const albums = state.topAlbums.slice(0, 15);

      return {
        labels: albums.map((album) => `${album.name} - ${album.artist.name}`),
        values: albums.map((album) => parseInt(album.playcount)),
        // Generate random colors for each album
        colors: albums.map(() => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.7)`),
        // Get album images for enhanced visualization - prioritize large images
        images: albums.map((album) => lastfmService.getLargeImage(album.image || [])),
      };
    },

    // Get selected album's cover image - prioritize large images
    selectedAlbumImage: (state) => {
      if (!state.selectedAlbumInfo || !state.selectedAlbumInfo.album) return "";

      const images = state.selectedAlbumInfo.album.image || [];
      return lastfmService.getLargeImage(images);
    },

    // Get formatted album metadata
    albumMetadata: (state) => {
      if (!state.selectedAlbumInfo || !state.selectedAlbumInfo.album) return null;

      const album = state.selectedAlbumInfo.album;
      return {
        name: album.name,
        artist: album.artist,
        releaseDate: album.releasedate ? album.releasedate.trim() : "Unknown",
        listeners: album.listeners ? parseInt(album.listeners).toLocaleString() : "Unknown",
        playcount: album.playcount ? parseInt(album.playcount).toLocaleString() : "Unknown",
        tracks: album.tracks?.track ? (Array.isArray(album.tracks.track) ? album.tracks.track : [album.tracks.track]) : [],
        url: album.url,
      };
    },
  },

  // Actions
  actions: {
    // Set username
    setUsername(username) {
      this.username = username;
    },

    // Fetch top albums from Last.fm API
    async fetchTopAlbums(period = "overall", limit = 50, page = 1) {
      try {
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getTopAlbums(this.username, period, limit, page);

        if (response && response.topalbums && response.topalbums.album) {
          this.topAlbums = response.topalbums.album;
        } else {
          throw new Error("Invalid response format");
        }

        return this.topAlbums;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch top albums",
        };
        console.error("Error in fetchTopAlbums:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch weekly album chart from Last.fm API
    async fetchWeeklyAlbumChart(from = null, to = null) {
      try {
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getWeeklyAlbumChart(this.username, from, to);

        if (response && response.weeklyalbumchart && response.weeklyalbumchart.album) {
          this.weeklyAlbums = response.weeklyalbumchart.album;
        } else {
          throw new Error("Invalid response format");
        }

        return this.weeklyAlbums;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch weekly album chart",
        };
        console.error("Error in fetchWeeklyAlbumChart:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // NEW: Fetch detailed album info
    async fetchAlbumInfo(artist, album) {
      try {
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getAlbumInfo(artist, album);

        if (response && response.album) {
          this.selectedAlbumInfo = response;
        } else {
          throw new Error("Invalid response format");
        }

        return this.selectedAlbumInfo;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch album info",
        };
        console.error("Error in fetchAlbumInfo:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Clear all album data
    clearAlbums() {
      this.topAlbums = [];
      this.weeklyAlbums = [];
      this.selectedAlbumInfo = null;
      this.error = null;
    },
  },
});
