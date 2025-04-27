<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useArtistsStore } from "./stores/artists";
import { useAlbumsStore } from "./stores/albums";
import { useTracksStore } from "./stores/tracks";
import { useUserStore } from "./stores/user";
import { lastfmService } from "./services/lastfm.api";
import TopMusicCharts from "./components/charts/TopMusicCharts.vue";
import ItemDetail from "./components/ItemDetail.vue";
import SpotifyTest from "./components/SpotifyTest.vue";
import UserProfile from "./components/UserProfile.vue";
import AllArtistsPage from "./components/AllArtistsPage.vue";
import AllAlbumsPage from "./components/AllAlbumsPage.vue";
import AllTracksPage from "./components/AllTracksPage.vue";

// Initialize stores
const artistsStore = useArtistsStore();
const albumsStore = useAlbumsStore();
const tracksStore = useTracksStore();
const userStore = useUserStore();

// UI state
const username = ref("");
const period = ref("overall");
const isLoading = computed(() => artistsStore.loading || albumsStore.loading || tracksStore.loading);
const showItemDetails = ref(false);
const showSpotifyTest = ref(false);
const showUserProfile = ref(false);
const showAllArtists = ref(false);
const showAllAlbums = ref(false);
const showAllTracks = ref(false);

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
    if (!username.value.trim()) {
      console.log("No username provided, skipping data fetch");
      return;
    }

    // Update username in all stores
    artistsStore.setUsername(username.value);
    albumsStore.setUsername(username.value);
    tracksStore.setUsername(username.value);

    console.log("Fetching data for all stores with username:", username.value);

    // Fetch all data types
    await Promise.all([artistsStore.fetchTopArtists(period.value), albumsStore.fetchTopAlbums(period.value), tracksStore.fetchTopTracks(period.value)]);

    console.log("Data fetched successfully:", "Artists:", artistsStore.topArtists.length, "Albums:", albumsStore.topAlbums.length, "Tracks:", tracksStore.topTracks.length);

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
async function showAlbumDetails({ albumName, artistName }) {
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
async function showTrackDetails({ trackName, artistName }) {
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

// Show all top artists
function viewAllArtists() {
  console.log("Showing all top artists");
  showAllArtists.value = true;
  showAllAlbums.value = false;
  showAllTracks.value = false;
  showItemDetails.value = false;
}

// Show all top albums
function viewAllAlbums() {
  console.log("Showing all top albums");
  showAllArtists.value = false;
  showAllAlbums.value = true;
  showAllTracks.value = false;
  showItemDetails.value = false;
}

// Show all top tracks
function viewAllTracks() {
  console.log("Showing all top tracks");
  showAllArtists.value = false;
  showAllAlbums.value = false;
  showAllTracks.value = true;
  showItemDetails.value = false;
}

// Close all detail pages
function closeAllDetailPages() {
  showAllArtists.value = false;
  showAllAlbums.value = false;
  showAllTracks.value = false;
}

// No automatic data fetching on mount
onMounted(() => {
  console.log("App component mounted. Ready for user input.");
});
</script>

<template>
  <div class="min-h-screen bg-black text-white font-sans">
    <!-- Full screen header section -->
    <div class="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-black to-gray-900">
      <!-- Animated background elements -->
      <div class="absolute inset-0 overflow-hidden opacity-20">
        <div class="absolute top-0 left-0 w-full h-full">
          <div class="absolute w-20 h-20 rounded-full bg-red-500 animate-pulse" style="top: 10%; left: 15%; animation-delay: 0s"></div>
          <div class="absolute w-32 h-32 rounded-full bg-red-700 animate-pulse" style="top: 60%; left: 75%; animation-delay: 0.5s"></div>
          <div class="absolute w-24 h-24 rounded-full bg-red-600 animate-pulse" style="top: 25%; left: 60%; animation-delay: 1s"></div>
          <div class="absolute w-16 h-16 rounded-full bg-red-800 animate-pulse" style="top: 70%; left: 30%; animation-delay: 1.5s"></div>
          <div class="absolute w-28 h-28 rounded-full bg-red-900 animate-pulse" style="top: 40%; left: 40%; animation-delay: 2s"></div>
        </div>

        <!-- Music notes floating animation -->
        <div class="absolute top-0 left-1/4 animate-float" style="animation-duration: 15s">
          <svg class="w-12 h-12 text-red-500 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
          </svg>
        </div>
        <div class="absolute top-1/4 right-1/4 animate-float" style="animation-duration: 12s; animation-delay: 2s">
          <svg class="w-10 h-10 text-red-600 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
          </svg>
        </div>
        <div class="absolute bottom-1/3 left-1/3 animate-float" style="animation-duration: 18s; animation-delay: 1s">
          <svg class="w-14 h-14 text-red-700 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
          </svg>
        </div>
      </div>

      <!-- Central content -->
      <div class="z-10 text-center px-4 max-w-4xl mx-auto">
        <!-- Logo/Icon with glow effect -->
        <div class="flex justify-center mb-8">
          <div class="relative">
            <div class="absolute inset-0 blur-xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 opacity-70 scale-150"></div>
            <svg class="w-24 h-24 text-white relative z-10 transform rotate-[-5deg]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
            </svg>
          </div>
        </div>

        <!-- Main title with larger size and better gradient -->
        <h1 class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-red-600 to-red-500 mb-6 tracking-wide leading-tight transform -rotate-1">LAST SONGS</h1>

        <!-- Enhanced divider with animation -->
        <div class="relative h-2 max-w-md mx-auto mb-8 bg-gradient-to-r from-red-800 via-red-600 to-red-500 border-2 border-white transform rotate-1"></div>

        <!-- Improved subtitle with better typography and width constraint -->
        <p class="text-white text-xl max-w-lg mx-auto leading-relaxed mb-12 font-bold">Create and visualize your music listening history in a modern, interactive dashboard</p>

        <!-- Call to action button -->
        <a href="#main-content" class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-800 via-red-600 to-red-500 text-white font-black text-lg uppercase tracking-wide transform hover:translate-x-1 hover:translate-y-1 transition-transform duration-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] border-4 border-white">
          Get Started
          <svg class="w-5 h-5 ml-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </a>
      </div>

      <!-- Bottom scroll indicator -->
      <div class="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>

    <!-- Main content area -->
    <div id="main-content" class="max-w-6xl mx-auto p-4 md:p-8">
      <!-- Buttons Row -->
      <div class="mb-4 text-center space-x-4">
        <!-- User Profile Toggle Button -->
        <button @click="showUserProfile = !showUserProfile" class="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-2 px-4 rounded-full mb-4 inline-flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
          {{ showUserProfile ? "Hide User Profile" : "View User Profile" }}
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

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 bg-black border-4 border-white shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] p-8">
        <div class="flex flex-col">
          <label for="username" class="mb-2 font-black text-white uppercase tracking-wide">Last.fm Username</label>
          <div class="relative">
            <input id="username" v-model="username" type="text" placeholder="Enter your Last.fm username" class="w-full p-3 bg-gray-900 border-4 border-white text-base text-white placeholder-gray-500 focus:ring-0 focus:outline-none focus:border-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="flex flex-col">
          <label for="period" class="mb-2 font-black text-white uppercase tracking-wide">Time Period</label>
          <div class="relative">
            <select id="period" v-model="period" class="w-full appearance-none p-3 bg-gray-900 border-4 border-white text-base text-white focus:ring-0 focus:outline-none focus:border-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] pr-10">
              <option v-for="option in periods" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="flex items-end">
          <button @click="fetchData" :disabled="isLoading" class="w-full p-3 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-black text-lg uppercase tracking-wide transform hover:translate-x-1 hover:translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 flex items-center justify-center gap-2">
            <svg v-if="isLoading" class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        <div class="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white p-4 flex justify-between items-center">
          <h2 class="m-0 text-xl font-bold">{{ selectedItemName }}</h2>
          <button class="bg-transparent border-none text-white text-3xl cursor-pointer p-0 leading-none hover:text-gray-300 transition-colors duration-200" @click="closeItemDetails">×</button>
        </div>

        <ItemDetail :type="selectedItemType" :name="selectedItemName" :imageUrl="selectedImageUrl" :itemUrl="selectedItemUrl" :artistInfo="selectedArtist" :albumInfo="selectedAlbum" :trackInfo="selectedTrack" />
      </div>

      <!-- Charts Section -->
      <div v-if="!isLoading">
        <!-- All Artists Page -->
        <div v-if="showAllArtists" class="mb-8">
          <AllArtistsPage :username="username" :period="period" @close="closeAllDetailPages" @show-artist-details="showArtistDetails" />
        </div>

        <!-- All Albums Page -->
        <div v-else-if="showAllAlbums" class="mb-8">
          <AllAlbumsPage :username="username" :period="period" @close="closeAllDetailPages" @show-album-details="showAlbumDetails" />
        </div>

        <!-- All Tracks Page -->
        <div v-else-if="showAllTracks" class="mb-8">
          <AllTracksPage :username="username" :period="period" @close="closeAllDetailPages" @show-track-details="showTrackDetails" />
        </div>

        <!-- Default Overview Charts -->
        <div v-else class="grid grid-cols-1 gap-8 mb-8">
          <TopMusicCharts :username="username" :period="period" @show-artist-details="showArtistDetails" @show-album-details="showAlbumDetails" @show-track-details="showTrackDetails" @view-all-artists="viewAllArtists" @view-all-albums="viewAllAlbums" @view-all-tracks="viewAllTracks" />
        </div>
      </div>

      <div v-else-if="isLoading" class="text-center p-12 bg-black border-4 border-white shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] mb-10">
        <div class="flex flex-col items-center">
          <div class="w-full max-w-md p-5 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white relative overflow-hidden min-h-[120px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] mb-8 transform rotate-[-1deg]">
            <div class="text-base font-black uppercase tracking-wider mb-4">Loading Your Charts</div>
            <div class="flex justify-between items-end">
              <div class="flex flex-col">
                <span class="text-2xl font-black">Please Wait</span>
                <span class="text-sm font-black">Fetching your Last.fm data...</span>
              </div>
              <div class="flex gap-2 items-end h-14">
                <div class="w-4 bg-black border-2 border-black animate-pulse" style="height: 60%"></div>
                <div class="w-4 bg-black border-2 border-black animate-pulse delay-100" style="height: 90%"></div>
                <div class="w-4 bg-black border-2 border-black animate-pulse delay-200" style="height: 40%"></div>
                <div class="w-4 bg-black border-2 border-black animate-pulse delay-300" style="height: 70%"></div>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="absolute top-0 left-0 right-0 bottom-0 animate-ping opacity-30 rounded-full h-16 w-16 border-8 border-white"></div>
            <div class="animate-spin rounded-full h-16 w-16 border-8 border-white border-t-red-600 mb-6"></div>
          </div>
          <p class="text-white text-lg font-bold uppercase tracking-wide">Loading your Last.fm data...</p>
        </div>
      </div>

      <div v-else class="text-center p-12 bg-black border-4 border-white shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] mb-10">
        <div class="w-full max-w-md mx-auto p-6 bg-gray-900 relative overflow-hidden min-h-[120px] border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] mb-8 transform rotate-[1deg]">
          <div class="text-base font-black uppercase tracking-wider mb-4 text-white">No Data Available</div>
          <div class="flex justify-between items-center">
            <div class="flex flex-col">
              <span class="text-xl font-black text-white">Please enter your username</span>
              <span class="text-sm font-bold text-gray-400">And fetch your Last.fm data</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-700 transform rotate-[-5deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="text-white text-lg font-bold">Enter your Last.fm username and select a time period</p>
        <p class="text-gray-400 text-base mt-2 italic">to visualize your music listening history</p>
      </div>

      <footer class="text-center mt-16 pt-6 border-t-4 border-white text-white">
        <div class="flex justify-center items-center gap-6 mb-4">
          <span class="w-5 h-5 bg-red-500 border-2 border-black transform rotate-[10deg]"></span>
          <span class="w-5 h-5 bg-red-600 border-2 border-black"></span>
          <span class="w-5 h-5 bg-red-700 border-2 border-black transform rotate-[-10deg]"></span>
        </div>
        <p class="font-bold mb-2">Powered by <a href="https://www.last.fm/api" target="_blank" class="text-red-500 hover:underline hover:text-red-400 transition-colors">Last.fm API</a> and <a href="https://www.spotify.com/" target="_blank" class="text-green-500 hover:underline hover:text-greeb-400 transition-colors">Spotify API</a> | Built with Vue 3, Pinia, and Tailwind CSS</p>
        <p class="font-bold">Made with <span class="text-red-500 text-xl relative top-0.5">❤️</span> by <a href="https://github.com/nachthirsch" target="_blank" class="text-red-500 hover:underline hover:text-red-400 transition-colors">yuunaagi</a></p>
      </footer>
    </div>
  </div>
</template>

<style>
.bg-spotify-green {
  background-color: #1db954;
}

/* Animation for floating music notes */
@keyframes float {
  0% {
    transform: translateY(0) translateX(0) rotate(0);
    opacity: 0.5;
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(5deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-40px) translateX(-10px) rotate(-5deg);
    opacity: 0.9;
  }
  75% {
    transform: translateY(-20px) translateX(-15px) rotate(3deg);
    opacity: 0.7;
  }
  100% {
    transform: translateY(0) translateX(0) rotate(0);
    opacity: 0.5;
  }
}

.animate-float {
  animation-name: float;
  animation-duration: 15s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
</style>
