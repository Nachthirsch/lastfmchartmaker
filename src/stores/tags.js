import { defineStore } from "pinia";
import { lastfmService } from "../services/lastfm.api";

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
    },

    // Fetch user's top tags from Last.fm API
    async fetchTopTags() {
      try {
        this.loading = true;
        this.error = null;

        const response = await lastfmService.getUserTopTags(this.username);

        if (response && response.toptags && response.toptags.tag) {
          this.topTags = Array.isArray(response.toptags.tag) ? response.toptags.tag : [response.toptags.tag];

          // Format tags to ensure they have proper structure based on sample response
          this.topTags = this.topTags.map((tag) => ({
            name: tag.name,
            count: tag.count || "0",
            url: tag.url || `https://www.last.fm/tag/${encodeURIComponent(tag.name)}`,
          }));
        } else {
          throw new Error("Invalid response format");
        }

        return this.topTags;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch top tags",
        };
        console.error("Error in fetchTopTags:", error);
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
