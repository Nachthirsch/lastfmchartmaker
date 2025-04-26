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
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-bold">Top Artists</h3>
          <div class="flex gap-2">
            <button @click="$emit('view-all-artists')" class="text-white bg-purple-600 hover:bg-purple-700 transition px-3 py-1 rounded-md text-sm flex items-center">
              <span class="mr-1">View All</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
            <button @click="shareSection('artists')" class="text-white bg-purple-600 hover:bg-purple-700 transition px-3 py-1 rounded-md text-sm flex items-center">
              <span class="mr-1">Share</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
            </button>
          </div>
        </div>
        
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
            
            <!-- Artist Tags -->
            <div v-if="topArtistTags.length > 0" class="mt-2 flex flex-wrap gap-1">
              <span class="text-xs text-gray-500">Tags:</span>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(tag, index) in topArtistTags" 
                  :key="index" 
                  class="text-xs px-2 py-0.5 bg-purple-600 bg-opacity-30 rounded-full text-purple-300"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
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
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-bold">Top Albums</h3>
          <div class="flex gap-2">
            <button @click="$emit('view-all-albums')" class="text-white bg-teal-600 hover:bg-teal-700 transition px-3 py-1 rounded-md text-sm flex items-center">
              <span class="mr-1">View All</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
            <button @click="shareSection('albums')" class="text-white bg-teal-600 hover:bg-teal-700 transition px-3 py-1 rounded-md text-sm flex items-center">
              <span class="mr-1">Share</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
            </button>
          </div>
        </div>
        
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
            
            <!-- Album Tags -->
            <div v-if="topAlbumTags.length > 0" class="mt-2 flex flex-wrap gap-1">
              <span class="text-xs text-gray-500">Tags:</span>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(tag, index) in topAlbumTags" 
                  :key="index" 
                  class="text-xs px-2 py-0.5 bg-teal-600 bg-opacity-30 rounded-full text-teal-300"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
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
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-bold">Top Tracks</h3>
          <div class="flex gap-2">
            <button @click="$emit('view-all-tracks')" class="text-white bg-blue-600 hover:bg-blue-700 transition px-3 py-1 rounded-md text-sm flex items-center">
              <span class="mr-1">View All</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
            <button @click="shareSection('tracks')" class="text-white bg-blue-600 hover:bg-blue-700 transition px-3 py-1 rounded-md text-sm flex items-center">
              <span class="mr-1">Share</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
            </button>
          </div>
        </div>
        
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
            
            <!-- Track Tags -->
            <div v-if="topTrackTags.length > 0" class="mt-2 flex flex-wrap gap-1">
              <span class="text-xs text-gray-500">Tags:</span>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(tag, index) in topTrackTags" 
                  :key="index" 
                  class="text-xs px-2 py-0.5 bg-blue-600 bg-opacity-30 rounded-full text-blue-300"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
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
    
    <!-- Share Preview Components -->
    <div ref="shareArtistsTemplate" class="hidden">
      <div class="share-template artists-template">
        <div class="share-header">
          <h2>TOP ARTISTS</h2>
          <div class="username">{{ username }}</div>
          <div class="time-range">{{ timeRange }}</div>
        </div>
        
        <div class="share-content">
          <div class="featured-item">
            <div class="item-rank">#1</div>
            <img :src="topArtist?.image ? getArtistImage(topArtist) : ''" :alt="topArtist?.name" class="item-image" />
            <div class="item-name">{{ topArtist?.name || 'No Artist' }}</div>
            <div class="item-count">{{ formatPlaycount(topArtist?.playcount) }} scrobbles</div>
          </div>
          
          <ul class="share-list">
            <li v-for="(artist, index) in otherTopArtists" :key="artist.mbid || index" class="share-list-item">
              <div class="item-rank">#{{ index + 2 }}</div>
              <div class="item-details">
                <div class="item-name">{{ artist.name }}</div>
                <div class="item-count">{{ formatPlaycount(artist.playcount) }} scrobbles</div>
              </div>
            </li>
          </ul>
        </div>
        
        <div class="share-footer">
          <div class="site-name">LastSongs</div>
          <div class="description">lastsongs.netlify.app</div>
        </div>
      </div>
    </div>
    
    <div ref="shareAlbumsTemplate" class="hidden">
      <div class="share-template albums-template">
        <div class="share-header">
          <h2>TOP ALBUMS</h2>
          <div class="username">{{ username }}</div>
          <div class="time-range">{{ timeRange }}</div>
        </div>
        
        <div class="share-content">
          <div class="featured-item">
            <div class="item-rank">#1</div>
            <img :src="topAlbum?.image ? getAlbumImage(topAlbum) : ''" :alt="topAlbum?.name" class="item-image" />
            <div class="item-name">{{ topAlbum?.name || 'No Album' }}</div>
            <div class="item-count">{{ topAlbum?.artist?.name || 'Unknown Artist' }} • {{ formatPlaycount(topAlbum?.playcount) }} scrobbles</div>
          </div>
          
          <ul class="share-list">
            <li v-for="(album, index) in otherTopAlbums" :key="album.mbid || index" class="share-list-item">
              <div class="item-rank">#{{ index + 2 }}</div>
              <div class="item-details">
                <div class="item-name">{{ album.name }}</div>
                <div class="item-count">{{ album.artist?.name }} • {{ formatPlaycount(album.playcount) }}</div>
              </div>
            </li>
          </ul>
        </div>
        
        <div class="share-footer">
          <div class="site-name">Last Songs</div>
          <div class="description">lastsongs.netlify.app</div>
        </div>
      </div>
    </div>
    
    <div ref="shareTracksTemplate" class="hidden">
      <div class="share-template tracks-template">
        <div class="share-header">
          <h2>TOP TRACKS</h2>
          <div class="username">{{ username }}</div>
          <div class="time-range">{{ timeRange }}</div>
        </div>
        
        <div class="share-content">
          <div class="featured-item">
            <div class="item-rank">#1</div>
            <img :src="topTrack?.image ? getTrackImage(topTrack) : ''" :alt="topTrack?.name" class="item-image" />
            <div class="item-name">{{ topTrack?.name || 'No Track' }}</div>
            <div class="item-count">{{ topTrack?.artist?.name || 'Unknown Artist' }} • {{ formatPlaycount(topTrack?.playcount) }} scrobbles</div>
          </div>
          
          <ul class="share-list">
            <li v-for="(track, index) in otherTopTracks" :key="track.mbid || index" class="share-list-item">
              <div class="item-rank">#{{ index + 2 }}</div>
              <div class="item-details">
                <div class="item-name">{{ track.name }}</div>
                <div class="item-count">{{ track.artist?.name }} • {{ formatPlaycount(track.playcount) }}</div>
              </div>
            </li>
          </ul>
        </div>
        
        <div class="share-footer">
          <div class="site-name">LastFM Chart Maker</div>
          <div class="description">lastfmchartmaker.com</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits, defineProps } from "vue";
