<!-- A component displaying top music charts in a modern card layout -->
<template>
  <div class="w-full p-5 bg-black text-white font-sans rounded-lg shadow-lg mb-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold uppercase mb-1">TOP MUSIC</h2>
      <div class="w-24 h-0.5 bg-white"></div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      <!-- Artists Card -->
      <div class="p-5 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-purple-300 text-black relative overflow-hidden min-h-[100px] shadow-md">
        <div class="text-base mb-4">Artists</div>
        <div class="flex justify-between items-end">
          <div class="flex flex-col">
            <span class="text-4xl font-bold">{{ artistsCount }}</span>
            <span v-if="artistsTrend > 0" class="text-sm font-medium text-green-800">↑ {{ formatTrend(artistsTrend) }}%</span>
            <span v-else-if="artistsTrend < 0" class="text-sm font-medium text-red-800">↓ {{ formatTrend(Math.abs(artistsTrend)) }}%</span>
          </div>
          <div class="flex gap-1 items-end h-12">
            <div v-for="i in 3" :key="`artist-ind-${i}`" 
                class="w-2.5 bg-black bg-opacity-20 rounded-sm"
                :class="[
                  i === 1 ? 'h-10' : '',
                  i === 2 ? 'h-6' : '',
                  i === 3 ? 'h-4' : ''
                ]">
            </div>
          </div>
        </div>
      </div>

      <!-- Albums Card -->
      <div class="p-5 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-teal-300 text-black relative overflow-hidden min-h-[100px] shadow-md">
        <div class="text-base mb-4">Albums</div>
        <div class="flex justify-between items-end">
          <div class="flex flex-col">
            <span class="text-4xl font-bold">{{ albumsCount }}</span>
            <span v-if="albumsTrend > 0" class="text-sm font-medium text-green-800">↑ {{ formatTrend(albumsTrend) }}%</span>
            <span v-else-if="albumsTrend < 0" class="text-sm font-medium text-red-800">↓ {{ formatTrend(Math.abs(albumsTrend)) }}%</span>
          </div>
          <div class="flex gap-1 items-end h-12">
            <div v-for="i in 3" :key="`album-ind-${i}`" 
                class="w-2.5 bg-black bg-opacity-20 rounded-sm"
                :class="[
                  i === 1 ? 'h-10' : '',
                  i === 2 ? 'h-6' : '',
                  i === 3 ? 'h-4' : ''
                ]">
            </div>
          </div>
        </div>
      </div>

      <!-- Tracks Card -->
      <div class="p-5 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-blue-400 text-black relative overflow-hidden min-h-[100px] shadow-md">
        <div class="text-base mb-4">Tracks</div>
        <div class="flex justify-between items-end">
          <div class="flex flex-col">
            <span class="text-4xl font-bold">{{ tracksCount }}</span>
            <span v-if="tracksTrend > 0" class="text-sm font-medium text-green-800">↑ {{ formatTrend(tracksTrend) }}%</span>
            <span v-else-if="tracksTrend < 0" class="text-sm font-medium text-red-800">↓ {{ formatTrend(Math.abs(tracksTrend)) }}%</span>
          </div>
          <div class="flex gap-1 items-end h-12">
            <div v-for="i in 3" :key="`track-ind-${i}`" 
                class="w-2.5 bg-black bg-opacity-20 rounded-sm"
                :class="[
                  i === 1 ? 'h-10' : '',
                  i === 2 ? 'h-6' : '',
                  i === 3 ? 'h-4' : ''
                ]">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Items Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      <!-- Top Artist Section -->
      <div class="flex flex-col">
        <div v-if="topArtist" 
            @click="showArtistDetails(topArtist.name)"
            class="relative mb-5 bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl shadow-md">
          <div class="relative w-full h-48 overflow-hidden">
            <img :src="getArtistImage(topArtist)" :alt="topArtist.name" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
            <div class="absolute bottom-2 left-2 bg-purple-300 text-black text-xs font-semibold py-1 px-2 rounded z-10">Top Artist</div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-1">#1 {{ topArtist.name }}</h3>
            <div class="text-xs text-gray-400">{{ formatPlaycount(topArtist.playcount) }} scrobbles</div>
          </div>
        </div>

        <div class="bg-gray-900 rounded-lg overflow-hidden shadow-md">
          <div v-for="(artist, index) in otherTopArtists" 
              :key="artist.mbid || index" 
              @click="showArtistDetails(artist.name)"
              class="flex items-center p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200">
            <div class="w-10 font-semibold text-sm">#{{ index + 2 }}</div>
            <div class="flex-1 truncate text-sm">{{ artist.name }}</div>
            <div class="w-10 text-xs text-gray-400 text-right">{{ formatPlaycount(artist.playcount) }}</div>
          </div>
        </div>
      </div>

      <!-- Top Album Section -->
      <div class="flex flex-col">
        <div v-if="topAlbum" 
            @click="showAlbumDetails(topAlbum.name, topAlbum.artist?.name)"
            class="relative mb-5 bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl shadow-md">
          <div class="relative w-full h-48 overflow-hidden">
            <img :src="getAlbumImage(topAlbum)" :alt="topAlbum.name" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
            <div class="absolute bottom-2 left-2 bg-teal-300 text-black text-xs font-semibold py-1 px-2 rounded z-10">Top Album</div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-1">#1 {{ topAlbum.name }}</h3>
            <div class="text-sm text-gray-500 mb-1">{{ topAlbum.artist?.name }}</div>
            <div class="text-xs text-gray-400">{{ formatPlaycount(topAlbum.playcount) }} scrobbles</div>
          </div>
        </div>

        <div class="bg-gray-900 rounded-lg overflow-hidden shadow-md">
          <div v-for="(album, index) in otherTopAlbums" 
              :key="album.mbid || index" 
              @click="showAlbumDetails(album.name, album.artist?.name)"
              class="flex items-center p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200">
            <div class="w-10 font-semibold text-sm">#{{ index + 2 }}</div>
            <div class="flex-1 truncate text-sm">{{ album.name }}</div>
            <div class="w-10 text-xs text-gray-400 text-right">{{ formatPlaycount(album.playcount) }}</div>
          </div>
        </div>
      </div>

      <!-- Top Track Section -->
      <div class="flex flex-col">
        <div v-if="topTrack" 
            @click="showTrackDetails(topTrack.name, topTrack.artist?.name)"
            class="relative mb-5 bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl shadow-md">
          <div class="relative w-full h-48 overflow-hidden">
            <img :src="getTrackImage(topTrack)" :alt="topTrack.name" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
            <div class="absolute bottom-2 left-2 bg-blue-400 text-black text-xs font-semibold py-1 px-2 rounded z-10">Top Track</div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-1">#1 {{ topTrack.name }}</h3>
            <div class="text-sm text-gray-500 mb-1">{{ topTrack.artist?.name }}</div>
            <div class="text-xs text-gray-400">{{ formatPlaycount(topTrack.playcount) }} scrobbles</div>
          </div>
        </div>

        <div class="bg-gray-900 rounded-lg overflow-hidden shadow-md">
          <div v-for="(track, index) in otherTopTracks" 
              :key="track.mbid || index" 
              @click="showTrackDetails(track.name, track.artist?.name)"
              class="flex items-center p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200">
            <div class="w-10 font-semibold text-sm">#{{ index + 2 }}</div>
            <div class="flex-1 truncate text-sm">{{ track.name }}</div>
            <div class="w-10 text-xs text-gray-400 text-right">{{ formatPlaycount(track.playcount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Items Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div class="bg-gray-900 rounded-lg p-4 min-h-[100px] shadow-md">
        <h3 class="text-base font-semibold mb-4">New Artists</h3>
        <!-- New artists will be displayed here -->
      </div>
      <div class="bg-gray-900 rounded-lg p-4 min-h-[100px] shadow-md">
        <h3 class="text-base font-semibold mb-4">New Albums</h3>
        <!-- New albums will be displayed here -->
      </div>
      <div class="bg-gray-900 rounded-lg p-4 min-h-[100px] shadow-md">
        <h3 class="text-base font-semibold mb-4">New Tracks</h3>
        <!-- New tracks will be displayed here -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from "vue";
import { useArtistsStore } from "../../stores/artists";
import { useAlbumsStore } from "../../stores/albums";
import { useTracksStore } from "../../stores/tracks";
import { lastfmService } from "../../services/lastfm.api";

// Initialize stores
const artistsStore = useArtistsStore();
const albumsStore = useAlbumsStore();
const tracksStore = useTracksStore();

// Define events for parent component
const emit = defineEmits(['show-artist-details', 'show-album-details', 'show-track-details']);

// Data counts and trends
const artistsCount = computed(() => artistsStore.topArtists.length);
const albumsCount = computed(() => albumsStore.topAlbums.length);
const tracksCount = computed(() => tracksStore.topTracks.length);

// Mock trend data (can be replaced with actual change calculations)
const artistsTrend = ref(41);
const albumsTrend = ref(45);
const tracksTrend = ref(27);

// Computed properties for top items
const topArtist = computed(() => artistsStore.topArtists[0] || null);
const otherTopArtists = computed(() => artistsStore.topArtists.slice(1, 5) || []);

const topAlbum = computed(() => albumsStore.topAlbums[0] || null);
const otherTopAlbums = computed(() => albumsStore.topAlbums.slice(1, 5) || []);

const topTrack = computed(() => tracksStore.topTracks[0] || null);
const otherTopTracks = computed(() => tracksStore.topTracks.slice(1, 5) || []);

// Helper functions
function formatTrend(value) {
  return value.toFixed(0);
}

function formatPlaycount(playcount) {
  if (!playcount) return "0";
  return parseInt(playcount).toLocaleString();
}

function getArtistImage(artist) {
  if (!artist) return "";
  return artistsStore.getArtistLargeImage(artist.name) || "https://via.placeholder.com/150?text=No+Image";
}

function getAlbumImage(album) {
  if (!album || !album.image) return "https://via.placeholder.com/150?text=No+Image";
  return lastfmService.getLargeImage(album.image) || "https://via.placeholder.com/150?text=No+Image";
}

function getTrackImage(track) {
  if (!track || !track.image) return "https://via.placeholder.com/150?text=No+Image";
  return lastfmService.getLargeImage(track.image) || "https://via.placeholder.com/150?text=No+Image";
}

// Event handlers for item details
function showArtistDetails(artistName) {
  emit('show-artist-details', artistName);
}

function showAlbumDetails(albumName, artistName) {
  if (!artistName) {
    console.warn('Missing artist name for album details:', albumName);
    return;
  }
  emit('show-album-details', albumName, artistName);
}

function showTrackDetails(trackName, artistName) {
  if (!artistName) {
    console.warn('Missing artist name for track details:', trackName);
    return;
  }
  emit('show-track-details', trackName, artistName);
}
</script> 