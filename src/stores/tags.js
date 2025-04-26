import { defineStore } from "pinia";
import { lastfmService } from "../services/lastfm.api";
import { tagAnalyzer } from "../services/tagAnalyzer";
import { useTracksStore } from "./tracks";

// Define the tags store
export const useTagsStore = defineStore("tags", {
  // State
  state: () => ({
    username: "yuunaagi", // Default username
    topTags: [],
    loading: false,
    error: null,
    period: "overall", // Add period to state to persist between calls
  }),

  // Getters
  getters: {
    // Get top 20 tags sorted by count
    sortedTopTags: (state) => {
      return [...state.topTags].sort((a, b) => parseInt(b.count) - parseInt(a.count)).slice(0, 20);
    },

    // Get chart data for tags
    chartData: (state) => {
      // Take top 15 tags for the chart
      const tags = state.topTags.slice(0, 15);

      return {
        labels: tags.map((tag) => tag.name),
        values: tags.map((tag) => parseInt(tag.count)),
        // Generate color gradient for tags
        colors: tags.map((_, index) => {
          const hue = (index * 20) % 360; // Create a rainbow effect with HSL
          return `hsla(${hue}, 70%, 60%, 0.8)`;
        }),
      };
    },
  },

  // Actions
  actions: {
    // Set username
    setUsername(username) {
      this.username = username;
      console.log('Tags store username set to:', username);
    },

    // Set period
    setPeriod(period) {
      this.period = period;
      console.log('Tags store period set to:', period);
    },

    // Fetch top tags by analyzing the user's top tracks
    async fetchTopTags(period = null) {
      try {
        this.loading = true;
        this.error = null;
        
        // Update period if provided
        if (period) {
          this.period = period;
        }
        
        console.log(`Fetching top tags for user: ${this.username}, period: ${this.period}`);
        
        // Get the tracks store to access track data
        const tracksStore = useTracksStore();
        
        // First, ensure we have top tracks data for the requested period
        if (!tracksStore.topTracks || tracksStore.topTracks.length === 0) {
          console.log('No top tracks data available, fetching now...');
          await tracksStore.fetchTopTracks(this.period);
        }
        
        if (!tracksStore.topTracks || tracksStore.topTracks.length === 0) {
          throw new Error('Could not retrieve top tracks data');
        }
        
        console.log(`Analyzing tags from ${tracksStore.topTracks.length} top tracks`);
        
        // Fetch track details for top 50 tracks to get the tag data
        const tracks = tracksStore.topTracks.slice(0, 50);
        const tagData = await this.analyzeTagsFromTracks(tracks);
        
        // Process the tag data into our format
        this.topTags = tagData;
        console.log(`Retrieved ${this.topTags.length} tags from track analysis`);
        
        return this.topTags;
      } catch (error) {
        console.error('Error in fetchTopTags:', error);
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch top tags",
        };
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Analyze tags from tracks
    async analyzeTagsFromTracks(tracks) {
      try {
        console.log(`Analyzing tags from ${tracks.length} tracks`);
        
        // Create a map to store tag counts
        const tagCounts = {};
        
        // Process tracks in batches to avoid overwhelming the API
        const batchSize = 5;
        const trackBatches = [];
        
        // Split tracks into batches
        for (let i = 0; i < tracks.length; i += batchSize) {
          trackBatches.push(tracks.slice(i, i + batchSize));
        }
        
        // Process each batch
        for (const [batchIndex, batch] of trackBatches.entries()) {
          console.log(`Processing batch ${batchIndex + 1}/${trackBatches.length}`);
          
          // Create an array of promises for each track's tag info
          const batchPromises = batch.map(async (track, trackIndex) => {
            try {
              // Calculate position weight - higher positions get higher weight
              const trackPosition = batchIndex * batchSize + trackIndex;
              const positionWeight = Math.max(1, Math.ceil((50 - trackPosition) / 10)); // More weight for top tracks
              const playCountWeight = Math.log10(parseInt(track.playcount) || 1); // More weight for higher playcount
              
              // Get track info including tags
              const trackInfo = await lastfmService.getTrackInfo(
                track.artist.name || track.artist['#text'], 
                track.name
              );
              
              // Check if we have tags in the response
              if (trackInfo && trackInfo.track && trackInfo.track.toptags && trackInfo.track.toptags.tag) {
                // Get tags from track
                const tags = Array.isArray(trackInfo.track.toptags.tag) 
                  ? trackInfo.track.toptags.tag 
                  : [trackInfo.track.toptags.tag];
                
                // Calculate total weight for this track
                const weight = positionWeight * playCountWeight;
                
                // Add each tag to our count map
                tags.forEach(tag => {
                  if (!tag || !tag.name) return;
                  
                  const tagName = tag.name.toLowerCase().trim();
                  if (tagName) {
                    // Add the weighted count
                    tagCounts[tagName] = (tagCounts[tagName] || 0) + weight;
                  }
                });
                
                console.log(`Processed track: ${track.name} - Found ${tags.length} tags with weight ${weight.toFixed(2)}`);
              }
            } catch (error) {
              console.error(`Error processing track: ${track.name} - ${error.message}`);
            }
          });
          
          // Wait for all promises in this batch
          await Promise.all(batchPromises);
          
          // Pause briefly between batches to be kind to the API
          if (batchIndex < trackBatches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        // Convert the tag counts map to an array
        const sortedTags = Object.entries(tagCounts)
          .map(([name, count]) => ({
            name,
            count: Math.round(count).toString(), // Convert to string to match expected format
            url: `https://www.last.fm/tag/${encodeURIComponent(name)}`,
          }))
          .sort((a, b) => parseInt(b.count) - parseInt(a.count));
        
        console.log(`Found ${sortedTags.length} unique tags, top 5:`, 
          sortedTags.slice(0, 5).map(t => `${t.name} (${t.count})`));
        
        return sortedTags;
      } catch (error) {
        console.error('Error analyzing tags from tracks:', error);
        throw error;
      }
    },

    // Clear all tag data
    clearTags() {
      this.topTags = [];
      this.error = null;
    },
  },
});