import { useArtistsStore } from "../../stores/artists";
import { useAlbumsStore } from "../../stores/albums";
import { useTracksStore } from "../../stores/tracks";
import { useUserStore } from "../../stores/user";
import { lastfmService } from "../../services/lastfm.api";
import html2canvas from 'html2canvas';

// Define props
const props = defineProps({
  username: {
    type: String,
    default: ''
  },
  period: {
    type: String,
    default: 'overall'
  }
});

// Initialize stores
const artistsStore = useArtistsStore();
const albumsStore = useAlbumsStore();
const tracksStore = useTracksStore();
const userStore = useUserStore();

// Define events for parent component
const emit = defineEmits(['show-artist-details', 'show-album-details', 'show-track-details', 'view-all-artists', 'view-all-albums', 'view-all-tracks']);

// User information
const username = computed(() => {
  // First try to get from props, then fallback to stores
  if (props.username) return props.username;
  return userStore.username || tracksStore.username || 'music_lover';
});

const timeRange = computed(() => {
  // First check props, then fallback to stores
  const periodValue = props.period || 'overall';
  
  switch (periodValue) {
    case '7day': return 'Last 7 days';
    case '1month': return 'Last month';
    case '3month': return 'Last 3 months';
    case '6month': return 'Last 6 months';
    case '12month': return 'Last year';
    case 'overall': return 'All time';
    default: return 'All time';
  }
});

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

// Tag data for top items
const topArtistTags = ref([]);
const topAlbumTags = ref([]);
const topTrackTags = ref([]);

// References for share templates
const shareArtistsTemplate = ref(null);
const shareAlbumsTemplate = ref(null);
const shareTracksTemplate = ref(null);

