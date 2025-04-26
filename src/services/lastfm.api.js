import axios from "axios";

// Create an Axios instance with default configuration
const lastfmAPI = axios.create({
  baseURL: "https://ws.audioscrobbler.com/2.0",
  timeout: 10000,
  params: {
    api_key: import.meta.env.VITE_LASTFM_API_KEY || "YOUR_API_KEY", // Use environment variable or fallback
    format: "json",
  },
});

// Request interceptor for handling requests
lastfmAPI.interceptors.request.use(
  (config) => {
    // You could add loading state management here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
lastfmAPI.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle API errors gracefully
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// API methods for different Last.fm endpoints
export const lastfmService = {
  // Helper function to extract the largest available image
  getLargeImage: (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) return "";

    // Always prefer large or extralarge images for better quality
    const imageOrder = ["extralarge", "large", "medium", "small"];

    // First, try to handle XML format images which have direct URL strings with size attribute
    const xmlFormatImage = images.find((img) => typeof img === "string" && img.startsWith("http"));
    if (xmlFormatImage) return xmlFormatImage;

    // Next, check if images have direct URLs with size attributes (XML format converted to JSON)
    for (const size of imageOrder) {
      const image = images.find((img) => img.size === size);
      if (image) {
        // Handle direct URL string in image content (from XML)
        if (typeof image === "string" || image instanceof String) {
          return image;
        }
        // Handle when image URL is in the "content" property (sometimes from XML conversion)
        else if (image.content) {
          return image.content;
        }
        // Handle standard Last.fm JSON format with #text property
        else if (image["#text"]) {
          return image["#text"];
        }
      }
    }

    // Fall back to any available image
    for (const img of images) {
      // Handle different possible structures
      if (typeof img === "string") return img;
      if (img.content) return img.content;
      if (img["#text"]) return img["#text"];
    }

    return "";
  },

  // Get artist correction from Last.fm (for artist name normalization)
  getArtistCorrection: async (artistName) => {
    try {
      console.log(`[API] Attempting to get correction for artist: "${artistName}"`);
      
      const response = await lastfmAPI.get("/", {
        params: {
          method: "artist.getcorrection",
          artist: artistName,
        },
      });

      console.log(`[API] Correction response for "${artistName}":`, response);

      // Handle both XML and JSON response formats
      if (response.corrections && response.corrections.correction) {
        // JSON format
        if (Array.isArray(response.corrections.correction)) {
          const correctedArtist = response.corrections.correction[0].artist;
          console.log(`[API] Artist "${artistName}" corrected to "${correctedArtist.name}" (Array format)`);
          return correctedArtist;
        } else {
          const correctedArtist = response.corrections.correction.artist;
          console.log(`[API] Artist "${artistName}" corrected to "${correctedArtist.name}" (Object format)`);
          return correctedArtist;
        }
      } else if (response.corrections && response.corrections.artist) {
        // Alternative format
        const correctedArtist = response.corrections.artist;
        console.log(`[API] Artist "${artistName}" corrected to "${correctedArtist.name}" (Direct artist format)`);
        return correctedArtist;
      }
      
      // If no correction found, return the original artist name
      console.log(`[API] No correction found for artist "${artistName}", using original name`);
      return { name: artistName };
    } catch (error) {
      console.error(`[API ERROR] Error fetching correction for artist "${artistName}":`, error);
      // Return the original artist name if there's an error
      return { name: artistName };
    }
  },

  // Get detailed artist information with proper name correction first
  getArtistInfoWithCorrection: async (artistName) => {
    try {
      console.log(`[API] Getting artist info with correction for: "${artistName}"`);
      
      // First try to get the corrected artist name
      const correction = await lastfmService.getArtistCorrection(artistName);
      
      // Use the corrected name (or original if no correction found) to get artist info
      const correctedName = correction.name || artistName;
      
      console.log(`[API] Using ${artistName !== correctedName ? 'corrected' : 'original'} name: "${correctedName}" to fetch artist info`);
      
      // Now get the artist info with the corrected name
      const result = await lastfmAPI.get("/", {
        params: {
          method: "artist.getinfo",
          artist: correctedName,
        },
      });
      
      console.log(`[API] Artist info response for "${correctedName}":`, 
        result?.artist?.name ? `Found: ${result.artist.name}` : 'No artist found',
        result?.artist?.image ? `Has ${result.artist.image.length} images` : 'No images'
      );
      
      return result;
    } catch (error) {
      console.error(`[API ERROR] Error fetching artist info with correction for "${artistName}":`, error);
      throw error;
    }
  },

  // Get user's top artists
  getTopArtists: async (username, period = "overall", limit = 10, page = 1) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "user.gettopartists",
          user: username,
          period, // overall, 7day, 1month, 3month, 6month, 12month
          limit,
          page,
        },
      });
    } catch (error) {
      console.error("Error fetching top artists:", error);
      throw error;
    }
  },

  // Get user's top albums
  getTopAlbums: async (username, period = "overall", limit = 10, page = 1) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "user.gettopalbums",
          user: username,
          period,
          limit,
          page,
        },
      });
    } catch (error) {
      console.error("Error fetching top albums:", error);
      throw error;
    }
  },

  // Get user's top tracks
  getTopTracks: async (username, period = "overall", limit = 10, page = 1) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "user.gettoptracks",
          user: username,
          period,
          limit,
          page,
        },
      });
    } catch (error) {
      console.error("Error fetching top tracks:", error);
      throw error;
    }
  },

  // Get detailed track information
  getTrackInfo: async (artist, track, username = null) => {
    try {
      const params = {
        method: "track.getInfo",
        artist,
        track,
      };

      // Add username if provided for personalized data
      if (username) {
        params.username = username;
      }

      return await lastfmAPI.get("/", { params });
    } catch (error) {
      console.error("Error fetching track info:", error);
      throw error;
    }
  },

  // Get user's top tags
  getUserTopTags: async (username, limit = 50) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "user.gettoptags",
          user: username,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching user top tags:", error);
      throw error;
    }
  },

  // Get user's weekly album chart
  getWeeklyAlbumChart: async (username, from = null, to = null) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "user.getweeklyalbumchart",
          user: username,
          from,
          to,
        },
      });
    } catch (error) {
      console.error("Error fetching weekly album chart:", error);
      throw error;
    }
  },

  // Get user's recent tracks
  getRecentTracks: async (username, limit = 10, page = 1) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "user.getrecenttracks",
          user: username,
          limit,
          page,
        },
      });
    } catch (error) {
      console.error("Error fetching recent tracks:", error);
      throw error;
    }
  },

  // Get user's weekly artist chart
  getWeeklyArtistChart: async (username, from = null, to = null) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "user.getweeklyartistchart",
          user: username,
          from,
          to,
        },
      });
    } catch (error) {
      console.error("Error fetching weekly artist chart:", error);
      throw error;
    }
  },

  // Get user's weekly chart list
  getWeeklyChartList: async (username) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "user.getweeklychartlist",
          user: username,
        },
      });
    } catch (error) {
      console.error("Error fetching weekly chart list:", error);
      throw error;
    }
  },

  // Get user's weekly track chart
  getWeeklyTrackChart: async (username, from = null, to = null) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "user.getweeklytrackchart",
          user: username,
          from,
          to,
        },
      });
    } catch (error) {
      console.error("Error fetching weekly track chart:", error);
      throw error;
    }
  },

  // Get detailed artist information
  getArtistInfo: async (artist) => {
    try {
      console.log(`[API] Getting artist info directly for: "${artist}"`);
      
      const result = await lastfmAPI.get("/", {
        params: {
          method: "artist.getinfo",
          artist,
        },
      });
      
      console.log(`[API] Direct artist info response for "${artist}":`, 
        result?.artist?.name ? `Found: ${result.artist.name}` : 'No artist found',
        result?.artist?.image ? `Has ${result.artist.image.length} images` : 'No images'
      );
      
      return result;
    } catch (error) {
      console.error(`[API ERROR] Error fetching direct artist info for "${artist}":`, error);
      throw error;
    }
  },

  // Get detailed album information
  getAlbumInfo: async (artist, album) => {
    try {
      return await lastfmAPI.get("/", {
        params: {
          method: "album.getinfo",
          artist,
          album,
        },
      });
    } catch (error) {
      console.error("Error fetching album info:", error);
      throw error;
    }
  },
};

export default lastfmService;
