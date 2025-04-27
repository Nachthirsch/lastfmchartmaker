<!-- A component that displays all top tracks (50) with their play counts -->
<template>
  <div class="bg-yellow-50 text-black p-4 sm:p-6 md:p-8 rounded-lg shadow-neobrutalism max-w-full">
    <div class="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black uppercase mb-1 transform -rotate-1">TOP TRACKS</h2>
        <div class="w-24 sm:w-32 h-2 bg-blue-500 transform rotate-1"></div>
      </div>
      <div class="flex gap-2 sm:gap-3 self-end sm:self-auto">
        <div class="relative">
          <button @click="showCollageOptions = !showCollageOptions" class="bg-pink-500 hover:bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-bold flex items-center transition transform hover:-translate-y-1 border-2 border-black shadow-neobrutalism-sm">
            <span class="mr-1">Create Collage</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="hidden xs:inline">
              <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
            </svg>
          </button>

          <!-- Collage Options Dropdown -->
          <div v-if="showCollageOptions" class="absolute right-0 mt-2 w-48 xs:w-56 bg-blue-100 rounded-md border-2 border-black shadow-neobrutalism-sm z-10 transform rotate-1">
            <div class="p-3 sm:p-4">
              <p class="text-xs sm:text-sm text-black font-black mb-2 uppercase">Collage Size</p>
              <div class="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
                <button v-for="size in collageSizes" :key="size.value" @click="createTrackCollage(size.value)" class="text-xs py-1 sm:py-1.5 px-1 sm:px-2 rounded border-2 border-black font-bold transition" :class="[size.value === selectedCollageSize ? 'bg-green-400 text-black transform -rotate-1' : 'bg-white text-black hover:bg-gray-100 transform hover:-translate-y-0.5']">
                  {{ size.label }}
                </button>
              </div>

              <p class="text-xs sm:text-sm text-black font-black mb-2 uppercase">Theme</p>
              <div class="flex gap-1 sm:gap-2 mb-3 sm:mb-4">
                <button @click="collageTheme = 'dark'" class="flex-1 text-xs py-1 sm:py-1.5 px-1 sm:px-2 rounded border-2 border-black font-bold transition" :class="[collageTheme === 'dark' ? 'bg-black text-white transform -rotate-1' : 'bg-white text-black hover:bg-gray-100 transform hover:-translate-y-0.5']">Dark</button>
                <button @click="collageTheme = 'light'" class="flex-1 text-xs py-1 sm:py-1.5 px-1 sm:px-2 rounded border-2 border-black font-bold transition" :class="[collageTheme === 'light' ? 'bg-yellow-300 text-black transform rotate-1' : 'bg-white text-black hover:bg-gray-100 transform hover:-translate-y-0.5']">Light</button>
              </div>

              <div class="flex items-center mb-3 sm:mb-4">
                <input type="checkbox" id="showTrackNames" v-model="showTrackNames" class="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white border-2 border-black focus:ring-blue-500" />
                <label for="showTrackNames" class="ml-2 text-xs text-black font-bold">Show Track Names</label>
              </div>

              <p class="text-xs text-gray-700 mt-2 italic">Shows top {{ collageTrackCount }} tracks</p>

              <button @click="createTrackCollage()" class="w-full mt-2 sm:mt-3 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded border-2 border-black font-bold transition transform hover:-translate-y-1 shadow-neobrutalism-sm">Create Collage</button>
            </div>
          </div>
        </div>
        <button @click="$emit('close')" class="bg-red-400 hover:bg-red-500 text-white rounded-full p-2 sm:p-3 border-2 border-black transition transform hover:rotate-12 shadow-neobrutalism-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="mb-4 sm:mb-5 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0 bg-blue-100 p-2 sm:p-3 rounded-md border-2 border-black transform -rotate-0.5 shadow-neobrutalism-sm">
      <div class="text-xs sm:text-sm font-bold">{{ username }}'s top tracks • {{ timeRange }}</div>
      <div class="text-xs sm:text-sm font-bold bg-orange-300 px-2 sm:px-3 py-1 rounded-md border-2 border-black transform rotate-1">Total: {{ tracksCount }} tracks</div>
    </div>

    <!-- Desktop/Tablet Tracks Table (Hidden on mobile) -->
    <div class="hidden sm:block overflow-hidden bg-white rounded-lg border-2 border-black shadow-neobrutalism">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y-2 divide-black">
          <thead class="bg-blue-400">
            <tr>
              <th scope="col" class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-black text-black uppercase tracking-wider">Rank</th>
              <th scope="col" class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-black text-black uppercase tracking-wider">Track</th>
              <th scope="col" class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-black text-black uppercase tracking-wider">Plays</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-300">
            <tr v-for="(track, index) in topTracks" :key="track.mbid || index" @click="showTrackDetails(track.name, track.artist.name)" class="cursor-pointer hover:bg-yellow-100 transition-colors duration-200">
              <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-black text-black">#{{ index + 1 }}</td>
              <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-black">
                <div class="flex items-center gap-2 sm:gap-3">
                  <img :src="getTrackImage(track)" :alt="track.name" class="w-10 h-10 sm:w-12 sm:h-12 object-cover bg-gray-200 border-2 border-black transform -rotate-1 shadow-neobrutalism-sm" />
                  <div>
                    <div class="text-black font-bold text-xs sm:text-sm">{{ track.name }}</div>
                    <div class="text-xxs xs:text-xs text-gray-700">{{ track.artist.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-black">
                {{ formatPlaycount(track.playcount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Tracks List (Only visible on small screens) -->
    <div class="sm:hidden">
      <div class="space-y-3">
        <div v-for="(track, index) in topTracks" :key="track.mbid || index" @click="showTrackDetails(track.name, track.artist.name)" 
             class="bg-white border-2 border-black shadow-neobrutalism-sm p-3 rounded-md flex gap-3 items-center cursor-pointer hover:bg-yellow-50 transition-all">
          <div class="font-black text-lg text-blue-500 min-w-[30px]">#{{ index + 1 }}</div>
          <img :src="getTrackImage(track)" :alt="track.name" class="w-12 h-12 object-cover bg-gray-200 border-2 border-black transform -rotate-1 shadow-neobrutalism-sm" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold truncate">{{ track.name }}</div>
            <div class="text-xs text-gray-700 truncate">{{ track.artist.name }}</div>
            <div class="text-xs font-semibold text-gray-500">{{ formatPlaycount(track.playcount) }} plays</div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 sm:mt-8 flex justify-end">
      <button @click="$emit('close')" class="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md text-base sm:text-lg font-black transition transform hover:-translate-y-1 border-2 border-black shadow-neobrutalism-sm">Back to Overview</button>
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
    default: "",
  },
  period: {
    type: String,
    default: "overall",
  },
});

// Define emits
const emit = defineEmits(["close", "show-track-details"]);

// Initialize stores
const tracksStore = useTracksStore();
const userStore = useUserStore();

// Collage options
const showCollageOptions = ref(false);
const selectedCollageSize = ref("3x3");
const collageTheme = ref("dark");
const showTrackNames = ref(true);
const collageSizes = [
  { value: "3x3", label: "3×3", gridSize: 3, itemCount: 9 },
  { value: "4x4", label: "4×4", gridSize: 4, itemCount: 16 },
  { value: "5x5", label: "5×5", gridSize: 5, itemCount: 25 },
];

// Tags for top track
const topTrackTags = ref([]);

const collageTrackCount = computed(() => {
  const selected = collageSizes.find((size) => size.value === selectedCollageSize.value);
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
  return userStore.username || "music_lover";
});

const timeRange = computed(() => {
  // Map period to readable text
  const periodValue = props.period || "overall";

  switch (periodValue) {
    case "7day":
      return "Last 7 days";
    case "1month":
      return "Last month";
    case "3month":
      return "Last 3 months";
    case "6month":
      return "Last 6 months";
    case "12month":
      return "Last year";
    case "overall":
      return "All time";
    default:
      return "All time";
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
  emit("show-track-details", trackName, artistName);
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
  const sizeConfig = collageSizes.find((s) => s.value === selectedCollageSize.value) || collageSizes[0];

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
    const tracksNeedingImages = tracksToUse.filter((track) => !track.spotifyImage);

    // If there are tracks without Spotify images, try to fetch them
    if (tracksNeedingImages.length > 0 && tracksStore.fetchSpotifyImagesForTracks) {
      console.log(`[COMPONENT] Fetching Spotify images for ${tracksNeedingImages.length} tracks`);
      await tracksStore.fetchSpotifyImagesForTracks(tracksNeedingImages);
    }

    const result = await generateCollage({
      items: topTracks.value,
      getImageUrl: getTrackImage,
      title: "TOP TRACKS COLLAGE",
      username: username.value,
      timeRange: timeRange.value,
      collageSize: selectedCollageSize.value,
      theme: collageTheme.value,
      showNames: showTrackNames.value,
      accentColor: "#60a5fa", // Blue color for tracks
      sizeConfig: sizeConfig,
      period: props.period,
      type: "tracks",
      tags: topTrackTags.value, // Pass tags to the collage generator
    });

    if (!result.success) {
      console.error("[COMPONENT] Collage generation failed:", result.error);
    }
  } catch (error) {
    console.error("[COMPONENT] Error creating track collage:", error);
  }
}
</script>

<style scoped>
.shadow-neobrutalism {
  box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 1);
}

.shadow-neobrutalism-sm {
  box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 1);
}

/* Add extra small text size for very small screens */
.text-xxs {
  font-size: 0.65rem;
  line-height: 1rem;
}

/* Add XS breakpoint for better responsiveness */
@media (min-width: 480px) {
  .xs\:flex-row {
    flex-direction: row;
  }
  
  .xs\:items-center {
    align-items: center;
  }
  
  .xs\:gap-0 {
    gap: 0;
  }
  
  .xs\:text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
  
  .xs\:w-56 {
    width: 14rem;
  }
  
  .xs\:inline {
    display: inline;
  }
}
</style>