// Fetch Spotify images for tracks if they're not already loaded
onMounted(async () => {
  console.log('[COMPONENT] Component mounted, checking for image data');
  
  // Check if we have tracks but they don't have Spotify images
  if (tracksStore.topTracks.length > 0 && !tracksStore.topTracks[0].spotifyImage) {
    console.log('[COMPONENT] Fetching Spotify images for top tracks on component mount');
    try {
      // Use the tracks store function to fetch Spotify images
      await tracksStore.fetchSpotifyImagesForTracks([
        ...tracksStore.topTracks.slice(0, 5)
      ]);
    } catch (error) {
      console.error('[COMPONENT] Error fetching Spotify images for tracks:', error);
    }
  }
  
  // Fetch album images for top albums if needed
  if (topAlbum.value && otherTopAlbums.value.length > 0) {
    console.log('[COMPONENT] Fetching Spotify images for top albums');
    try {
      // Assuming albums might not have a dedicated fetchSpotifyImages function
      // We'll create a simple approach here
      await fetchSpotifyImagesForAlbums([
        topAlbum.value,
        ...otherTopAlbums.value
      ]);
    } catch (error) {
      console.error('[COMPONENT] Error fetching Spotify images for albums:', error);
    }
  }

  // Fetch tags for top items
  await fetchTagsForTopItems();
});

// Fetch tags for top items
async function fetchTagsForTopItems() {
  console.log('[COMPONENT] Fetching tags for top items');
  
  // Fetch tags for top artist
  if (topArtist.value) {
    try {
      const artistName = topArtist.value.name;
      console.log(`[COMPONENT] Fetching tags for artist: "${artistName}"`);
      const tags = await lastfmService.getArtistTags(artistName);
      topArtistTags.value = tags.slice(0, 3); // Get top 3 tags
      console.log(`[COMPONENT] Got ${tags.length} tags for artist "${artistName}":`, tags);
    } catch (error) {
      console.error('[COMPONENT] Error fetching artist tags:', error);
    }
  }
  
  // Fetch tags for top album
  if (topAlbum.value && topAlbum.value.artist?.name) {
    try {
      const albumName = topAlbum.value.name;
      const artistName = topAlbum.value.artist.name;
      console.log(`[COMPONENT] Fetching tags for album: "${albumName}" by "${artistName}"`);
      const tags = await lastfmService.getAlbumTags(artistName, albumName);
      topAlbumTags.value = tags.slice(0, 3); // Get top 3 tags
      console.log(`[COMPONENT] Got ${tags.length} tags for album "${albumName}":`, tags);
    } catch (error) {
      console.error('[COMPONENT] Error fetching album tags:', error);
    }
  }
  
  // Fetch tags for top track
  if (topTrack.value && topTrack.value.artist?.name) {
    try {
      const trackName = topTrack.value.name;
      const artistName = topTrack.value.artist.name;
      console.log(`[COMPONENT] Fetching tags for track: "${trackName}" by "${artistName}"`);
      const tags = await lastfmService.getTrackTags(artistName, trackName);
      topTrackTags.value = tags.slice(0, 3); // Get top 3 tags
      console.log(`[COMPONENT] Got ${tags.length} tags for track "${trackName}":`, tags);
    } catch (error) {
      console.error('[COMPONENT] Error fetching track tags:', error);
    }
  }
}

