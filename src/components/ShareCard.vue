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
    tempContainer.style.backgroundColor = '#1A1A1A';
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
    cardClone.style.border = '3px solid #000';
    cardClone.style.overflow = 'hidden';
    cardClone.style.position = 'relative';
    
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
        playCount.style.padding = '3px 8px';
      }
      
      // Adjust stat sections for fixed output
      const statRows = contentSection.querySelectorAll('.stat-row');
      statRows.forEach(row => {
        row.style.padding = '15px';
        
        const rankLabel = row.querySelector('.rank-label');
        if (rankLabel) {
          rankLabel.style.fontSize = '14px';
          rankLabel.style.padding = '5px 10px';
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
          <h2 class="header-text">STATS - Made by <span class="text-red-500">LastSongs</span></h2>
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
              {{ userStore.userStats?.playcount || '0' }} PLAYS
            </div>
          </div>
        </div>
        
        <!-- Time period section -->
        <div class="period-section">
          <div class="period-label">Time Period:</div>
          <div class="period-value">{{ formatPeriod(props.period) }}</div>
        </div>
        
        <!-- Content sections -->
        <div class="stats-sections">
          <!-- Artist section -->
          <div class="stat-row">
            <div class="rank-label">TOP 1# ARTIST</div>
            
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
                <div class="item-plays">{{ topArtist?.playcount || '0' }} PLAYS</div>
              </div>
            </div>
          </div>
          
          <!-- Album section -->
          <div class="stat-row">
            <div class="rank-label">TOP 1# ALBUM</div>
            
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
                <div class="item-plays">{{ topAlbum?.playcount || '0' }} PLAYS</div>
              </div>
            </div>
          </div>
          
          <!-- Track section -->
          <div class="stat-row">
            <div class="rank-label">TOP 1# TRACK</div>
            
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
                <div class="item-plays">{{ topTrack?.playcount || '0' }} PLAYS</div>
              </div>
            </div>
          </div>
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
  padding: 0 5px; /* Reduced padding for small screens */
}

.fixed-size-info {
  background-color: #333;
  color: white;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 5px;
  border: 2px solid #000;
}

.fixed-size-info p {
  margin: 0;
  font-weight: 600;
}

.controls {
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.generate-btn {
  background-color: #333333;
  color: white;
  padding: 12px 24px;
  font-weight: 800;
  font-size: 16px;
  border: 3px solid #000;
  cursor: pointer;
  box-shadow: 5px 5px 0px #000;
  transition: transform 0.1s, box-shadow 0.1s;
  text-transform: uppercase;
}

.generate-btn:hover {
  transform: translate(2px, 2px);
  box-shadow: 3px 3px 0px #000;
}

.generate-btn:active {
  transform: translate(5px, 5px);
  box-shadow: 0px 0px 0px #000;
}

.generate-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
  transform: none;
  box-shadow: 5px 5px 0px #444;
}

/* Share card */
.share-card {
  width: 100%;
  max-width: 340px; /* Reduced maximum width for better mobile fit */
  /* Define mobile-friendly dimensions */
  height: auto;
  min-height: 450px; /* Slightly reduced minimum height */
  max-height: 75vh; /* Reduced maximum height to prevent overflow */
  background-color: #1A1A1A;
  overflow: hidden;
  box-shadow: 5px 5px 0px #000; /* Smaller shadow for mobile */
  border: 3px solid #000;
  margin: 0 auto; /* Center the card */
}

/* Apply responsive styles for very small screens */
@media screen and (max-width: 400px) {
  .share-card {
    max-width: 280px; /* Even smaller for very small screens */
    box-shadow: 3px 3px 0px #000;
    min-height: auto; /* Remove min-height on very small screens */
    border: 2px solid #000; /* Thinner border on mobile */
  }
  
  .generate-btn {
    padding: 10px 16px;
    font-size: 14px;
    border-width: 2px; /* Thinner border on button for mobile */
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
  min-height: 300px; /* Ensure minimum height for loading state */
  background-color: #1A1A1A;
  color: #FFFFFF;
}

.loader {
  width: 40px; /* Smaller loader for mobile */
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #666;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px; /* Smaller error icon for mobile */
  height: 50px;
  font-size: 30px;
  font-weight: bold;
  color: #000;
  background-color: #666;
  border: 3px solid #000;
  margin-bottom: 20px;
}

/* Header section */
.header-section {
  background-color: #333;
  padding: 8px; /* Reduced padding */
  text-align: center;
  border-bottom: 3px solid #000;
}

.header-text {
  margin: 0;
  font-size: 16px; /* Smaller font size */
  font-weight: 900;
  color: white;
  letter-spacing: 1px;
}

/* User section */
.user-section {
  background-color: #252525;
  padding: 15px; /* Reduced padding */
  display: flex;
  align-items: center;
  gap: 12px; /* Reduced gap */
  border-bottom: 3px solid #000;
}

.profile-image-container {
  width: 70px; /* Smaller profile image */
  height: 70px;
  background-color: #333;
  border: 3px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Responsive adjustments for smaller screens */
@media screen and (max-width: 320px) {
  .user-section {
    padding: 12px 8px;
  }
  
  .profile-image-container {
    width: 50px; /* Much smaller profile image */
    height: 50px;
    border-width: 2px;
  }
  
  .username {
    font-size: 16px;
  }
  
  .play-count {
    font-size: 12px;
    padding: 2px 5px;
    border-width: 1px;
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
  font-size: 30px; /* Smaller font size */
  font-weight: 800;
  color: #e0e0e0;
}

.user-details {
  flex-grow: 1;
  overflow: hidden; /* Prevent overflow */
}

.username {
  font-size: 20px; /* Smaller font size */
  font-weight: 900;
  color: #FFF;
  text-transform: uppercase;
  margin-bottom: 5px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-count {
  font-size: 14px; /* Smaller font size */
  font-weight: 800;
  color: #000;
  background-color: #e0e0e0;
  display: inline-block;
  padding: 2px 6px; /* Reduced padding */
  border: 2px solid #000;
}

/* Period section */
.period-section {
  background-color: #2A2A2A;
  padding: 10px 12px; /* Reduced padding */
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid #000;
}

.period-label {
  font-size: 14px; /* Smaller font size */
  font-weight: 800;
  color: #e0e0e0;
  text-transform: uppercase;
}

.period-value {
  font-size: 14px; /* Smaller font size */
  font-weight: 800;
  color: #000000;
  background-color: #f52d37;
  display: inline-block;
  padding: 3px 8px; /* Reduced padding */
  border: 2px solid #000;
  text-transform: uppercase;
}

/* Smaller text for tight spaces */
@media screen and (max-width: 320px) {
  .period-label, .period-value {
    font-size: 12px;
  }
  
  .period-value {
    padding: 2px 5px;
    border-width: 1px;
  }
  
  .period-section {
    padding: 8px 10px;
  }
}

/* Stats sections */
.stats-sections {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #1A1A1A;
}

.stat-row {
  display: flex;
  flex-direction: column;
  padding: 12px; /* Reduced padding */
  border-bottom: 2px solid #000; /* Thinner border */
}

/* Responsive adjustments for stat rows on small screens */
@media screen and (max-width: 320px) {
  .stat-row {
    padding: 8px;
  }
  
  .rank-label {
    font-size: 10px;
    padding: 2px 6px;
    border-width: 1px;
    margin-bottom: 6px;
  }
  
  .stat-cover {
    width: 40px;
    height: 40px;
    border-width: 1px;
  }
  
  .stat-content {
    gap: 8px;
  }
}

.rank-label {
  font-size: 12px; /* Smaller font size */
  font-weight: 800;
  color: #e0e0e0;
  background-color: #333;
  display: inline-block;
  padding: 4px 8px; /* Reduced padding */
  margin-bottom: 8px; /* Reduced margin */
  border: 2px solid #000;
  text-transform: uppercase;
}

.stat-content {
  display: flex;
  gap: 12px; /* Reduced gap */
}

.stat-cover {
  width: 60px; /* Smaller cover */
  height: 60px;
  background-color: #2A2A2A;
  border: 2px solid #000; /* Thinner border */
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
  background-color: #333;
  color: #e0e0e0;
  font-size: 24px; /* Smaller font size */
  font-weight: 800;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #2A2A2A;
  border: 2px solid #000; /* Thinner border */
  padding: 6px 10px; /* Reduced padding */
  flex-grow: 1;
  overflow: hidden; /* Prevent overflow */
}

.item-name {
  font-size: 14px; /* Smaller font size */
  font-weight: 800;
  color: #FFF;
  margin-bottom: 1px; /* Reduced margin */
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.item-artist {
  font-size: 12px; /* Smaller font size */
  font-weight: 600;
  color: #a0a0a0;
  margin-bottom: 1px; /* Reduced margin */
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  font-style: italic;
}

.item-plays {
  font-size: 12px; /* Smaller font size */
  font-weight: 700;
  color: #e0e0e0;
}

/* Responsive adjustments for text on small screens */
@media screen and (max-width: 320px) {
  .item-name {
    font-size: 12px;
  }
  
  .item-artist {
    font-size: 10px;
  }
  
  .item-plays {
    font-size: 10px;
  }
}

/* Footer section */
.footer-section {
  padding: 12px; /* Reduced padding */
  text-align: center;
  background-color: #333;
  margin-top: auto;
}

.credit {
  margin: 0;
  font-weight: 800;
  font-size: 12px; /* Smaller font size */
  letter-spacing: 1px;
  color: white;
}
</style> 