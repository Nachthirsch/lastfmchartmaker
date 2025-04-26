<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useArtistsStore } from "./stores/artists";
import { useAlbumsStore } from "./stores/albums";
import { useTracksStore } from "./stores/tracks";
import { useTagsStore } from "./stores/tags";
import { useUserStore } from "./stores/user";
import { lastfmService } from "./services/lastfm.api";
import TopMusicCharts from "./components/charts/TopMusicCharts.vue";
import TopTagsChart from "./components/charts/TopTagsChart.vue";
import ItemDetail from "./components/ItemDetail.vue";
import SpotifyTest from "./components/SpotifyTest.vue";
import UserProfile from "./components/UserProfile.vue";

// Initialize stores
const artistsStore = useArtistsStore();
const albumsStore = useAlbumsStore();
const tracksStore = useTracksStore();
const tagsStore = useTagsStore();
const userStore = useUserStore();

// UI state
const username = ref("yuunaagi");
const period = ref("overall");
const isLoading = computed(() => artistsStore.loading || albumsStore.loading || tracksStore.loading || tagsStore.loading);
const showItemDetails = ref(false);
const showSpotifyTest = ref(false);
const showUserProfile = ref(false);

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
    tagsStore.setUsername(username.value);

    console.log('Fetching data for all stores with username:', username.value);

    // Fetch all data types
    await Promise.all([
      artistsStore.fetchTopArtists(period.value),
      albumsStore.fetchTopAlbums(period.value),
      tracksStore.fetchTopTracks(period.value),
      tagsStore.fetchTopTags()
    ]);

    console.log('Data fetched successfully:',
      'Artists:', artistsStore.topArtists.length,
      'Albums:', albumsStore.topAlbums.length,
      'Tracks:', tracksStore.topTracks.length,
      'Tags:', tagsStore.topTags.length
    );

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