// Completely redesigned share functionality using canvas-based approach
async function shareSection(section) {
  console.log(`[COMPONENT] Sharing ${section} section`);
  
  try {
    // Create a new canvas-based chart instead of using DOM elements
    const canvasWidth = 1080;
    const canvasHeight = 1920;
    
    // Create a new canvas element
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#131313';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Set up data based on section
    let title = '';
    let mainItem = null;
    let itemList = [];
    let bgColor = '#131313';
    let accentColor = '#FF7597';
    let tags = [];
    
    if (section === 'artists') {
      title = 'TOP ARTISTS';
      mainItem = topArtist.value;
      itemList = otherTopArtists.value;
      accentColor = '#FF7597';
      tags = topArtistTags.value;
    } else if (section === 'albums') {
      title = 'TOP ALBUMS';
      mainItem = topAlbum.value;
      itemList = otherTopAlbums.value;
      accentColor = '#4DD4AC';
      tags = topAlbumTags.value;
    } else if (section === 'tracks') {
      title = 'TOP TRACKS';
      mainItem = topTrack.value;
      itemList = otherTopTracks.value;
      accentColor = '#64B5F6';
      tags = topTrackTags.value;
    }
    
    // Load and prepare fonts
    const fontFaceSet = document.fonts;
    await fontFaceSet.ready;
    
    // Draw header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvasWidth / 2, 160);
    
    // Draw username
    ctx.fillStyle = accentColor;
    ctx.font = '50px sans-serif';
    ctx.fillText(username.value, canvasWidth / 2, 240);
    
    // Draw time range
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '36px sans-serif';
    ctx.fillText(timeRange.value, canvasWidth / 2, 300);
    
    // Draw divider line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(canvasWidth / 2 - 60, 340, 120, 2);
    
    // Draw main item
    if (mainItem) {
      // Draw #1 rank
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('#1', canvasWidth / 2, 420);
      
      // Draw main item image
      let imageUrl = '';
      if (section === 'artists') {
        imageUrl = getArtistImage(mainItem);
      } else if (section === 'albums') {
        imageUrl = getAlbumImage(mainItem);
      } else {
        imageUrl = getTrackImage(mainItem);
      }
      
      // Preload image
      if (imageUrl) {
        const img = await loadImage(imageUrl);
        const imgSize = 440;
        const imgX = (canvasWidth - imgSize) / 2;
        const imgY = 450;
        
        // Draw image with rounded corners
        roundedImage(ctx, imgX, imgY, imgSize, imgSize, 24);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
        
        // Draw item name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 56px sans-serif';
        ctx.textAlign = 'center';
        const name = mainItem.name || '';
        const truncatedName = truncateText(ctx, name, canvasWidth - 120);
        ctx.fillText(truncatedName, canvasWidth / 2, 950);
        
        // Draw artist name for albums and tracks
        if (section !== 'artists' && mainItem.artist) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '42px sans-serif';
          const artistName = mainItem.artist.name || 'Unknown Artist';
          const truncatedArtistName = truncateText(ctx, artistName, canvasWidth - 150);
          ctx.fillText(truncatedArtistName, canvasWidth / 2, 1010);
        }
        
        // Draw playcount
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '40px sans-serif';
        const playcount = formatPlaycount(mainItem.playcount) + ' scrobbles';
        ctx.fillText(playcount, canvasWidth / 2, 1070);
        
        // Draw tags if available
        if (tags && tags.length > 0) {
          // Draw 'Tags:' label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Tags:', canvasWidth / 2, 1120);
          
          // Draw tags in a row
          ctx.font = 'bold 28px sans-serif';
          
          const tagSpacing = 20;
          const tagMetrics = tags.map(tag => ctx.measureText(tag.name));
          const totalTagWidth = tagMetrics.reduce((sum, metric, i) => 
            sum + metric.width + (i < tagMetrics.length - 1 ? tagSpacing : 0), 0);
          
          let tagX = (canvasWidth - totalTagWidth) / 2;
          
          tags.forEach((tag, index) => {
            ctx.fillStyle = accentColor;
            
            // Draw tag text
            ctx.textAlign = 'left';
            ctx.fillText(tag.name, tagX, 1160);
            
            // Move to next tag position
            tagX += tagMetrics[index].width + (index < tags.length - 1 ? tagSpacing : 0);
            
            // Add a dot between tags (except after the last tag)
            if (index < tags.length - 1) {
              ctx.fillStyle = 'white';
              ctx.fillText('·', tagX - 15, 1160);
            }
          });
        }
      }
    }
    
    // Adjust starting point for list items based on whether we have tags
    const listStartY = tags && tags.length > 0 ? 1200 : 1140;
    
    // Draw list items
    const itemHeight = 120;
    const itemWidth = canvasWidth - 120;
    const itemX = 60;
    
    for (let i = 0; i < itemList.length; i++) {
      const item = itemList[i];
      const itemY = listStartY + (i * (itemHeight + 20));
      
      // Draw item background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      roundedRect(ctx, itemX, itemY, itemWidth, itemHeight, 12);
      
      // Draw rank
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${i + 2}`, itemX + 24, itemY + 70);
      
      // Draw item name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 38px sans-serif';
      const name = item.name || '';
      const truncatedName = truncateText(ctx, name, itemWidth - 100);
      ctx.fillText(truncatedName, itemX + 90, itemY + 52);
      
      // Draw artist name for albums and tracks
      if (section !== 'artists' && item.artist) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '32px sans-serif';
        const artistName = item.artist.name || 'Unknown Artist';
        const playcount = formatPlaycount(item.playcount);
        const text = `${artistName} • ${playcount}`;
        const truncatedText = truncateText(ctx, text, itemWidth - 120);
        ctx.fillText(truncatedText, itemX + 90, itemY + 92);
      } else {
        // Draw playcount for artists
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '32px sans-serif';
        const playcount = formatPlaycount(item.playcount) + ' scrobbles';
        ctx.fillText(playcount, itemX + 90, itemY + 92);
      }
    }
    
    // Draw footer
    const footerY = canvasHeight - 120;
    
    // Draw divider
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(canvasWidth / 2 - 150, footerY, 300, 1);
    
    // Draw site name
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Last Songs', canvasWidth / 2, footerY + 50);
    
    // Draw site URL
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '32px sans-serif';
    ctx.fillText('lastsongs.netlify.app', canvasWidth / 2, footerY + 90);
    
    // Convert canvas to image and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `${username.value}-top-${section}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    console.log(`[COMPONENT] Successfully shared ${section}`);
  } catch (error) {
    console.error(`[COMPONENT] Error sharing ${section}:`, error);
  }
}

