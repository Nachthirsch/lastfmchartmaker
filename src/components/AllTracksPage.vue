<!-- A component that displays all top tracks (50) with their play counts -->
<template>
  <div class="bg-black text-white p-5 rounded-lg shadow-lg">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold uppercase mb-1">TOP TRACKS</h2>
        <div class="w-24 h-0.5 bg-blue-400"></div>
      </div>
      <div class="flex gap-2">
        <div class="relative">
          <button 
            @click="showCollageOptions = !showCollageOptions"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center transition"
          >
            <span class="mr-1">Create Collage</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
            </svg>
          </button>
          
          <!-- Collage Options Dropdown -->
          <div 
            v-if="showCollageOptions" 
            class="absolute right-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-10"
          >
            <div class="p-3">
              <p class="text-xs text-white font-medium mb-2">Collage Size</p>
              <div class="grid grid-cols-3 gap-1 mb-3">
                <button 
                  v-for="size in collageSizes" 
                  :key="size.value"
                  @click="createTrackCollage(size.value)"
                  class="text-xs py-1 px-2 rounded"
                  :class="[
                    size.value === selectedCollageSize ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  ]"
                >
                  {{ size.label }}
                </button>
              </div>
              
              <p class="text-xs text-white font-medium mb-2">Theme</p>
              <div class="flex gap-1 mb-3">
                <button 
                  @click="collageTheme = 'dark'"
                  class="flex-1 text-xs py-1 px-2 rounded"
                  :class="[
                    collageTheme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  ]"
                >
                  Dark
                </button>
                <button 
                  @click="collageTheme = 'light'"
                  class="flex-1 text-xs py-1 px-2 rounded"
                  :class="[
                    collageTheme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  ]"
                >
                  Light
                </button>
              </div>
              
              <div class="flex items-center mb-3">
                <input 
                  type="checkbox" 
                  id="showTrackNames" 
                  v-model="showTrackNames" 
                  class="w-4 h-4 rounded bg-gray-700 border-gray-600 focus:ring-blue-600"
                >
                <label for="showTrackNames" class="ml-2 text-xs text-white font-medium">Show Track Names</label>
              </div>
              
              <p class="text-xs text-gray-400 mt-2">Shows top {{ collageTrackCount }} tracks</p>
              
              <button 
                @click="createTrackCollage()"
                class="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-2 rounded transition"
              >
                Create Collage
              </button>
            </div>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="mb-4 flex justify-between items-center">
      <div class="text-sm text-gray-400">
        {{ username }}'s top tracks • {{ timeRange }}
      </div>
      <div class="text-sm text-gray-400">
        Total: {{ tracksCount }} tracks
      </div>
    </div>

    <!-- Tracks Table -->
    <div class="overflow-hidden bg-gray-900 rounded-lg shadow-md">
      <table class="min-w-full divide-y divide-gray-800">
        <thead class="bg-gray-800">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Rank
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Track
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Plays
            </th>
          </tr>
        </thead>
        <tbody class="bg-gray-900 divide-y divide-gray-800">
          <tr 
            v-for="(track, index) in topTracks" 
            :key="track.mbid || index"
            @click="showTrackDetails(track.name, track.artist.name)"
            class="cursor-pointer hover:bg-gray-800 transition-colors duration-200"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
              #{{ index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              <div class="flex items-center gap-3">
                <img 
                  :src="getTrackImage(track)" 
                  :alt="track.name" 
                  class="w-10 h-10 object-cover bg-gray-800" 
                />
                <div>
                  <div class="text-white">{{ track.name }}</div>
                  <div class="text-xs text-gray-400">{{ track.artist.name }}</div>
                  
                  <!-- Track Tags (Fetch on demand) -->
                  <div class="mt-1">
                    <button 
                      @click.stop="fetchTrackTags(track)"
                      v-if="!track.tags || track.tags.length === 0"
                      class="text-xs text-blue-400 hover:underline"
                    >
                      View Tags
                    </button>
                    <div v-else class="flex flex-wrap gap-1 mt-1">
                      <span 
                        v-for="(tag, tagIndex) in track.tags" 
                        :key="tagIndex" 
                        class="text-xs px-2 py-0.5 bg-blue-600 bg-opacity-30 rounded-full text-blue-300"
                      >
                        {{ tag.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
              {{ formatPlaycount(track.playcount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 flex justify-end">
      <button
        @click="$emit('close')"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
      >
        Back to Overview
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useTracksStore } from "../stores/tracks";
import { useUserStore } from "../stores/user";
import { lastfmService } from "../services/lastfm.api";
import { generateCollage } from "../utils/collageGenerator";

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

// Define emits
const emit = defineEmits(['close', 'show-track-details']);

// Initialize stores
const tracksStore = useTracksStore();
const userStore = useUserStore();

// Collage options
const showCollageOptions = ref(false);
const selectedCollageSize = ref('3x3');
const collageTheme = ref('dark');
const showTrackNames = ref(true);
const collageSizes = [
  { value: '3x3', label: '3×3', gridSize: 3, itemCount: 9 },
  { value: '4x4', label: '4×4', gridSize: 4, itemCount: 16 },
  { value: '5x5', label: '5×5', gridSize: 5, itemCount: 25 }
];

// Tags for top track
const topTrackTags = ref([]);

const collageTrackCount = computed(() => {
  const selected = collageSizes.find(size => size.value === selectedCollageSize.value);
  return selected ? selected.itemCount : 9;
});

// Computed properties
const tracksCount = computed(() => tracksStore.topTracks.length);

const topTracks = computed(() => {
  return tracksStore.sortedByPlaycount.slice(0, 50);
});

const username = computed(() => {
  // First try to get from props, then fallback to store
  if (props.username) return props.username;
  return userStore.username || 'music_lover';
});

const timeRange = computed(() => {
  // Map period to readable text
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

// Methods
function formatPlaycount(playcount) {
  if (!playcount) return "0";
  return parseInt(playcount).toLocaleString();
}

function getTrackImage(track) {
  // First try to get Spotify image if available
  if (track.spotifyImage) {
    return track.spotifyImage;
  }
  
  // Fallback to Last.fm image
  return lastfmService.getLargeImage(track.image || []);
}

function showTrackDetails(trackName, artistName) {
  emit('show-track-details', trackName, artistName);
}

// Track Collage Creation
async function createTrackCollage(size) {
  // Close the dropdown
  showCollageOptions.value = false;
  
  // Update selected size if provided
  if (size) {
    selectedCollageSize.value = size;
  }
  
  // Get the grid configuration from the selected size
  const sizeConfig = collageSizes.find(s => s.value === selectedCollageSize.value) || collageSizes[0];
  
  // Try to fetch tags for the top track
  if (topTracks.value.length > 0) {
    const topTrack = topTracks.value[0];
    try {
      if (topTrack.artist?.name) {
        console.log(`[COMPONENT] Fetching tags for track: "${topTrack.name}" by "${topTrack.artist.name}"`);
        const tags = await lastfmService.getTrackTags(topTrack.artist.name, topTrack.name);
        topTrackTags.value = tags.slice(0, 3); // Get top 3 tags
      }
    } catch (error) {
      console.error(`[COMPONENT] Error fetching tags for track:`, error);
    }
  }
  
  // Use the shared collage generator utility
  try {
    // Prepare tracks for collage by ensuring they have Spotify images if possible
    const tracksToUse = topTracks.value.slice(0, sizeConfig.itemCount);
    const tracksNeedingImages = tracksToUse.filter(track => !track.spotifyImage);
    
    // If there are tracks without Spotify images, try to fetch them
    if (tracksNeedingImages.length > 0 && tracksStore.fetchSpotifyImagesForTracks) {
      console.log(`[COMPONENT] Fetching Spotify images for ${tracksNeedingImages.length} tracks`);
      await tracksStore.fetchSpotifyImagesForTracks(tracksNeedingImages);
    }
    
    const result = await generateCollage({
      items: topTracks.value,
      getImageUrl: getTrackImage,
      title: 'TOP TRACKS COLLAGE',
      username: username.value,
      timeRange: timeRange.value,
      collageSize: selectedCollageSize.value,
      theme: collageTheme.value,
      showNames: showTrackNames.value,
      accentColor: '#60a5fa', // Blue color for tracks
      sizeConfig: sizeConfig,
      period: props.period,
      type: 'tracks',
      tags: topTrackTags.value // Pass tags to the collage generator
    });
    
    if (!result.success) {
      console.error('[COMPONENT] Collage generation failed:', result.error);
    }
  } catch (error) {
    console.error('[COMPONENT] Error creating track collage:', error);
  }
}

// Fetch track tags
async function fetchTrackTags(track) {
  try {
    console.log(`[COMPONENT] Fetching tags for track: "${track.name}" by "${track.artist.name}"`);
    const tags = await lastfmService.getTrackTags(track.artist.name, track.name);
    track.tags = tags.slice(0, 3); // Store top 3 tags
  } catch (error) {
    console.error(`[COMPONENT] Error fetching tags for track:`, error);
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style> 