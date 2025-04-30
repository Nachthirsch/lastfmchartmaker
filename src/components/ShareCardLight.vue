<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useUserStore } from "../stores/user";
import { lastfmService } from "../services/lastfm.api";
import { spotifyService } from "../services/spotify.api";
import { fetchSpotifyImagesForArtists, fetchSpotifyImagesForAlbums } from "../utils/apiUtils";
import { toPng } from "html-to-image";

// Props and emits
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    default: "overall", // overall, 7day, 1month, 3month, 6month, 12month
  },
});

// Store for user data
const userStore = useUserStore();

// Reactive data
const isLoading = ref(true);
const error = ref(null);
const shareCardRef = ref(null);
const userInfo = computed(() => (userStore.userInfo ? userStore.userInfo.user : null));
const userImage = computed(() => userStore.userImage);
const topArtist = ref(null);
const topAlbum = ref(null);
const topTrack = ref(null);
const generatingImage = ref(false);

// Cache for period data
const periodCache = ref({});

// Function to format time period for display
function formatPeriod(period) {
  const periodMap = {
    'overall': 'ALL TIME',
    '7day': 'LAST 7 DAYS',
    '1month': 'LAST MONTH',
    '3month': 'LAST 3 MONTHS',
    '6month': 'LAST 6 MONTHS',
    '12month': 'LAST YEAR'
  };
  
  return periodMap[period] || 'ALL TIME';
}

// Function to load user data
async function loadUserData() {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Check if we have cached data for this period
    if (periodCache.value[props.period]) {
      console.log(`Using cached data for period: ${props.period}`);
      topArtist.value = periodCache.value[props.period].topArtist;
      topAlbum.value = periodCache.value[props.period].topAlbum;
      topTrack.value = periodCache.value[props.period].topTrack;
      isLoading.value = false;
      return;
    }
    
    // Fetch user info if not already loaded
    if (!userInfo.value) {
      await userStore.fetchUserInfo(props.username);
    }
    
    // Fetch top data
    const [artistsResponse, albumsResponse, tracksResponse] = await Promise.all([
      lastfmService.getTopArtists(props.username, props.period, 1),
      lastfmService.getTopAlbums(props.username, props.period, 1),
      lastfmService.getTopTracks(props.username, props.period, 1)
    ]);
    
    // Extract top items
    if (artistsResponse && artistsResponse.topartists && artistsResponse.topartists.artist) {
      const artists = Array.isArray(artistsResponse.topartists.artist) 
        ? artistsResponse.topartists.artist 
        : [artistsResponse.topartists.artist];
      topArtist.value = artists[0] || null;
    }
    
    if (albumsResponse && albumsResponse.topalbums && albumsResponse.topalbums.album) {
      const albums = Array.isArray(albumsResponse.topalbums.album) 
        ? albumsResponse.topalbums.album 
        : [albumsResponse.topalbums.album];
      topAlbum.value = albums[0] || null;
    }
    
    if (tracksResponse && tracksResponse.toptracks && tracksResponse.toptracks.track) {
      const tracks = Array.isArray(tracksResponse.toptracks.track) 
        ? tracksResponse.toptracks.track 
        : [tracksResponse.toptracks.track];
      topTrack.value = tracks[0] || null;
    }
    
    // Fetch images for top items
    if (topArtist.value) {
      await fetchSpotifyImagesForArtists([topArtist.value]);
    }
    
    if (topAlbum.value) {
      await fetchSpotifyImagesForAlbums([topAlbum.value]);
    }
    
    if (topTrack.value && topTrack.value.artist && topTrack.value.name) {
      try {
        // Try to get track image from Spotify
        const trackImage = await lastfmService.getSpotifyTrackImage(
          topTrack.value.name, 
          topTrack.value.artist.name || topTrack.value.artist
        );
        if (trackImage) {
          topTrack.value.spotifyImage = trackImage;
        }
      } catch (error) {
        console.error("Error fetching track image:", error);
      }
    }
    
    // Cache the data for this period
    periodCache.value[props.period] = {
      topArtist: topArtist.value,
      topAlbum: topAlbum.value,
      topTrack: topTrack.value
    };
    
    isLoading.value = false;
  } catch (err) {
    error.value = err;
    isLoading.value = false;
    console.error("Error loading share card data:", err);
  }
}

