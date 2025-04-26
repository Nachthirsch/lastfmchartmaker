import { lastfmService } from "./lastfm.api";

/**
 * Manual tag analyzer that fetches tags from recent albums
 * and aggregates them to create a custom tag chart
 */
export const tagAnalyzer = {
  /**
   * Get top tags aggregated from recent albums
   * @param {string} username - Last.fm username
   * @param {number} albumCount - Number of albums to analyze
   * @param {string} period - Time period to analyze
   * @returns {Promise<Array>} - Aggregated tags with counts
   */
  async getTopTagsFromAlbums(username, albumCount = 5, period = "7day") {
    try {
      console.log(`Analyzing tags from top ${albumCount} albums for user ${username} in period ${period}`);
      
      // 1. Get user's recent top albums
      const albumsResponse = await lastfmService.getTopAlbums(username, period, albumCount);
      if (!albumsResponse || !albumsResponse.topalbums || !albumsResponse.topalbums.album) {
        throw new Error("Failed to fetch top albums");
      }
      
      const albums = Array.isArray(albumsResponse.topalbums.album) 
        ? albumsResponse.topalbums.album 
        : [albumsResponse.topalbums.album];
      
      console.log(`Found ${albums.length} top albums:`, albums.map(a => `${a.artist.name} - ${a.name}`));
      
      // 2. Collect tags for each album
      const tagPromises = albums.map(async album => {
        try {
          return await this.getAlbumTags(album.artist.name, album.name);
        } catch (err) {
          console.warn(`Failed to get tags for ${album.artist.name} - ${album.name}:`, err);
          return [];
        }
      });
      
      const albumTags = await Promise.all(tagPromises);
      
      // 3. Aggregate and count tags
      const tagCounts = this.aggregateTags(albumTags);
      
      // 4. Sort by count and format
      const sortedTags = Object.entries(tagCounts)
        .map(([name, count]) => ({
          name,
          count: count.toString(), // Match the format from the API
          url: `https://www.last.fm/tag/${encodeURIComponent(name)}`,
        }))
        .sort((a, b) => parseInt(b.count) - parseInt(a.count));
      
      console.log(`Aggregated ${sortedTags.length} tags from albums, top tags:`, 
        sortedTags.slice(0, 5).map(t => `${t.name} (${t.count})`));
      
      return sortedTags;
    } catch (error) {
      console.error("Error analyzing album tags:", error);
      throw error;
    }
  },
  
  /**
   * Get tags for a specific album
   * @param {string} artist - Artist name
   * @param {string} album - Album name
   * @returns {Promise<Array>} - Album tags
   */
  async getAlbumTags(artist, album) {
    try {
      console.log(`Fetching tags for album: ${artist} - ${album}`);
      
      const response = await lastfmService.getAlbumInfo(artist, album);
      
      // Check if we have tags in the response
      if (response && response.album && response.album.tags) {
        // Handle different response formats
        let tags = [];
        
        if (response.album.tags.tag) {
          tags = Array.isArray(response.album.tags.tag) 
            ? response.album.tags.tag 
            : [response.album.tags.tag];
        } else if (Array.isArray(response.album.tags)) {
          tags = response.album.tags;
        }
        
        console.log(`Found ${tags.length} tags for ${artist} - ${album}:`, 
          tags.map(t => typeof t === 'string' ? t : t.name).slice(0, 5));
        
        // Normalize tag format
        return tags.map(tag => typeof tag === 'string' ? tag : tag.name.toLowerCase());
      }
      
      console.log(`No tags found for ${artist} - ${album}`);
      return [];
    } catch (error) {
      console.error(`Error fetching tags for ${artist} - ${album}:`, error);
      return [];
    }
  },
  
  /**
   * Aggregate tags from multiple albums and count occurrences
   * @param {Array<Array<string>>} albumTags - Array of tag arrays from albums
   * @returns {Object} - Object with tag counts
   */
  aggregateTags(albumTags) {
    const tagCounts = {};
    
    // Process each album's tags
    albumTags.forEach((albumTagList, albumIndex) => {
      // Add weighting based on album position (first albums count more)
      const weight = Math.max(1, 5 - albumIndex); // Weight of 5 for first album, down to 1
      
      albumTagList.forEach(tag => {
        if (!tag) return;
        
        const normalizedTag = tag.toLowerCase().trim();
        if (normalizedTag) {
          tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + weight;
        }
      });
    });
    
    return tagCounts;
  }
}; 