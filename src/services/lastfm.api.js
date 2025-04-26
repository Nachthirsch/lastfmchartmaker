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

  // Get Spotify track image
  getSpotifyTrackImage: async (trackName, artistName) => {
    try {
      // First, search for the track on Spotify
      const spotifySearchURL = "https://api.spotify.com/v1/search";
      const query = `track:${encodeURIComponent(trackName)} artist:${encodeURIComponent(artistName)}`;
      
      // Check if we have access token in localStorage
      let accessToken = localStorage.getItem('spotify_access_token');
      const tokenExpiry = localStorage.getItem('spotify_token_expiry');
      
      // If token expired or not present, get a new one
      if (!accessToken || !tokenExpiry || new Date().getTime() > parseInt(tokenExpiry)) {
        // Get new token using client credentials flow
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
          return "";
        }
        
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
          },
          body: 'grant_type=client_credentials'
        });
        
        if (!tokenResponse.ok) {
          throw new Error('Failed to get Spotify access token');
        }
        
        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
        
        // Save token with expiry time
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_token_expiry', new Date().getTime() + (tokenData.expires_in * 1000));
      }
      
      // Now search for the track
      const searchResponse = await fetch(`${spotifySearchURL}?q=${query}&type=track&limit=1`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!searchResponse.ok) {
        throw new Error('Spotify search failed');
      }
      
      const searchData = await searchResponse.json();
      
      // If we found matching tracks
      if (searchData.tracks && searchData.tracks.items && searchData.tracks.items.length > 0) {
        const track = searchData.tracks.items[0];
        
        // Get the album images
        if (track.album && track.album.images && track.album.images.length > 0) {
          // Sort by size and pick the largest image
          const sortedImages = [...track.album.images].sort((a, b) => (b.height * b.width) - (a.height * a.width));
          return sortedImages[0].url;
        }
      }
      
      return "";
    } catch (error) {
      return "";
    }
  },

  // Get artist correction from Last.fm (for artist name normalization)
  getArtistCorrection: async (artistName) => {
    try {
      const response = await lastfmAPI.get("/", {
        params: {
          method: "artist.getcorrection",
          artist: artistName,
        },
      });

      // Handle both XML and JSON response formats
      if (response.corrections && response.corrections.correction) {
        // JSON format
        if (Array.isArray(response.corrections.correction)) {
          const correctedArtist = response.corrections.correction[0].artist;
          return correctedArtist;
        } else {
          const correctedArtist = response.corrections.correction.artist;
          return correctedArtist;
        }
      } else if (response.corrections && response.corrections.artist) {
        // Alternative format
        const correctedArtist = response.corrections.artist;
        return correctedArtist;
      }
      
      // If no correction found, return the original artist name
      return { name: artistName };
    } catch (error) {
      // Return the original artist name if there's an error
      return { name: artistName };
    }
  },

  // Get detailed artist information with proper name correction first
  getArtistInfoWithCorrection: async (artistName) => {
    try {
      // First try to get the corrected artist name
      const correction = await lastfmService.getArtistCorrection(artistName);
      
      // Use the corrected name (or original if no correction found) to get artist info
      const correctedName = correction.name || artistName;
      
      // Now get the artist info with the corrected name
      const result = await lastfmAPI.get("/", {
        params: {
          method: "artist.getinfo",
          artist: correctedName,
        },
      });
      
      return result;
    } catch (error) {
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
      throw error;
    }
  },

  // Get user's top tracks
  getTopTracks: async (username, period = "overall", limit = 10, page = 1) => {
    try {
      const response = await lastfmAPI.get("/", {
        params: {
          method: "user.gettoptracks",
          user: username,
          period,
          limit,
          page,
        },
      });
      
      return response;
    } catch (error) {
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
          limit: 500,
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
      throw error;
    }
  },

  // Get user's recent tracks
  getRecentTracks: async (username, limit = 10, page = 1) => {
    try {
      const response = await lastfmAPI.get("/", {
        params: {
          method: "user.getrecenttracks",
          user: username,
          limit,
          page,
        },
      });
      
      return response;
    } catch (error) {
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
      throw error;
    }
  },

  // Get detailed artist information
  getArtistInfo: async (artist) => {
    try {
      const result = await lastfmAPI.get("/", {
        params: {
          method: "artist.getinfo",
          artist,
        },
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get album information
  getAlbumInfo: async (artist, album, username = null) => {
    try {
      const params = {
        method: "album.getInfo",
        artist,
        album,
        autocorrect: 1 // Use Last.fm corrections
      };
      
      // Add username if provided for personalized data
      if (username) {
        params.username = username;
      }
      
      const response = await lastfmAPI.get("/", { params });
      
      if (response && response.album) {
        return response;
      } else {
        throw new Error("No album data available");
      }
    } catch (error) {
      throw error;
    }
  },

  // Get user information
  getUserInfo: async (username) => {
    try {
      const response = await lastfmAPI.get("/", {
        params: {
          method: "user.getinfo",
          user: username,
        },
      });
      
      if (response && response.user) {
        return response;
      } else {
        throw new Error("No user data available");
      }
    } catch (error) {
      throw error;
    }
  },

  // Get tags for an album
  getAlbumTags: async (artistName, albumName, limit = 5) => {
    try {
      const response = await lastfmAPI.get("/", {
        params: {
          method: "album.gettags",
          artist: artistName,
          album: albumName,
          limit,
        },
      });

      // Handle response format
      if (response.tags && response.tags.tag) {
        return Array.isArray(response.tags.tag) ? response.tags.tag : [response.tags.tag];
      }
      return [];
    } catch (error) {
      console.error("Error fetching album tags:", error);
      return [];
    }
  },

  // Get tags for an artist
  getArtistTags: async (artistName, limit = 5) => {
    try {
      const response = await lastfmAPI.get("/", {
        params: {
          method: "artist.gettags",
          artist: artistName,
          limit,
        },
      });

      // Handle response format
      if (response.tags && response.tags.tag) {
        return Array.isArray(response.tags.tag) ? response.tags.tag : [response.tags.tag];
      }
      return [];
    } catch (error) {
      console.error("Error fetching artist tags:", error);
      return [];
    }
  },

  // Get tags for a track
  getTrackTags: async (artistName, trackName, limit = 5) => {
    try {
      const response = await lastfmAPI.get("/", {
        params: {
          method: "track.gettags",
          artist: artistName,
          track: trackName,
          limit,
        },
      });

      // Handle response format
      if (response.tags && response.tags.tag) {
        return Array.isArray(response.tags.tag) ? response.tags.tag : [response.tags.tag];
      }
      return [];
    } catch (error) {
      console.error("Error fetching track tags:", error);
      return [];
    }
  },
};

export default lastfmService;