// Function to generate and download image
async function generateImage() {
  if (!shareCardRef.value || generatingImage.value) return;
  
  try {
    generatingImage.value = true;
    
    // Ensure component is fully rendered before capturing
    await nextTick();
    
    // FIXED DIMENSIONS for the share image (regardless of device)
    const FIXED_WIDTH = 400;  // Fixed width in pixels
    const ASPECT_RATIO = 9/16; // Fixed aspect ratio (9:16 portrait - width/height)
    const FIXED_HEIGHT = Math.round(FIXED_WIDTH / ASPECT_RATIO); // Calculate fixed height
    
    // Create a temporary container with fixed dimensions
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = `${FIXED_WIDTH}px`;
    tempContainer.style.height = `${FIXED_HEIGHT}px`;
    tempContainer.style.overflow = 'hidden';
    tempContainer.style.backgroundColor = '#ffffff';
    document.body.appendChild(tempContainer);
    
    // Clone the card content for rendering at fixed size
    const cardClone = shareCardRef.value.cloneNode(true);
    
    // Reset all responsive styling to ensure consistent output
    cardClone.style.width = `${FIXED_WIDTH}px`;
    cardClone.style.height = `${FIXED_HEIGHT}px`;
    cardClone.style.maxWidth = 'none';
    cardClone.style.maxHeight = 'none';
    cardClone.style.minHeight = 'none';
    cardClone.style.boxShadow = 'none';
    cardClone.style.margin = '0';
    cardClone.style.border = '1px solid #eee';
    cardClone.style.overflow = 'hidden';
    cardClone.style.position = 'relative';
    cardClone.style.borderRadius = '0';
    
    // Apply fixed dimensions to all child elements to ensure consistency
    const contentSection = cardClone.querySelector('.share-card-content');
    if (contentSection) {
      contentSection.style.height = '100%';
      
      // Apply fixed sizing to sub-sections
      const userSection = contentSection.querySelector('.user-section');
      if (userSection) {
        userSection.style.padding = '20px';
      }
      
      const profileImage = contentSection.querySelector('.profile-image-container');
      if (profileImage) {
        profileImage.style.width = '80px';
        profileImage.style.height = '80px';
      }
      
      // Reset font sizes to fixed values
      const username = contentSection.querySelector('.username');
      if (username) {
        username.style.fontSize = '22px';
      }
      
      const playCount = contentSection.querySelector('.play-count');
      if (playCount) {
        playCount.style.fontSize = '14px';
      }
      
      // Adjust stat sections for fixed output
      const statRows = contentSection.querySelectorAll('.stat-row');
      statRows.forEach(row => {
        row.style.padding = '15px';
        
        const rankLabel = row.querySelector('.rank-label');
        if (rankLabel) {
          rankLabel.style.fontSize = '14px';
        }
        
        const statCover = row.querySelector('.stat-cover');
        if (statCover) {
          statCover.style.width = '70px';
          statCover.style.height = '70px';
        }
        
        const itemName = row.querySelector('.item-name');
        if (itemName) {
          itemName.style.fontSize = '16px';
        }
        
        const itemArtist = row.querySelector('.item-artist');
        if (itemArtist) {
          itemArtist.style.fontSize = '14px';
        }
        
        const itemPlays = row.querySelector('.item-plays');
        if (itemPlays) {
          itemPlays.style.fontSize = '14px';
        }
      });
      
      // Ensure watermark has consistent styling
      const watermark = contentSection.querySelector('.watermark-section');
      if (watermark) {
        watermark.style.padding = '10px';
        const watermarkUrl = watermark.querySelector('.watermark-url');
        if (watermarkUrl) {
          watermarkUrl.style.fontSize = '12px';
        }
      }
    }
    
    // Add the clone to the temporary container
    tempContainer.appendChild(cardClone);
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Generate image with FIXED dimensions
    const dataUrl = await toPng(cardClone, {
      quality: 0.95,
      pixelRatio: 3,
      width: FIXED_WIDTH,
      height: FIXED_HEIGHT,
      cacheBust: true,
      canvasWidth: FIXED_WIDTH,
      canvasHeight: FIXED_HEIGHT,
      style: {
        transform: 'none',
      }
    });
    
    // Create a download link
    const link = document.createElement('a');
    link.download = `${props.username}-lastfm-share.png`;
    link.href = dataUrl;
    link.click();
    
    // Clean up
    document.body.removeChild(tempContainer);
    generatingImage.value = false;
  } catch (err) {
    console.error("Error generating image:", err);
    generatingImage.value = false;
  }
}