// Helper function to load an image and return a Promise
function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      // Create a placeholder colored rectangle instead
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#666666';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No Image', 150, 150);
      
      const img = new Image();
      img.src = canvas.toDataURL();
      img.onload = () => resolve(img);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS
    
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.log(`[COMPONENT] Failed to load image: ${url}, creating placeholder`);
      // Create a placeholder image
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#666666';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No Image', 150, 150);
      
      const placeholderImg = new Image();
      placeholderImg.src = canvas.toDataURL();
      placeholderImg.onload = () => resolve(placeholderImg);
    };
    
    // Handle potential CORS issues by trying with a proxy if available
    try {
      img.src = url;
    } catch (e) {
      console.error(`[COMPONENT] Error setting image src: ${e}`);
      img.onerror();
    }
  });
}

// Helper function to draw rounded rectangle
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// Helper function to create rounded image
function roundedImage(ctx, x, y, width, height, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper function to truncate text that's too long
function truncateText(ctx, text, maxWidth) {
  if (!text) return '';
  
  // Check if the text fits
  const metrics = ctx.measureText(text);
  if (metrics.width <= maxWidth) {
    return text;
  }
  
  // Truncate text with ellipsis
  let truncated = text;
  let width = metrics.width;
  
  while (width > maxWidth && truncated.length > 3) {
    truncated = truncated.slice(0, -1);
    width = ctx.measureText(truncated + '...').width;
  }
  
  return truncated + '...';
}

// Helper function to preload images with improved error handling
async function preloadImages(template) {
  const images = template.querySelectorAll('img');
  const imagePromises = Array.from(images).map(img => {
    return new Promise((resolve) => {
      if (!img.src || img.complete) {
        // For already loaded images or no src
        if (img.naturalHeight === 0) {
          // Image loaded but has error
          img.src = "https://via.placeholder.com/300?text=No+Image";
        }
        resolve();
        return;
      }
      
      img.onload = () => resolve();
      img.onerror = () => {
        console.log(`[COMPONENT] Image failed to load: ${img.src}`);
        img.src = "https://via.placeholder.com/300?text=No+Image";
        resolve();
      };
    });
  });
  
  await Promise.all(imagePromises);
}

// Function to fetch Spotify images for albums
async function fetchSpotifyImagesForAlbums(albums) {
  if (!albums || albums.length === 0) return;
  
  console.log(`[COMPONENT] Fetching Spotify images for ${albums.length} albums`);
  
  // Process each album to get its Spotify image
  for (const album of albums) {
    try {
      if (album.artist?.name && album.name) {
        // Use the Spotify API through lastfmService to get track images
        // This assumes you have a method similar to getSpotifyTrackImage for albums
        // If not, you might need to use the track image as a fallback
        const artistName = album.artist.name;
        const albumName = album.name;
        
        console.log(`[COMPONENT] Fetching Spotify image for album: "${albumName}" by "${artistName}"`);
        
        try {
          // Try to get album image from Spotify
          const albumInfo = await lastfmService.getAlbumInfo(artistName, albumName);
          if (albumInfo && albumInfo.album && albumInfo.album.image) {
            // Use the largest image available
            const images = albumInfo.album.image;
            const largestImage = images.reduce((largest, current) => {
              return (current.size === 'extralarge' || current.size === 'mega') ? current : largest;
            }, images[0]);
            
            // Update the album object with the image URL
            if (largestImage && largestImage['#text']) {
              album.spotifyImage = largestImage['#text'];
              console.log(`[COMPONENT] Found image for "${albumName}": ${album.spotifyImage}`);
            }
          }
        } catch (albumError) {
          console.error(`[COMPONENT] Error fetching album image for "${albumName}":`, albumError);
          
          // Fallback to trying track image if album image fails
          try {
            console.log(`[COMPONENT] Trying to get track image as fallback for "${albumName}"`);
            // Get a track image from the album's first track
            const trackImage = await lastfmService.getSpotifyTrackImage(artistName, albumName);
            if (trackImage) {
              album.spotifyImage = trackImage;
              console.log(`[COMPONENT] Found fallback track image for "${albumName}": ${album.spotifyImage}`);
            }
          } catch (trackError) {
            console.error(`[COMPONENT] Fallback track image also failed for "${albumName}":`, trackError);
          }
        }
      }
    } catch (error) {
      console.error(`[COMPONENT] Error processing album "${album.name}":`, error);
    }
  }
}

// Format trend percentages
function formatTrend(value) {
  return Number(value).toFixed(1);
}

// Format playcounts with K/M suffix for readability
function formatPlaycount(count) {
  if (!count) return '0';
  
  count = Number(count);
  
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  } else {
    return count.toString();
  }
}

