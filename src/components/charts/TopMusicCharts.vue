<!-- A component displaying top music charts in a modern card layout -->
<template>
  <div class="w-full p-5 bg-black text-white font-sans rounded-lg shadow-lg mb-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold uppercase mb-1">TOP MUSIC</h2>
      <div class="w-24 h-0.5 bg-white"></div>
    </div>

    <!-- Stats Cards Grid -->
    <StatsCards 
      :artists-count="artistsCount"
      :albums-count="albumsCount" 
      :tracks-count="tracksCount"
      :artists-trend="artistsTrend"
      :albums-trend="albumsTrend"
      :tracks-trend="tracksTrend"
    />

    <!-- Top Items Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      <!-- Top Artist Section -->
      <TopArtistsSection 
        :top-artist="topArtist" 
        :other-artists="otherTopArtists"
        :tags="topArtistTags"
        @view-all="$emit('view-all-artists')"
        @share="shareSection('artists')"
        @show-details="showArtistDetails"
      />

      <!-- Top Album Section -->
      <TopAlbumsSection 
        :top-album="topAlbum" 
        :other-albums="otherTopAlbums"
        :tags="topAlbumTags"
        @view-all="$emit('view-all-albums')"
        @share="shareSection('albums')"
        @show-details="showAlbumDetails"
      />

      <!-- Top Track Section -->
      <TopTracksSection 
        :top-track="topTrack" 
        :other-tracks="otherTopTracks"
        :tags="topTrackTags"
        @view-all="$emit('view-all-tracks')"
        @share="shareSection('tracks')"
        @show-details="showTrackDetails"
      />
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
import { shareChart } from "../../utils/shareUtils";
import { getArtistImage, getAlbumImage, getTrackImage } from "../../utils/imageUtils";
import { fetchTagsForTopItems, fetchSpotifyImagesForAlbums } from "../../utils/apiUtils";

// Import components
import StatsCards from "./StatsCards.vue";
import TopArtistsSection from "./TopArtistsSection.vue";
import TopAlbumsSection from "./TopAlbumsSection.vue";
import TopTracksSection from "./TopTracksSection.vue";

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
      await fetchSpotifyImagesForAlbums([
        topAlbum.value,
        ...otherTopAlbums.value
      ]);
    } catch (error) {
      console.error('[COMPONENT] Error fetching Spotify images for albums:', error);
    }
  }

  // Fetch tags for top items
  await fetchTags();
});

// Fetch tags for top items
async function fetchTags() {
  try {
    const result = await fetchTagsForTopItems(topArtist.value, topAlbum.value, topTrack.value);
    topArtistTags.value = result.artistTags;
    topAlbumTags.value = result.albumTags;
    topTrackTags.value = result.trackTags;
  } catch (error) {
    console.error('[COMPONENT] Error fetching tags:', error);
  }
}

// Share a section (artists, albums, tracks)
async function shareSection(section) {
  console.log(`[COMPONENT] Sharing ${section} section`);
  
  try {
    let topItem = null;
    let itemList = [];
    let getItemImage = null;
    let tags = [];
    
    if (section === 'artists') {
      topItem = topArtist.value;
      itemList = otherTopArtists.value;
      getItemImage = getArtistImage;
      tags = topArtistTags.value;
    } else if (section === 'albums') {
      topItem = topAlbum.value;
      itemList = otherTopAlbums.value;
      getItemImage = getAlbumImage;
      tags = topAlbumTags.value;
    } else if (section === 'tracks') {
      topItem = topTrack.value;
      itemList = otherTopTracks.value;
      getItemImage = getTrackImage;
      tags = topTrackTags.value;
    }
    
    await shareChart(section, {
      username: username.value,
      timeRange: timeRange.value,
      topItem,
      itemList,
      getItemImage,
      tags
    });
    
    console.log(`[COMPONENT] Successfully shared ${section}`);
  } catch (error) {
    console.error(`[COMPONENT] Error sharing ${section}:`, error);
  }
}

// Show artist details
function showArtistDetails(artistName) {
  if (!artistName) return;
  emit('show-artist-details', artistName);
}

// Show album details
function showAlbumDetails({ albumName, artistName }) {
  if (!albumName || !artistName) return;
  emit('show-album-details', { albumName, artistName });
}

// Show track details
function showTrackDetails({ trackName, artistName }) {
  if (!trackName || !artistName) return;
  emit('show-track-details', { trackName, artistName });
}
</script>

<script>
export default {
  name: 'TopMusicCharts'
};
</script>
