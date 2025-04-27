/**
 * Utility functions for handling images
 */

/**
 * Get artist image with fallback
 * @param {Object} artist - Artist object with image data
 * @returns {string} - URL of the artist image
 */
export function getArtistImage(artist) {
  // Handle null/undefined artist object
  if (!artist) {
    console.warn("Artist object is null or undefined");
    return "https://via.placeholder.com/300?text=No+Artist+Image";
  }

  // Log full artist object for debugging
  console.debug("Full artist object:", JSON.stringify(artist, null, 2));
  
  // Log artist data for debugging
  console.debug(
    "Artist image data:",
    JSON.stringify({
      name: artist.name,
      hasSpotifyImage: !!artist.spotifyImage,
      hasSpotifyImagesArray: !!(artist.images && artist.images.length),
      lastfmImages: artist.image ? artist.image.length : 0,
    })
  );

  // Check for Spotify image first (direct property)
  if (artist.spotifyImage) {
    console.log(`Using spotifyImage property: ${artist.spotifyImage}`);
    return artist.spotifyImage;
  }

  // Check for Spotify images array (from Spotify API)
  if (artist.images && Array.isArray(artist.images) && artist.images.length > 0) {
    const spotifyImage = artist.images[0]?.url;
    if (spotifyImage) {
      console.log(`Using Spotify images array: ${spotifyImage}`);
      return spotifyImage;
    }
  }

  // Then check for Last.fm images
  if (artist.image && Array.isArray(artist.image)) {
    // Log the actual image data for debugging
    console.debug("Last.fm images found:", artist.image.map(img => ({
      size: img.size,
      hasContent: !!(img["#text"] && img["#text"].trim()),
      url: img["#text"] ? img["#text"].substring(0, 30) + "..." : "empty"
    })));

    // Find the largest image available
    const extralarge = artist.image.find((img) => img && img.size === "extralarge");
    const large = artist.image.find((img) => img && img.size === "large");
    const medium = artist.image.find((img) => img && img.size === "medium");
    const small = artist.image.find((img) => img && img.size === "small");

    if (extralarge && extralarge["#text"]) {
      console.log(`Using Last.fm extralarge image: ${extralarge["#text"]}`);
      return extralarge["#text"];
    }
    if (large && large["#text"]) {
      console.log(`Using Last.fm large image: ${large["#text"]}`);
      return large["#text"];
    }
    if (medium && medium["#text"]) {
      console.log(`Using Last.fm medium image: ${medium["#text"]}`);
      return medium["#text"];
    }
    if (small && small["#text"]) {
      console.log(`Using Last.fm small image: ${small["#text"]}`);
      return small["#text"];
    }

    // If we have any image with content, use it
    const anyImage = artist.image.find((img) => img && img["#text"] && img["#text"].trim() !== "");
    if (anyImage) {
      console.log(`Using any Last.fm image: ${anyImage["#text"]}`);
      return anyImage["#text"];
    }
  }

  // Fallback to a placeholder
  console.log(`No image found for artist "${artist.name}", using placeholder`);
  return "https://via.placeholder.com/300?text=No+Artist+Image";
}

/**
 * Get album image with fallback
 * @param {Object} album - Album object with image data
 * @returns {string} - URL of the album image
 */
export function getAlbumImage(album) {
  // Check for Spotify image first
  if (album.spotifyImage) {
    return album.spotifyImage;
  }

  // Then check for Last.fm images
  if (album.image && Array.isArray(album.image)) {
    // Find the largest image available
    const extralarge = album.image.find((img) => img.size === "extralarge");
    const large = album.image.find((img) => img.size === "large");
    const medium = album.image.find((img) => img.size === "medium");

    if (extralarge && extralarge["#text"]) return extralarge["#text"];
    if (large && large["#text"]) return large["#text"];
    if (medium && medium["#text"]) return medium["#text"];

    // If we have any image with content, use it
    const anyImage = album.image.find((img) => img["#text"]);
    if (anyImage) return anyImage["#text"];
  }

  // Fallback to a placeholder
  return "https://via.placeholder.com/300?text=No+Album+Image";
}

/**
 * Get track image with fallback
 * @param {Object} track - Track object with image data
 * @returns {string} - URL of the track image
 */
export function getTrackImage(track) {
  // Check for Spotify image first
  if (track.spotifyImage) {
    return track.spotifyImage;
  }

  // Then check for Last.fm images
  if (track.image && Array.isArray(track.image)) {
    // Find the largest image available
    const extralarge = track.image.find((img) => img.size === "extralarge");
    const large = track.image.find((img) => img.size === "large");
    const medium = track.image.find((img) => img.size === "medium");

    if (extralarge && extralarge["#text"]) return extralarge["#text"];
    if (large && large["#text"]) return large["#text"];
    if (medium && medium["#text"]) return medium["#text"];

    // If we have any image with content, use it
    const anyImage = track.image.find((img) => img["#text"]);
    if (anyImage) return anyImage["#text"];
  }

  // Fallback to a placeholder
  return "https://via.placeholder.com/300?text=No+Track+Image";
}

/**
 * Load an image and return a Promise
 * @param {string} url - URL of the image to load
 * @returns {Promise<HTMLImageElement>} - Promise that resolves with the loaded image
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      // Create a placeholder colored rectangle instead
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#333333";
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = "#666666";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No Image", 150, 150);

      const img = new Image();
      img.src = canvas.toDataURL();
      img.onload = () => resolve(img);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; // Handle CORS

    img.onload = () => resolve(img);
    img.onerror = () => {
      console.log(`Failed to load image: ${url}, creating placeholder`);
      // Create a placeholder image
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#333333";
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = "#666666";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No Image", 150, 150);

      const placeholderImg = new Image();
      placeholderImg.src = canvas.toDataURL();
      placeholderImg.onload = () => resolve(placeholderImg);
    };

    // Handle potential CORS issues by trying with a proxy if available
    try {
      img.src = url;
    } catch (e) {
      console.error(`Error setting image src: ${e}`);
      img.onerror();
    }
  });
}

/**
 * Preload images with improved error handling
 * @param {HTMLElement} template - Template containing images to preload
 * @returns {Promise<void>} - Promise that resolves when all images are loaded
 */
export async function preloadImages(template) {
  const images = template.querySelectorAll("img");
  const imagePromises = Array.from(images).map((img) => {
    return new Promise((resolve) => {
      if (!img.src || img.complete) {
        // For already loaded images or no src
        if (img.naturalHeight === 0) {
          // Image loaded but has error
          img.src = "https://via.placeholder.com/300?text=No+Image";
        }
        resolve();
        return;
      }

      img.onload = () => resolve();
      img.onerror = () => {
        console.log(`Image failed to load: ${img.src}`);
        img.src = "https://via.placeholder.com/300?text=No+Image";
        resolve();
      };
    });
  });

  await Promise.all(imagePromises);
}
