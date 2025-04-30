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
    <!-- Simplified minimalist header section -->
    <div class="relative h-screen flex flex-col justify-center items-center bg-black">
      <!-- Clean, minimalist background with subtle accent -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-500"></div>
        <div class="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-800"></div>
      </div>

      <!-- Centered content with minimal styling -->
      <div class="z-10 text-center px-4 max-w-2xl mx-auto">
        <!-- Simple, clean logo -->
        <div class="flex justify-center mb-6">
          <svg class="w-16 h-16 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
          </svg>
        </div>

        <!-- Clean typography with minimal styling -->
        <h1 class="text-6xl font-bold mb-4">LAST SONGS</h1>
        
        <!-- Simple, elegant divider -->
        <div class="h-px w-24 mx-auto mb-8 bg-red-600"></div>

        <!-- Clean subtitle with improved readability -->
        <p class="text-gray-300 text-lg mb-10">Create and visualize your last.fm music listening history</p>

        <!-- Neobrutalism-style button -->
        <a href="#main-content" class="inline-block px-10 py-4 bg-red-600 text-white font-bold uppercase tracking-wider rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 mb-10">
          Get Started
        </a>
        
        <!-- Social media icons with neobrutalism styling -->
        <div class="flex justify-center items-center space-x-8 mt-8">
          <!-- GitHub Icon -->
          <a href="https://github.com/Nachthirsch" target="_blank" class="bg-gray-800 p-2 border-2 border-white rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
          </a>
          
          <!-- Instagram Icon -->
          <a href="http://instagram.com/yuunaagi" target="_blank" class="bg-gradient-to-br from-purple-600 to-pink-500 p-2 border-2 border-white rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
            </svg>
          </a>
          
          <!-- Ko-fi Icon -->
          <a href="https://ko-fi.com/yunaagi" target="_blank" class="bg-blue-600 p-2 border-2 border-white rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
            </svg>
            <span class="ml-2 text-white text-xs font-bold typewriter">I appreciate your support!</span>
          </a>
        </div>
      </div>

    </div>

    <!-- Main content area -->
    <div id="main-content" class="max-w-6xl mx-auto p-4 md:p-8">
      <!-- Buttons Row -->


      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 bg-black border-4 border-white shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] p-8">
        <div class="flex flex-col">
          <label for="username" class="mb-2 font-black text-white uppercase tracking-wide">Last.fm Username</label>
          <div class="relative">
            <input id="username" v-model="username" type="text" placeholder="Enter your Last.fm username" class="w-full p-3 bg-gray-900 border-4 border-black text-base text-white placeholder-gray-500 focus:ring-0 focus:outline-none focus:border-red-500 rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]" />
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
            <select id="period" v-model="period" class="w-full appearance-none p-3 bg-gray-900 border-4 border-black text-base text-white focus:ring-0 focus:outline-none focus:border-red-500 rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] pr-10">
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
          <button @click="fetchData" :disabled="isLoading" class="w-full p-3 bg-red-600 text-white font-black text-lg uppercase tracking-wide rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
            <svg v-if="isLoading" class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isLoading">Loading...</span>
            <span v-else>Fetch Data</span>
          </button>
        </div>
      </div>

            <div class="mb-4 text-center space-x-4">
        <!-- User Profile Toggle Button -->
        <button @click="showUserProfile = !showUserProfile" class="bg-red-700 text-white font-bold py-2 px-6 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 mb-4 inline-flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
          {{ showUserProfile ? "Hide User Profile" : "View User Profile" }}
        </button>
      </div>

      <!-- User Profile Component -->
      <div v-if="showUserProfile" class="mb-8">
        <UserProfile :username="username" />
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
        
        <!-- Social media icons in footer with neobrutalism styling -->
        <div class="flex justify-center items-center space-x-8 mb-6">
          <!-- GitHub Icon -->
          <a href="https://github.com/Nachthirsch" target="_blank" class="bg-gray-800 p-2 border-2 border-white rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
          </a>
          
          <!-- Instagram Icon -->
          <a href="http://instagram.com/yuunaagi" target="_blank" class="bg-gradient-to-br from-purple-600 to-pink-500 p-2 border-2 border-white rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
            </svg>
          </a>
          
          <!-- Ko-fi Icon -->
          <a href="https://ko-fi.com/yunaagi" target="_blank" class="bg-blue-600 p-2 border-2 border-white rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
            </svg>
            <span class="ml-2 text-white text-xs font-bold typewriter">I appreciate your support!</span>
          </a>
        </div>
        
        <p class="font-bold mb-2">Powered by <a href="https://www.last.fm/api" target="_blank" class="text-red-500 hover:underline hover:text-red-400 transition-colors">Last.fm API</a> and <a href="https://www.spotify.com/" target="_blank" class="text-green-500 hover:underline hover:text-green-400 transition-colors">Spotify API</a> | Built with Vue 3, Pinia, and Tailwind CSS</p>
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

/* Animation for fading in and out */
@keyframes pulse-fade {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

/* Animation for typewriter effect */
@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

.animate-float {
  animation-name: float;
  animation-duration: 15s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.animate-pulse-fade {
  animation-name: pulse-fade;
  animation-duration: 3s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.typewriter {
  overflow: hidden;
  white-space: nowrap;
  animation: typing 3s steps(40, end) 1s 1 normal both;
  width: 0;
  display: inline-block;
}
</style>
