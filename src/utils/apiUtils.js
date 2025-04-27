/**
 * Utility functions for API calls and data fetching
 */
import { lastfmService } from "../services/lastfm.api";
import { spotifyService } from "../services/spotify.api";

/**
 * Fetch tags for the top items (artists, albums, tracks)
 * @param {object} topArtist - Top artist object
 * @param {object} topAlbum - Top album object
 * @param {object} topTrack - Top track object
 * @returns {Promise<object>} - Object containing arrays of tags for each type
 */
export async function fetchTagsForTopItems(topArtist, topAlbum, topTrack) {
  console.log("Fetching tags for top items");

  const result = {
    artistTags: [],
    albumTags: [],
    trackTags: [],
  };

  // Fetch tags for top artist
  if (topArtist) {
    try {
      const artistName = topArtist.name;
      console.log(`Fetching tags for artist: "${artistName}"`);
      const tags = await lastfmService.getArtistTags(artistName);
      result.artistTags = tags.slice(0, 3); // Get top 3 tags
      console.log(`Got ${tags.length} tags for artist "${artistName}":`, tags);
    } catch (error) {
      console.error("Error fetching artist tags:", error);
    }
  }

  // Fetch tags for top album
  if (topAlbum && topAlbum.artist?.name) {
    try {
      const albumName = topAlbum.name;
      const artistName = topAlbum.artist.name;
      console.log(`Fetching tags for album: "${albumName}" by "${artistName}"`);
      const tags = await lastfmService.getAlbumTags(artistName, albumName);
      result.albumTags = tags.slice(0, 3); // Get top 3 tags
      console.log(`Got ${tags.length} tags for album "${albumName}":`, tags);
    } catch (error) {
      console.error("Error fetching album tags:", error);
    }
  }

  // Fetch tags for top track
  if (topTrack && topTrack.artist?.name) {
    try {
      const trackName = topTrack.name;
      const artistName = topTrack.artist.name;
      console.log(`Fetching tags for track: "${trackName}" by "${artistName}"`);
      const tags = await lastfmService.getTrackTags(artistName, trackName);
      result.trackTags = tags.slice(0, 3); // Get top 3 tags
      console.log(`Got ${tags.length} tags for track "${trackName}":`, tags);
    } catch (error) {
      console.error("Error fetching track tags:", error);
    }
  }

  return result;
}

/**
 * Fetch Spotify images for a list of albums
 * @param {Array} albums - List of album objects
 * @returns {Promise<void>}
 */
export async function fetchSpotifyImagesForAlbums(albums) {
  if (!albums || albums.length === 0) return;

  console.log(`Fetching Spotify images for ${albums.length} albums`);

  // Process each album to get its Spotify image
  for (const album of albums) {
    try {
      if (album.artist?.name && album.name) {
        // Use the Spotify API through lastfmService to get track images
        const artistName = album.artist.name;
        const albumName = album.name;

        console.log(`Fetching Spotify image for album: "${albumName}" by "${artistName}"`);

        try {
          // Try to get album image from Spotify
          const albumInfo = await lastfmService.getAlbumInfo(artistName, albumName);
          if (albumInfo && albumInfo.album && albumInfo.album.image) {
            // Use the largest image available
            const images = albumInfo.album.image;
            const largestImage = images.reduce((largest, current) => {
              return current.size === "extralarge" || current.size === "mega" ? current : largest;
            }, images[0]);

            // Update the album object with the image URL
            if (largestImage && largestImage["#text"]) {
              album.spotifyImage = largestImage["#text"];
              console.log(`Found image for "${albumName}": ${album.spotifyImage}`);
            }
          }
        } catch (albumError) {
          console.error(`Error fetching album image for "${albumName}":`, albumError);

          // Fallback to trying track image if album image fails
          try {
            console.log(`Trying to get track image as fallback for "${albumName}"`);
            // Get a track image from the album's first track
            const trackImage = await lastfmService.getSpotifyTrackImage(artistName, albumName);
            if (trackImage) {
              album.spotifyImage = trackImage;
              console.log(`Found fallback track image for "${albumName}": ${album.spotifyImage}`);
            }
          } catch (trackError) {
            console.error(`Fallback track image also failed for "${albumName}":`, trackError);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing album "${album.name}":`, error);
    }
  }
}

/**
 * Fetch Spotify images for a list of artists
 * @param {Array} artists - List of artist objects
 * @returns {Promise<void>}
 */
export async function fetchSpotifyImagesForArtists(artists) {
  if (!artists || artists.length === 0) return;

  console.log(`Fetching Spotify images for ${artists.length} artists`);

  // Get artist names for batch processing
  const artistNames = artists.map(artist => artist.name).filter(Boolean);
  
  try {
    // Use the batch image fetching method from spotifyService
    const imagesMap = await spotifyService.getMultipleArtistImages(artistNames);
    console.log(`Received image data for ${Object.keys(imagesMap).length}/${artistNames.length} artists`);
    
    // Apply the images to the original artist objects
    artists.forEach(artist => {
      if (artist.name && imagesMap[artist.name]) {
        artist.spotifyImage = imagesMap[artist.name];
        console.log(`Applied Spotify image to artist "${artist.name}": ${artist.spotifyImage}`);
      } else if (artist.name) {
        console.log(`No Spotify image found for artist "${artist.name}"`);
      }
    });
  } catch (error) {
    console.error("Error fetching multiple artist images:", error);
  }
}