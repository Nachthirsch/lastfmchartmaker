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
});

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
        
        // Try to get a representative track from the album to use its image
        // This assumes your Last.fm service has a method to search for album tracks
        // If not available, you could add this functionality to the lastfmService
        const trackImage = await lastfmService.getSpotifyTrackImage(albumName, artistName);
        
        if (trackImage) {
          console.log(`[COMPONENT] Setting Spotify image for album: "${albumName}"`);
          album.spotifyImage = trackImage;
        }
      }
    } catch (error) {
      console.error(`[COMPONENT] Error fetching Spotify image for album "${album.name}":`, error);
    }
  }
}

// Helper functions
function formatTrend(value) {
  return value.toFixed(0);
}

function formatPlaycount(playcount) {
  if (!playcount) return "0";
  return parseInt(playcount).toLocaleString();
}

function getArtistImage(artist) {
  if (!artist) {
    console.log('[COMPONENT] Artist is null or undefined');
    return "";
  }
  
  console.log(`[COMPONENT] Getting image for artist: "${artist.name}"`);
  // Use the enhanced getArtistLargeImage method that includes name correction
  const imageUrl = artistsStore.getArtistLargeImage(artist.name);
  console.log(`[COMPONENT] Image URL for artist "${artist.name}":`, imageUrl);
  return imageUrl;
}

function getAlbumImage(album) {
  if (!album) {
    console.log('[COMPONENT] Album is null or undefined');
    return "https://via.placeholder.com/300?text=No+Image";
  }
  
  // Check if the album has a Spotify image first
  if (album.spotifyImage) {
    console.log(`[COMPONENT] Using Spotify image for album: "${album.name}"`);
    return album.spotifyImage;
  }
  
  if (!album.image) {
    console.log(`[COMPONENT] No image data for album: "${album.name}"`);
    return "https://via.placeholder.com/300?text=No+Image";
  }
  
  console.log(`[COMPONENT] Getting Last.fm image for album: "${album.name}" with ${album.image.length} images`);
  const imageUrl = lastfmService.getLargeImage(album.image);
  console.log(`[COMPONENT] Image URL for album "${album.name}":`, imageUrl || 'No valid URL');
  return imageUrl || "https://via.placeholder.com/300?text=No+Image";
}

function getTrackImage(track) {
  if (!track) {
    console.log('[COMPONENT] Track is null or undefined');
    return "https://via.placeholder.com/300?text=No+Image";
  }
  
  // Check if the track has a Spotify image first
  if (track.spotifyImage) {
    console.log(`[COMPONENT] Using Spotify image for track: "${track.name}"`);
    return track.spotifyImage;
  }
  
  if (!track.image) {
    console.log(`[COMPONENT] No image data for track: "${track.name}"`);
    return "https://via.placeholder.com/300?text=No+Image";
  }
  
  console.log(`[COMPONENT] Getting Last.fm image for track: "${track.name}" with ${track.image.length} images`);
  const imageUrl = lastfmService.getLargeImage(track.image);
  console.log(`[COMPONENT] Image URL for track "${track.name}":`, imageUrl || 'No valid URL');
  return imageUrl || "https://via.placeholder.com/300?text=No+Image";
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