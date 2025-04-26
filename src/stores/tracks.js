import { defineStore } from "pinia";
import { lastfmService } from "../services/lastfm.api";

// Define the tracks store
export const useTracksStore = defineStore("tracks", {
  // State
  state: () => ({
    username: "yuunaagi", // Default username set to 'yuunaagi'
    topTracks: [],
    weeklyTracks: [],
    recentTracks: [],
    loading: false,
    error: null,
    selectedTrackInfo: null, // State for storing detailed track info
  }),

  // Getters
  getters: {
    // Get tracks sorted by playcount
    sortedByPlaycount: (state) => {
      return [...state.topTracks].sort((a, b) => parseInt(b.playcount) - parseInt(a.playcount));
    },

    // Get top 10 tracks
    topTenTracks: (state) => {
      return state.topTracks.slice(0, 10);
    },

    // Get chart data formatted for Chart.js
    chartData: (state) => {
      // Take top 15 tracks for the chart
      const tracks = state.topTracks.slice(0, 15);

      return {
        labels: tracks.map((track) => `${track.name} - ${track.artist.name}`),
        values: tracks.map((track) => parseInt(track.playcount)),
        // Generate random colors for each track
        colors: tracks.map(() => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.7)`),
        // Use Spotify images if available, otherwise fallback to Last.fm
        images: tracks.map((track) => track.spotifyImage || lastfmService.getLargeImage(track.image || [])),
      };
    },

    // Format recent tracks for display
    formattedRecentTracks: (state) => {
      return state.recentTracks.map((track) => {
        // Check if track is currently playing
        const isNowPlaying = track["@attr"] && track["@attr"].nowplaying === "true";

        // Get album image - prioritize Spotify, fallback to Last.fm
        const imageUrl = track.spotifyImage || 
                        (track.image ? lastfmService.getLargeImage(track.image) : "");

        return {
          name: track.name,
          artist: track.artist["#text"] || track.artist.name,
          album: track.album ? track.album["#text"] : "",
          imageUrl,
          date: isNowPlaying ? "Now Playing" : track.date ? track.date["#text"] : "",
          url: track.url,
          isNowPlaying,
        };
      });
    },

    // Get selected track's album image
    selectedTrackImage: (state) => {
      if (!state.selectedTrackInfo || !state.selectedTrackInfo.track) return "";

      // Try to get Spotify image first
      const trackInfo = state.selectedTrackInfo.track;
      
      if (trackInfo.spotifyImage) {
        return trackInfo.spotifyImage;
      }

      // Fallback to Last.fm images
      if (trackInfo.album && trackInfo.album.image) {
        return lastfmService.getLargeImage(trackInfo.album.image);
      }

      // Last resort: track image if available
      if (trackInfo.image) {
        return lastfmService.getLargeImage(trackInfo.image);
      }

      return "";
    },

    // Get formatted track metadata
    trackMetadata: (state) => {
      if (!state.selectedTrackInfo || !state.selectedTrackInfo.track) return null;

      const track = state.selectedTrackInfo.track;

      // Format duration from milliseconds to MM:SS
      let formattedDuration = "Unknown";
      if (track.duration) {
        const durationInSeconds = Math.floor(parseInt(track.duration) / 1000);
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }

      return {
        name: track.name,
        artist: track.artist?.name || track.artist,
        album: track.album?.title || track.album?.name || "",
        listeners: track.listeners ? parseInt(track.listeners).toLocaleString() : "Unknown",
        playcount: track.playcount ? parseInt(track.playcount).toLocaleString() : "Unknown",
        duration: formattedDuration,
        wiki: track.wiki
          ? {
              summary: track.wiki.summary,
              content: track.wiki.content,
              published: track.wiki.published,
            }
          : null,
        url: track.url,
      };
    },
  },

  // Actions
  actions: {
    // Set username
    setUsername(username) {
      this.username = username;
    },

    // Fetch top tracks from Last.fm API
    async fetchTopTracks(period = "overall", limit = 50, page = 1) {
      try {
        console.log(`[STORE] Fetching top tracks for user: ${this.username}, period: ${period}, limit: ${limit}, page: ${page}`);
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getTopTracks(this.username, period, limit, page);

        if (response && response.toptracks && response.toptracks.track) {
          this.topTracks = response.toptracks.track;
          console.log(`[STORE] Fetched ${this.topTracks.length} top tracks`);
          
          // Fetch Spotify images for top tracks
          await this.fetchSpotifyImagesForTracks(this.topTracks);
        } else {
          throw new Error("Invalid response format");
        }

        return this.topTracks;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch top tracks",
        };
        console.error("[STORE ERROR] Error in fetchTopTracks:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch weekly track chart from Last.fm API
    async fetchWeeklyTrackChart(from = null, to = null) {
      try {
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getWeeklyTrackChart(this.username, from, to);

        if (response && response.weeklytrackchart && response.weeklytrackchart.track) {
          this.weeklyTracks = response.weeklytrackchart.track;
        } else {
          throw new Error("Invalid response format");
        }

        return this.weeklyTracks;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch weekly track chart",
        };
        console.error("Error in fetchWeeklyTrackChart:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch recent tracks from Last.fm API
    async fetchRecentTracks(limit = 20, page = 1) {
      try {
        console.log(`[STORE] Fetching recent tracks for user: ${this.username}, limit: ${limit}, page: ${page}`);
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getRecentTracks(this.username, limit, page);

        if (response && response.recenttracks && response.recenttracks.track) {
          this.recentTracks = response.recenttracks.track;
          console.log(`[STORE] Fetched ${this.recentTracks.length} recent tracks`);
          
          // Fetch Spotify images for recent tracks
          await this.fetchSpotifyImagesForTracks(this.recentTracks);
        } else {
          throw new Error("Invalid response format");
        }

        return this.recentTracks;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch recent tracks",
        };
        console.error("[STORE ERROR] Error in fetchRecentTracks:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch detailed track info
    async fetchTrackInfo(artist, track) {
      try {
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getTrackInfo(artist, track);

        if (response && response.track) {
          this.selectedTrackInfo = response;
          
          // Add Spotify image to the track
          if (this.selectedTrackInfo.track) {
            const spotifyImage = await lastfmService.getSpotifyTrackImage(
              this.selectedTrackInfo.track.name, 
              this.selectedTrackInfo.track.artist?.name || artist
            );
            
            if (spotifyImage) {
              this.selectedTrackInfo.track.spotifyImage = spotifyImage;
            }
          }
        } else {
          throw new Error("Invalid response format");
        }

        return this.selectedTrackInfo;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch track info",
        };
        console.error("Error in fetchTrackInfo:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Clear all track data
    clearTracks() {
      this.topTracks = [];
      this.weeklyTracks = [];
      this.recentTracks = [];
      this.selectedTrackInfo = null;
      this.error = null;
    },

    // Fetch Spotify images for tracks
    async fetchSpotifyImagesForTracks(tracks) {
      try {
        console.log(`[STORE] Fetching Spotify images for ${tracks.length} tracks`);
        
        // Process in batches to avoid overwhelming the API
        const batchSize = 5;
        const trackBatches = [];
        
        // Split tracks into batches
        for (let i = 0; i < tracks.length; i += batchSize) {
          trackBatches.push(tracks.slice(i, i + batchSize));
        }
        
        // Process each batch
        for (const batch of trackBatches) {
          await Promise.all(
            batch.map(async (track) => {
              try {
                const artistName = track.artist.name || track.artist["#text"] || "";
                const trackName = track.name;
                
                if (!artistName || !trackName) {
                  console.log(`[STORE] Missing artist or track name for Spotify image fetch`);
                  return;
                }
                
                // Fetch the Spotify image
                const spotifyImage = await lastfmService.getSpotifyTrackImage(trackName, artistName);
                
                // Add the Spotify image URL to the track object
                if (spotifyImage) {
                  track.spotifyImage = spotifyImage;
                }
              } catch (error) {
                console.error(`[STORE ERROR] Error fetching Spotify image for "${track.name}":`, error);
              }
            })
          );
          
          // Small delay between batches to be nice to the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`[STORE] Finished fetching Spotify images`);
      } catch (error) {
        console.error(`[STORE ERROR] Error in fetchSpotifyImagesForTracks:`, error);
      }
    },
  },
});