// Watch for period changes to reload data when needed
watch(() => props.period, (newPeriod) => {
  console.log(`Period changed to: ${newPeriod}`);
  loadUserData();
});

// Load data on component mount
onMounted(async () => {
  await loadUserData();
});
</script>

<template>
  <div class="share-card-container">
    <div class="fixed-size-info">
      <p>Preview (Output will be 400x711px)</p>
    </div>
    
    <div class="controls">
      <button 
        @click="generateImage" 
        :disabled="isLoading || generatingImage"
        class="generate-btn"
      >
        <span class="btn-text">{{ generatingImage ? 'Generating...' : 'Generate Share Image' }}</span>
      </button>
    </div>
    
    <div ref="shareCardRef" class="share-card">
      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="loader"></div>
        <p>Loading your music stats...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">!</div>
        <p>Error loading data: {{ error.message }}</p>
      </div>
      
      <!-- Share card content -->
      <div v-else class="share-card-content">
        <!-- Header section -->
        <div class="header-section">
          <h2 class="header-text">Made by <span class="text-accent">LastSongs</span></h2>
        </div>
        
        <!-- User info section -->
        <div class="user-section">
          <div class="profile-image-container">
            <img 
              v-if="userImage" 
              :src="userImage" 
              :alt="userInfo?.name" 
              class="profile-image" 
            />
            <div v-else class="profile-image-placeholder">
              {{ userInfo?.name?.charAt(0).toUpperCase() }}
            </div>
          </div>
          
          <div class="user-details">
            <div class="username">{{ userInfo?.name }}</div>
            <div class="play-count">
              {{ userStore.userStats?.playcount || '0' }} plays
            </div>
          </div>
        </div>
        
        <!-- Time period section -->
        <div class="period-section">
          <div class="period-label">Time Period</div>
          <div class="period-value">{{ formatPeriod(props.period) }}</div>
        </div>
        
        <!-- Content sections -->
        <div class="stats-sections">
          <!-- Artist section -->
          <div class="stat-row">
            <div class="rank-label">Top Artist</div>
            
            <div class="stat-content">
              <div class="stat-cover">
                <img 
                  v-if="topArtist && topArtist.spotifyImage" 
                  :src="topArtist.spotifyImage" 
                  :alt="topArtist?.name" 
                />
                <div v-else class="placeholder-image">
                  {{ topArtist?.name?.charAt(0) || 'A' }}
                </div>
              </div>
              
              <div class="stat-info">
                <div class="item-name">{{ topArtist?.name || 'Unknown Artist' }}</div>
                <div class="item-plays">{{ topArtist?.playcount || '0' }} plays</div>
              </div>
            </div>
          </div>
          
          <!-- Album section -->
          <div class="stat-row">
            <div class="rank-label">Top Album</div>
            
            <div class="stat-content">
              <div class="stat-cover">
                <img 
                  v-if="topAlbum && topAlbum.spotifyImage" 
                  :src="topAlbum.spotifyImage" 
                  :alt="topAlbum?.name" 
                />
                <div v-else class="placeholder-image">
                  {{ topAlbum?.name?.charAt(0) || 'A' }}
                </div>
              </div>
              
              <div class="stat-info">
                <div class="item-name">{{ topAlbum?.name || 'Unknown Album' }}</div>
                <div class="item-artist">{{ topAlbum?.artist?.name || 'Unknown Artist' }}</div>
                <div class="item-plays">{{ topAlbum?.playcount || '0' }} plays</div>
              </div>
            </div>
          </div>
          
          <!-- Track section -->
          <div class="stat-row">
            <div class="rank-label">Top Track</div>
            
            <div class="stat-content">
              <div class="stat-cover">
                <img 
                  v-if="topTrack && topTrack.spotifyImage" 
                  :src="topTrack.spotifyImage" 
                  :alt="topTrack?.name" 
                />
                <div v-else class="placeholder-image">
                  {{ topTrack?.name?.charAt(0) || 'T' }}
                </div>
              </div>
              
              <div class="stat-info">
                <div class="item-name">{{ topTrack?.name || 'Unknown Track' }}</div>
                <div class="item-artist">{{ topTrack?.artist?.name || 'Unknown Artist' }}</div>
                <div class="item-plays">{{ topTrack?.playcount || '0' }} plays</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Watermark section -->
        <div class="watermark-section">
          <div class="watermark-url">lastsongs.netlify.app</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base styles */
