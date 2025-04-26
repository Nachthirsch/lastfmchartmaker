import { defineStore } from "pinia";
import { lastfmService } from "../services/lastfm.api";

// Define the user store
export const useUserStore = defineStore("user", {
  // State
  state: () => ({
    username: "", // Current username
    userInfo: null, // Detailed user info
    loading: false,
    error: null,
  }),

  // Getters
  getters: {
    // Get user profile image
    userImage: (state) => {
      if (!state.userInfo || !state.userInfo.user) return "";
      
      // Get largest available image
      const images = state.userInfo.user.image || [];
      return lastfmService.getLargeImage(images);
    },
    
    // Get formatted user stats
    userStats: (state) => {
      if (!state.userInfo || !state.userInfo.user) return null;
      
      const user = state.userInfo.user;
      return {
        playcount: user.playcount ? parseInt(user.playcount).toLocaleString() : "Unknown",
        playlists: user.playlists ? parseInt(user.playlists).toLocaleString() : "Unknown",
        registered: user.registered ? user.registered.unixtime || user.registered : null,
        registeredDate: user.registered ? user.registered["#text"] || user.registered : "Unknown",
        country: user.country || "Unknown",
        age: user.age || "Unknown",
        realname: user.realname || "",
        subscriber: user.subscriber === "1" || user.subscriber === 1,
        url: user.url || "",
      };
    },
    
    // Get formatted registration date
    registrationInfo: (state) => {
      if (!state.userInfo || !state.userInfo.user || !state.userInfo.user.registered) return null;
      
      const registered = state.userInfo.user.registered;
      const timestamp = registered.unixtime || registered;
      
      if (timestamp) {
        const date = new Date(parseInt(timestamp) * 1000); // Convert Unix timestamp to milliseconds
        return {
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          fullDate: date.toLocaleString(),
          years: Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24 * 365.25)),
        };
      }
      
      return {
        date: registered["#text"] || "Unknown",
        years: "Unknown",
      };
    },
  },

  // Actions
  actions: {
    // Set username
    setUsername(username) {
      this.username = username;
    },
    
    // Fetch user info from Last.fm API
    async fetchUserInfo(username = null) {
      try {
        this.loading = true;
        this.error = null;
        
        // Use provided username or fall back to the stored one
        const userToFetch = username || this.username;
        
        if (!userToFetch) {
          throw new Error("No username provided");
        }
        
        console.log(`[USER STORE] Fetching user info for: ${userToFetch}`);
        
        const response = await lastfmService.getUserInfo(userToFetch);
        
        if (response && response.user) {
          this.userInfo = response;
          
          // Update the username if it was provided
          if (username) {
            this.username = username;
          }
          
          console.log(`[USER STORE] Successfully fetched user info for: ${userToFetch}`);
        } else {
          throw new Error("Invalid response format");
        }
        
        return this.userInfo;
      } catch (error) {
        this.error = {
          message: error.message,
          details: error.response?.data || "Failed to fetch user info",
        };
        console.error(`[USER STORE] Error fetching user info:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Clear user data
    clearUser() {
      this.userInfo = null;
      this.error = null;
    },
  },
}); 