// Toggle the Spotify test component
function toggleSpotifyTest() {
  showSpotifyTest.value = !showSpotifyTest.value;
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
  <div class="min-h-screen bg-black text-white font-sans pb-16">
    <div class="max-w-6xl mx-auto p-4 md:p-8">
      <header class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2 tracking-wide">LAST.FM CHART MAKER</h1>
        <div class="w-24 h-0.5 bg-white mx-auto mb-4"></div>
        <p class="text-gray-400">Create and visualize your music listening history in a modern dashboard</p>
      </header>

      <!-- Buttons Row -->
      <div class="mb-4 text-center space-x-4">
        <!-- Spotify Test Toggle Button -->
        <button 
          @click="toggleSpotifyTest" 
          class="bg-spotify-green hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-full mb-4 inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.42.12-.84-.12-.96-.54-.12-.42.12-.84.54-.96 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.36 1.08zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          {{ showSpotifyTest ? 'Hide Spotify Test' : 'Test Spotify Integration' }}
        </button>

        <!-- User Profile Toggle Button -->
        <button 
          @click="showUserProfile = !showUserProfile" 
          class="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-full mb-4 inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
          {{ showUserProfile ? 'Hide User Profile' : 'View User Profile' }}
        </button>
      </div>

      <!-- Spotify Test Component -->
      <div v-if="showSpotifyTest" class="mb-8">
        <SpotifyTest />
      </div>

      <!-- User Profile Component -->
      <div v-if="showUserProfile" class="mb-8">
        <UserProfile :username="username" />
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 bg-black rounded-lg shadow-lg border border-gray-800 p-6">
        <div class="flex flex-col">
          <label for="username" class="mb-2 font-bold text-gray-300">Last.fm Username</label>
          <div class="relative">
            <input id="username" v-model="username" type="text" placeholder="Enter your Last.fm username" 
                  class="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-300 focus:border-transparent" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="flex flex-col">
          <label for="period" class="mb-2 font-bold text-gray-300">Time Period</label>
          <div class="relative">
            <select id="period" v-model="period"
                    class="w-full appearance-none p-3 bg-gray-900 border border-gray-700 rounded-md text-base text-white focus:ring-2 focus:ring-purple-300 focus:border-transparent pr-10">
              <option v-for="option in periods" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="flex items-end">
          <button @click="fetchData" :disabled="isLoading" 
                  class="w-full p-3 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-gradient-to-r from-purple-300 via-teal-300 to-blue-400 text-black font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-400 hover:via-teal-400 hover:to-blue-500 transition duration-200 shadow-md transform hover:-translate-y-1 flex items-center justify-center">
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isLoading">Loading...</span>
            <span v-else>Fetch Data</span>
          </button>
        </div>
      </div>

      <!-- Item Details Panel -->
      <div v-if="showItemDetails" class="bg-gray-900 rounded-lg mb-8 shadow-lg overflow-hidden border border-gray-800">
        <div class="bg-gradient-to-r from-purple-300 via-teal-300 to-blue-400 text-black p-4 flex justify-between items-center">
          <h2 class="m-0 text-xl font-bold">{{ selectedItemName }}</h2>
          <button class="bg-transparent border-none text-black text-3xl cursor-pointer p-0 leading-none hover:text-gray-800 transition-colors duration-200" @click="closeItemDetails">×</button>
        </div>

        <ItemDetail :type="selectedItemType" :name="selectedItemName" :imageUrl="selectedImageUrl" :itemUrl="selectedItemUrl" :artistInfo="selectedArtist" :albumInfo="selectedAlbum" :trackInfo="selectedTrack" />
      </div>

      <!-- Charts Section -->
      <div v-if="!isLoading">
        <div class="grid grid-cols-1 gap-8 mb-8">
          <TopMusicCharts 
            :username="username" 
            :period="period"
            @show-artist-details="showArtistDetails"
            @show-album-details="showAlbumDetails"
            @show-track-details="showTrackDetails"
          />
          <TopTagsChart />
        </div>
      </div>
      
      <div v-else-if="isLoading" class="text-center p-12 bg-black rounded-lg shadow-lg border border-gray-800">
        <div class="flex flex-col items-center">
          <div class="w-full max-w-md p-5 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-gradient-to-r from-purple-300 via-teal-300 to-blue-400 text-black relative overflow-hidden min-h-[100px] shadow-md mb-6">
            <div class="text-base mb-4 font-bold">Loading Your Charts</div>
            <div class="flex justify-between items-end">
              <div class="flex flex-col">
                <span class="text-2xl font-bold">Please Wait</span>
                <span class="text-sm font-medium">Fetching your Last.fm data...</span>
              </div>
              <div class="flex gap-1 items-end h-12">
                <div class="w-2.5 h-6 bg-black bg-opacity-20 rounded-sm animate-pulse"></div>
                <div class="w-2.5 h-10 bg-black bg-opacity-20 rounded-sm animate-pulse delay-100"></div>
                <div class="w-2.5 h-4 bg-black bg-opacity-20 rounded-sm animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-300 mb-4"></div>
          <p class="text-gray-300">Loading your Last.fm data...</p>
        </div>
      </div>
      
      <div v-else class="text-center p-12 bg-black rounded-lg shadow-lg border border-gray-800">
        <div class="w-full max-w-md mx-auto p-5 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-gray-900 relative overflow-hidden min-h-[100px] shadow-md mb-6">
          <div class="text-base mb-4 font-bold">No Data Available</div>
          <div class="flex justify-between items-center">
            <div class="flex flex-col">
              <span class="text-xl font-bold">Please enter your username</span>
              <span class="text-sm text-gray-400">And fetch your Last.fm data</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="text-gray-400">Enter your Last.fm username and select a time period to see your music charts</p>
      </div>

      <footer class="text-center mt-12 pt-4 border-t border-gray-800 text-gray-400">
        <div class="flex justify-center items-center gap-4 mb-2">
          <span class="w-3 h-3 rounded-full bg-purple-300"></span>
          <span class="w-3 h-3 rounded-full bg-teal-300"></span>
          <span class="w-3 h-3 rounded-full bg-blue-400"></span>
        </div>
        <p>Powered by <a href="https://www.last.fm/api" target="_blank" class="text-purple-300 no-underline hover:underline">Last.fm API</a> | Built with Vue 3, Pinia, and Tailwind CSS</p>
      </footer>
    </div>
  </div>
</template>

<style>
.bg-spotify-green {
  background-color: #1DB954;
}
</style>