.share-card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  margin: 0 auto;
  font-family: 'Inter', 'Arial', sans-serif;
  padding: 0 5px;
}

.fixed-size-info {
  background-color: #f5f5f5;
  color: #333;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 5px;
}

.fixed-size-info p {
  margin: 0;
  font-weight: 400;
}

.controls {
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.generate-btn {
  background-color: #f5f5f5;
  color: #333;
  padding: 10px 20px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  text-transform: none;
}

.generate-btn:hover {
  background-color: #e5e5e5;
}

.generate-btn:active {
  background-color: #d5d5d5;
}

.generate-btn:disabled {
  background-color: #f0f0f0;
  color: #999;
  cursor: not-allowed;
}

/* Share card */
.share-card {
  width: 100%;
  max-width: 340px;
  height: auto;
  min-height: 450px;
  max-height: 75vh;
  background-color: #ffffff;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin: 0 auto;
}

/* Apply responsive styles for very small screens */
@media screen and (max-width: 400px) {
  .share-card {
    max-width: 280px;
    min-height: auto;
  }
  
  .generate-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}

.share-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Loading state */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  background-color: #ffffff;
  color: #333;
}

.loader {
  width: 32px;
  height: 32px;
  border: 2px solid #eee;
  border-top: 2px solid #666;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 24px;
  font-weight: normal;
  color: #fff;
  background-color: #ff5252;
  border-radius: 50%;
  margin-bottom: 16px;
}

/* Header section */
.header-section {
  background-color: #fafafa;
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.header-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.text-accent {
  color: #ff5252;
  font-weight: 600;
}

/* User section */
.user-section {
  background-color: #ffffff;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid #eee;
}

.profile-image-container {
  width: 64px;
  height: 64px;
  background-color: #f5f5f5;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Responsive adjustments for smaller screens */
@media screen and (max-width: 320px) {
  .user-section {
    padding: 12px;
  }
  
  .profile-image-container {
    width: 48px;
    height: 48px;
  }
  
  .username {
    font-size: 16px;
  }
  
  .play-count {
    font-size: 12px;
  }
  
  .header-text {
    font-size: 14px;
  }
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 500;
  color: #999;
}

.user-details {
  flex-grow: 1;
  overflow: hidden;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-count {
  font-size: 14px;
  font-weight: 400;
  color: #666;
}

/* Period section */
.period-section {
  background-color: #fafafa;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.period-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.period-value {
  font-size: 14px;
  font-weight: 500;
  color: #ff5252;
}

/* Smaller text for tight spaces */
@media screen and (max-width: 320px) {
  .period-label, .period-value {
    font-size: 12px;
  }
  
  .period-section {
    padding: 10px 12px;
  }
}

/* Stats sections */
.stats-sections {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #ffffff;
}

.stat-row {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

/* Responsive adjustments for stat rows on small screens */
@media screen and (max-width: 320px) {
  .stat-row {
    padding: 12px;
  }
  
  .rank-label {
    font-size: 12px;
    margin-bottom: 8px;
  }
  
  .stat-cover {
    width: 42px;
    height: 42px;
  }
  
  .stat-content {
    gap: 10px;
  }
}

.rank-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 12px;
}

.stat-content {
  display: flex;
  gap: 14px;
}

.stat-cover {
  width: 56px;
  height: 56px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.stat-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #999;
  font-size: 20px;
  font-weight: 500;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 0;
  flex-grow: 1;
  overflow: hidden;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.item-artist {
  font-size: 13px;
  font-weight: 400;
  color: #666;
  margin-bottom: 2px;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.item-plays {
  font-size: 12px;
  font-weight: 400;
  color: #999;
}

/* Responsive adjustments for text on small screens */
@media screen and (max-width: 320px) {
  .item-name {
    font-size: 13px;
  }
  
  .item-artist {
    font-size: 11px;
  }
  
  .item-plays {
    font-size: 10px;
  }
}

/* Watermark section */
.watermark-section {
  padding: 12px;
  text-align: center;
  background-color: #fafafa;
  border-top: 1px solid #eee;
}

.watermark-url {
  margin: 0;
  font-weight: 400;
  font-size: 12px;
  color: #999;
  letter-spacing: 0.5px;
}
</style> 