import { defineStore } from "pinia";
import { lastfmService } from "../services/lastfm.api";
import { tagAnalyzer } from "../services/tagAnalyzer";

// Define the tags store
export const useTagsStore = defineStore("tags", {
  // State
  state: () => ({
    username: "yuunaagi", // Default username
    topTags: [],
    loading: false,
    error: null,
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

    // Fetch user's top tags from Last.fm API
    async fetchTopTags() {
      try {
        this.loading = true;
        this.error = null;
        
        console.log('Fetching top tags for user:', this.username);
        
        try {
          // First try the regular API method
          const response = await lastfmService.getUserTopTags(this.username);
          console.log('Raw tags API response:', response);

          if (response && response.toptags && response.toptags.tag && 
              Array.isArray(response.toptags.tag) && response.toptags.tag.length > 0) {
              
            console.log('Successfully fetched tags from API');
            this.topTags = Array.isArray(response.toptags.tag) 
              ? response.toptags.tag 
              : [response.toptags.tag];
  
            console.log(`Received ${this.topTags.length} tags from API`);
  
            // Format tags to ensure they have proper structure
            this.topTags = this.topTags.map((tag) => ({
              name: tag.name || "Unknown",
              count: tag.count || "0",
              url: tag.url || `https://www.last.fm/tag/${encodeURIComponent(tag.name || "Unknown")}`,
            }));
            
            console.log('Processed tags:', this.topTags.slice(0, 5));
            
            if (this.topTags.length > 0) {
              return this.topTags;
            }
          }
          
          // If API returned no tags or failed, use our manual approach
          console.log('No tags from API or empty response, using album-based tag analysis');
          throw new Error('No tags available from API');
          
        } catch (err) {
          console.log('Falling back to manual tag analysis from albums');
          // Fallback to our custom tag analyzer using recent albums
          this.topTags = await tagAnalyzer.getTopTagsFromAlbums(this.username, 5, "7day");
          
          if (!this.topTags || this.topTags.length === 0) {
            throw new Error("Could not retrieve tags from user's albums");
          }
          
          console.log(`Retrieved ${this.topTags.length} tags from album analysis`);
          return this.topTags;
        }
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

    // Clear all tag data
    clearTags() {
      this.topTags = [];
      this.error = null;
    },
  },
});
