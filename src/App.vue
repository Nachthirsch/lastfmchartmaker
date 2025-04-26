<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useArtistsStore } from "./stores/artists";
import { useAlbumsStore } from "./stores/albums";
import { useTracksStore } from "./stores/tracks";
import { lastfmService } from "./services/lastfm.api";
import TopMusicCharts from "./components/charts/TopMusicCharts.vue";
import ItemDetail from "./components/ItemDetail.vue";

// Initialize stores
const artistsStore = useArtistsStore();
const albumsStore = useAlbumsStore();
const tracksStore = useTracksStore();

// UI state
const username = ref("yuunaagi");
const period = ref("overall");
const isLoading = computed(() => artistsStore.loading || albumsStore.loading || tracksStore.loading);
const showItemDetails = ref(false);

// Selected item state
const selectedItemType = ref(null); // 'artist', 'album', or 'track'
const selectedItemName = ref("");
const selectedItemArtist = ref("");

// Available time periods
const periods = [
  { value: "overall", label: "All Time" },
  { value: "7day", label: "Last 7 Days" },
  { value: "1month", label: "Last Month" },
  { value: "3month", label: "Last 3 Months" },
  { value: "6month", label: "Last 6 Months" },
  { value: "12month", label: "Last Year" },
];

// Fetch data from Last.fm based on current selections
async function fetchData() {
  try {
    // Update username in all stores
    artistsStore.setUsername(username.value);
    albumsStore.setUsername(username.value);
    tracksStore.setUsername(username.value);

    // Fetch all data types
    await Promise.all([
      artistsStore.fetchTopArtists(period.value),
      albumsStore.fetchTopAlbums(period.value),
      tracksStore.fetchTopTracks(period.value)
    ]);

    // Reset selected item when data is refreshed
    showItemDetails.value = false;
    selectedItemType.value = null;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Show artist details
async function showArtistDetails(artistName) {
  try {
    selectedItemType.value = "artist";
    selectedItemName.value = artistName;
    showItemDetails.value = true;

    await artistsStore.fetchArtistInfo(artistName);
  } catch (error) {
    console.error("Error fetching artist details:", error);
  }
}

// Show album details
async function showAlbumDetails(albumName, artistName) {
  try {
    selectedItemType.value = "album";
    selectedItemName.value = albumName;
    selectedItemArtist.value = artistName;
    showItemDetails.value = true;

    await albumsStore.fetchAlbumInfo(artistName, albumName);
  } catch (error) {
    console.error("Error fetching album details:", error);
  }
}

// Show track details
async function showTrackDetails(trackName, artistName) {
  try {
    selectedItemType.value = "track";
    selectedItemName.value = trackName;
    selectedItemArtist.value = artistName;
    showItemDetails.value = true;

    await tracksStore.fetchTrackInfo(artistName, trackName);
  } catch (error) {
    console.error("Error fetching track details:", error);
  }
}

// Close item details panel
function closeItemDetails() {
  showItemDetails.value = false;
  selectedItemType.value = null;
  selectedItemName.value = "";
  selectedItemArtist.value = "";
}

// Computed properties for selected item details
const selectedArtist = computed(() => {
  if (selectedItemType.value !== "artist" || !artistsStore.selectedArtistInfo) return null;
  return artistsStore.selectedArtistInfo.artist;
});

const selectedAlbum = computed(() => {
  if (selectedItemType.value !== "album" || !albumsStore.selectedAlbumInfo) return null;
  return albumsStore.albumMetadata;
});

const selectedTrack = computed(() => {
  if (selectedItemType.value !== "track" || !tracksStore.selectedTrackInfo) return null;
  return tracksStore.trackMetadata;
});

const selectedImageUrl = computed(() => {
  if (selectedItemType.value === "artist") return artistsStore.selectedArtistImage;
  if (selectedItemType.value === "album") return albumsStore.selectedAlbumImage;
  if (selectedItemType.value === "track") return tracksStore.selectedTrackImage;
  return "";
});

const selectedItemUrl = computed(() => {
  if (selectedItemType.value === "artist" && selectedArtist.value) return selectedArtist.value.url;
  if (selectedItemType.value === "album" && selectedAlbum.value) return selectedAlbum.value.url;
  if (selectedItemType.value === "track" && selectedTrack.value) return selectedTrack.value.url;
  return "";
});

// Fetch initial data on component mount
onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Last.fm Chart Maker</h1>
      <p>Create and download charts from your Last.fm listening history</p>
    </header>

    <div class="controls">
      <div class="input-group">
        <label for="username">Last.fm Username</label>
        <input id="username" v-model="username" type="text" placeholder="Enter your Last.fm username" />
      </div>

      <div class="input-group">
        <label for="period">Time Period</label>
        <select id="period" v-model="period">
          <option v-for="option in periods" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <button @click="fetchData" :disabled="isLoading" class="fetch-button">
        <span v-if="isLoading">Loading...</span>
        <span v-else>Fetch Data</span>
      </button>
    </div>

    <!-- Item Details Panel -->
    <div v-if="showItemDetails" class="item-details-container">
      <div class="item-details-header">
        <h2>{{ selectedItemName }}</h2>
        <button class="close-button" @click="closeItemDetails">×</button>
      </div>

      <ItemDetail :type="selectedItemType" :name="selectedItemName" :imageUrl="selectedImageUrl" :itemUrl="selectedItemUrl" :artistInfo="selectedArtist" :albumInfo="selectedAlbum" :trackInfo="selectedTrack" />
    </div>

    <!-- New Top Music Charts Component -->
    <TopMusicCharts 
      v-if="!isLoading && artistsStore.topArtists.length > 0" 
      @show-artist-details="showArtistDetails"
      @show-album-details="showAlbumDetails"
      @show-track-details="showTrackDetails"
    />
    
    <div v-else-if="isLoading" class="loading-container">
      <p>Loading your Last.fm data...</p>
    </div>
    
    <div v-else class="empty-state">
      <p>No Last.fm data available. Please enter your username and fetch your data.</p>
    </div>

    <footer>
      <p>Powered by <a href="https://www.last.fm/api" target="_blank">Last.fm API</a> | Built with Vue 3, Pinia, and Chart.js</p>
    </footer>
  </div>
</template>

<style>
:root {
  --primary-color: #d51007;
  --secondary-color: #42b883;
  --dark-color: #333;
  --light-color: #f4f4f4;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Inter", "Avenir", Helvetica, Arial, sans-serif;
  background-color: var(--light-color);
  color: var(--dark-color);
  line-height: 1.6;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

header h1 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
}

.input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.input-group label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.input-group input,
.input-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.fetch-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-end;
  min-width: 150px;
}

.fetch-button:hover {
  background-color: #b81a13;
}

.fetch-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Item details panel */
.item-details-container {
  background-color: white;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.item-details-header {
  background-color: var(--primary-color);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-details-header h2 {
  margin: 0;
  font-size: 1.4rem;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.loading-container {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  color: #888;
}

footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
  color: #666;
}

footer a {
  color: var(--primary-color);
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .fetch-button {
    align-self: stretch;
    width: 100%;
  }
}
</style>
