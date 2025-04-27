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
    
    const dataUrl = await toPng(shareCardRef.value, {
      quality: 0.95,
      pixelRatio: 3,
      style: {
        // Ensure proper rendering
        transform: 'scale(1)',
        transformOrigin: 'top left',
      }
    });
    
    // Create a download link
    const link = document.createElement('a');
    link.download = `${props.username}-lastfm-share.png`;
    link.href = dataUrl;
    link.click();
    
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
          <h2 class="header-text"><SPAN class="text-red-500"> LASTFM</SPAN> STATS - Made by <span class="text-red-500">LastSongs</span></h2>
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
        
        <!-- Footer section -->
        <div class="footer-section">
          <p class="credit">CREATED WITH LASTFM CHART MAKER</p>
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
  gap: 20px;
  width: 100%;
  margin: 0 auto;
  font-family: 'Inter', 'Arial', sans-serif;
}

.controls {
  margin-bottom: 20px;
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
  max-width: 400px; /* Adjust as needed for your layout */
  aspect-ratio: 9/16;
  background-color: #1A1A1A;
  overflow: hidden;
  box-shadow: 10px 10px 0px #000;
  border: 3px solid #000;
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
  background-color: #1A1A1A;
  color: #FFFFFF;
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid #333;
  border-top: 5px solid #666;
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
  width: 60px;
  height: 60px;
  font-size: 40px;
  font-weight: bold;
  color: #000;
  background-color: #666;
  border: 3px solid #000;
  margin-bottom: 20px;
}

/* Header section */
.header-section {
  background-color: #333;
  padding: 10px;
  text-align: center;
  border-bottom: 3px solid #000;
}

.header-text {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: white;
  letter-spacing: 1px;
}

/* User section */
.user-section {
  background-color: #252525;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 3px solid #000;
}

.profile-image-container {
  width: 80px;
  height: 80px;
  background-color: #333;
  border: 3px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  font-size: 36px;
  font-weight: 800;
  color: #e0e0e0;
}

.user-details {
  flex-grow: 1;
}

.username {
  font-size: 24px;
  font-weight: 900;
  color: #FFF;
  text-transform: uppercase;
  margin-bottom: 5px;
  line-height: 1.1;
}

.play-count {
  font-size: 16px;
  font-weight: 800;
  color: #000;
  background-color: #e0e0e0;
  display: inline-block;
  padding: 3px 8px;
  border: 2px solid #000;
}

/* Period section */
.period-section {
  background-color: #2A2A2A;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid #000;
}

.period-label {
  font-size: 16px;
  font-weight: 800;
  color: #e0e0e0;
  text-transform: uppercase;
}

.period-value {
  font-size: 16px;
  font-weight: 800;
  color: #000000;
  background-color: #f52d37;
  display: inline-block;
  padding: 4px 12px;
  border: 2px solid #000;
  text-transform: uppercase;
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
  padding: 15px;
  border-bottom: 3px solid #000;
}

.rank-label {
  font-size: 14px;
  font-weight: 800;
  color: #e0e0e0;
  background-color: #333;
  display: inline-block;
  padding: 5px 10px;
  margin-bottom: 10px;
  border: 2px solid #000;
  text-transform: uppercase;
}

.stat-content {
  display: flex;
  gap: 15px;
}

.stat-cover {
  width: 70px;
  height: 70px;
  background-color: #2A2A2A;
  border: 3px solid #000;
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
  font-size: 28px;
  font-weight: 800;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #2A2A2A;
  border: 3px solid #000;
  padding: 8px 12px;
  flex-grow: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 800;
  color: #FFF;
  margin-bottom: 2px;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.item-artist {
  font-size: 14px;
  font-weight: 600;
  color: #a0a0a0;
  margin-bottom: 2px;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  font-style: italic;
}

.item-plays {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0e0;
}

/* Footer section */
.footer-section {
  padding: 15px;
  text-align: center;
  background-color: #333;
  margin-top: auto;
}

.credit {
  margin: 0;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 1px;
  color: white;
}
</style> 