// Get artist image with fallback
function getArtistImage(artist) {
  // Check for Spotify image first
  if (artist.spotifyImage) {
    return artist.spotifyImage;
  }
  
  // Then check for Last.fm images
  if (artist.image && Array.isArray(artist.image)) {
    // Find the largest image available
    const extralarge = artist.image.find(img => img.size === 'extralarge');
    const large = artist.image.find(img => img.size === 'large');
    const medium = artist.image.find(img => img.size === 'medium');
    
    if (extralarge && extralarge['#text']) return extralarge['#text'];
    if (large && large['#text']) return large['#text'];
    if (medium && medium['#text']) return medium['#text'];
    
    // If we have any image with content, use it
    const anyImage = artist.image.find(img => img['#text']);
    if (anyImage) return anyImage['#text'];
  }
  
  // Fallback to a placeholder
  return 'https://via.placeholder.com/300?text=No+Artist+Image';
}

// Get album image with fallback
function getAlbumImage(album) {
  // Check for Spotify image first
  if (album.spotifyImage) {
    return album.spotifyImage;
  }
  
  // Then check for Last.fm images
  if (album.image && Array.isArray(album.image)) {
    // Find the largest image available
    const extralarge = album.image.find(img => img.size === 'extralarge');
    const large = album.image.find(img => img.size === 'large');
    const medium = album.image.find(img => img.size === 'medium');
    
    if (extralarge && extralarge['#text']) return extralarge['#text'];
    if (large && large['#text']) return large['#text'];
    if (medium && medium['#text']) return medium['#text'];
    
    // If we have any image with content, use it
    const anyImage = album.image.find(img => img['#text']);
    if (anyImage) return anyImage['#text'];
  }
  
  // Fallback to a placeholder
  return 'https://via.placeholder.com/300?text=No+Album+Image';
}

// Get track image with fallback
function getTrackImage(track) {
  // Check for Spotify image first
  if (track.spotifyImage) {
    return track.spotifyImage;
  }
  
  // Then check for Last.fm images
  if (track.image && Array.isArray(track.image)) {
    // Find the largest image available
    const extralarge = track.image.find(img => img.size === 'extralarge');
    const large = track.image.find(img => img.size === 'large');
    const medium = track.image.find(img => img.size === 'medium');
    
    if (extralarge && extralarge['#text']) return extralarge['#text'];
    if (large && large['#text']) return large['#text'];
    if (medium && medium['#text']) return medium['#text'];
    
    // If we have any image with content, use it
    const anyImage = track.image.find(img => img['#text']);
    if (anyImage) return anyImage['#text'];
  }
  
  // Fallback to a placeholder
  return 'https://via.placeholder.com/300?text=No+Track+Image';
}

// Show artist details
function showArtistDetails(artistName) {
  if (!artistName) return;
  emit('show-artist-details', artistName);
}

// Show album details
function showAlbumDetails(albumName, artistName) {
  if (!albumName || !artistName) return;
  emit('show-album-details', { albumName, artistName });
}

// Show track details
function showTrackDetails(trackName, artistName) {
  if (!trackName || !artistName) return;
  emit('show-track-details', { trackName, artistName });
}
</script>

<style scoped>
/* Add your styles here */
</style>

<script>
export default {
  name: 'TopMusicCharts'
};
</script>
