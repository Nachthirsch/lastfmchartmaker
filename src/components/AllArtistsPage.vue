<template>
  <div class="artists-page">
    <div class="page-header">
      <div class="header-title">
        <h2 class="title">TOP ARTISTS</h2>
        <div class="title-underline"></div>
      </div>
      <div class="header-actions">
        <div class="collage-dropdown">
          <button @click="showCollageOptions = !showCollageOptions" class="collage-button">
            <span class="button-text">Create Collage</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
            </svg>
          </button>

          <!-- Collage Options Dropdown -->
          <div v-if="showCollageOptions" class="dropdown-menu">
            <div class="dropdown-content">
              <p class="dropdown-label">Collage Size</p>
              <div class="size-options">
                <button v-for="size in collageSizes" :key="size.value" @click="createArtistCollage(size.value)" class="size-button" :class="{ active: size.value === selectedCollageSize }">
                  {{ size.label }}
                </button>
              </div>

              <p class="dropdown-label">Theme</p>
              <div class="theme-options">
                <button @click="collageTheme = 'dark'" class="theme-button" :class="{ active: collageTheme === 'dark' }">Dark</button>
                <button @click="collageTheme = 'light'" class="theme-button" :class="{ active: collageTheme === 'light' }">Light</button>
              </div>

              <div class="option-checkbox">
                <input type="checkbox" id="showArtistNames" v-model="showArtistNames" class="checkbox" />
                <label for="showArtistNames" class="checkbox-label">Show Artist Names</label>
              </div>

              <p class="option-info">Shows top {{ collageArtistCount }} artists</p>

              <button @click="createArtistCollage()" class="create-button">Create Collage</button>
            </div>
          </div>
        </div>
        <button @click="$emit('close')" class="close-button">
          <svg xmlns="http://www.w3.org/2000/svg" class="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="page-info">
      <div class="info-text">{{ username }}'s top artists • {{ timeRange }}</div>
      <div class="info-count">Total: {{ artistsCount }} artists</div>
    </div>

    <!-- Artists Grid -->
    <div class="artists-grid">
      <div v-for="(artist, index) in topArtists" :key="artist.mbid || index" @click="showArtistDetails(artist.name)" class="artist-card">
        <div class="artist-image-container">
          <img :src="getArtistImage(artist)" :alt="artist.name" class="artist-image" loading="lazy" />
          <div class="artist-rank">#{{ index + 1 }}</div>
        </div>
        <div class="artist-details">
          <h3 class="artist-title">{{ artist.name }}</h3>
          <p class="artist-plays">{{ formatPlaycount(artist.playcount) }} plays</p>
        </div>
      </div>
    </div>

    <!-- Mobile Artists List -->
    <div class="mobile-artists-list">
      <div v-for="(artist, index) in topArtists" :key="artist.mbid || index" @click="showArtistDetails(artist.name)" class="mobile-artist-item">
        <div class="mobile-artist-rank">#{{ index + 1 }}</div>
        <div class="mobile-artist-image">
          <img :src="getArtistImage(artist)" :alt="artist.name" loading="lazy" />
        </div>
        <div class="mobile-artist-info">
          <div class="mobile-artist-title">{{ artist.name }}</div>
          <div class="mobile-artist-plays">{{ formatPlaycount(artist.playcount) }} plays</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <button @click="$emit('close')" class="back-button">Back to Overview</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useArtistsStore } from "../stores/artists";
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
const emit = defineEmits(["close", "show-artist-details"]);

// Initialize stores
const artistsStore = useArtistsStore();
const userStore = useUserStore();

// Collage options
const showCollageOptions = ref(false);
const selectedCollageSize = ref("3x3");
const collageTheme = ref("dark");
const showArtistNames = ref(true);

const collageSizes = [
  { value: "3x3", label: "3×3", gridSize: 3, itemCount: 9 },
  { value: "4x4", label: "4×4", gridSize: 4, itemCount: 16 },
  { value: "5x5", label: "5×5", gridSize: 5, itemCount: 25 },
];

// Tags for top artist
const topArtistTags = ref([]);

const collageArtistCount = computed(() => {
  const selected = collageSizes.find((size) => size.value === selectedCollageSize.value);
  return selected ? selected.itemCount : 9;
});

// Computed properties
const artistsCount = computed(() => artistsStore.topArtists.length);

const topArtists = computed(() => {
  return artistsStore.sortedByPlaycount.slice(0, 50);
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

function getArtistImage(artist) {
  // Get artist image from the store
  return artistsStore.getArtistLargeImage(artist.name);
}

function showArtistDetails(artistName) {
  emit("show-artist-details", artistName);
}

// Artist Collage Creation
async function createArtistCollage(size) {
  // Close the dropdown
  showCollageOptions.value = false;

  // Update selected size if provided
  if (size) {
    selectedCollageSize.value = size;
  }

  // Get the grid configuration from the selected size
  const sizeConfig = collageSizes.find((s) => s.value === selectedCollageSize.value) || collageSizes[0];

  // Try to fetch tags for the top artist
  if (topArtists.value.length > 0) {
    const topArtist = topArtists.value[0];
    try {
      console.log(`[COMPONENT] Fetching tags for artist: "${topArtist.name}"`);
      const tags = await lastfmService.getArtistTags(topArtist.name);
      topArtistTags.value = tags.slice(0, 3); // Get top 3 tags
    } catch (error) {
      console.error(`[COMPONENT] Error fetching tags for artist:`, error);
    }
  }

  // Use the shared collage generator utility
  try {
    const result = await generateCollage({
      items: topArtists.value,
      getImageUrl: getArtistImage,
      title: "TOP ARTISTS COLLAGE",
      username: username.value,
      timeRange: timeRange.value,
      collageSize: selectedCollageSize.value,
      theme: collageTheme.value,
      showNames: showArtistNames.value,
      accentColor: "#d8b4fe", // Purple color for artists
      sizeConfig: sizeConfig,
      period: props.period,
      type: "artists",
      tags: topArtistTags.value, // Pass tags to the collage generator
    });

    if (!result.success) {
      console.error("[COMPONENT] Collage generation failed:", result.error);
    }
  } catch (error) {
    console.error("[COMPONENT] Error creating artist collage:", error);
  }
}
</script>

<style scoped>
.artists-page {
  background-color: #fff;
  color: #000;
  border: 4px solid #000;
  box-shadow: 8px 8px 0px #000;
  padding: 1.5rem;
  position: relative;
  max-width: 100%;
  overflow-x: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.header-title {
  position: relative;
}

.title {
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0 0 0.5rem 0;
  transform: rotate(-1deg);
  position: relative;
  display: inline-block;
}

.title-underline {
  width: 100px;
  height: 6px;
  background-color: #9b5de5;
  margin-top: 0.5rem;
  transform: rotate(1deg);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.collage-dropdown {
  position: relative;
}

.collage-button {
  background-color: #9b5de5;
  color: black;
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;
  padding: 0.5rem 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.collage-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.close-button {
  background-color: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.close-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.close-icon {
  width: 24px;
  height: 24px;
  stroke: #000;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  width: 250px;
  background-color: white;
  border: 3px solid #000;
  box-shadow: 6px 6px 0px #000;
  z-index: 10;
}

.dropdown-content {
  padding: 1rem;
}

.dropdown-label {
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.size-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.size-button,
.theme-button {
  background-color: #f0f0f0;
  border: 2px solid #000;
  padding: 0.4rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.size-button:hover,
.theme-button:hover {
  background-color: #e0e0e0;
}

.size-button.active,
.theme-button.active {
  background-color: #9b5de5;
  color: black;
}

.theme-options {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.option-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.checkbox {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.5rem;
  accent-color: #9b5de5;
}

.checkbox-label {
  font-weight: 600;
  font-size: 0.9rem;
}

.option-info {
  font-size: 0.8rem;
  color: #666;
  margin: 0.5rem 0;
}

.create-button {
  background-color: #9b5de5;
  color: black;
  border: 2px solid #000;
  box-shadow: 3px 3px 0px #000;
  padding: 0.5rem;
  width: 100%;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.create-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px #000;
}

.page-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
  padding: 0 0.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.artist-card {
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;
  overflow: hidden;
  background-color: white;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.artist-card:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.artist-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  overflow: hidden;
}

.artist-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-weight: 800;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.artist-details {
  padding: 1rem;
}

.artist-title {
  font-weight: 800;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-plays {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.75rem;
}

.mobile-artists-list {
  display: none;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.mobile-artist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 2px solid #000;
  box-shadow: 3px 3px 0px #000;
  cursor: pointer;
  background-color: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mobile-artist-item:hover {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px #000;
}

.mobile-artist-rank {
  font-weight: 800;
  font-size: 1.2rem;
  color: #9b5de5;
  min-width: 40px;
}

.mobile-artist-image {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border: 1px solid #000;
  flex-shrink: 0;
}

.mobile-artist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-artist-info {
  flex: 1;
  min-width: 0;
}

.mobile-artist-title {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-artist-plays {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.back-button {
  background-color: #9b5de5;
  color: black;
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;
  padding: 0.75rem 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.back-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

/* Improved media queries for better responsiveness */

/* Large tablets and small desktops */
@media (max-width: 1024px) {
  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
  }
  
  .artist-details {
    padding: 0.85rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
}

/* Medium-sized tablets */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    align-self: flex-end;
  }

  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
  
  .artist-title {
    font-size: 0.95rem;
  }
  
  .artist-plays {
    font-size: 0.85rem;
  }
  
  .dropdown-menu {
    width: 220px; 
    right: -10px;
  }
  
  .button-text {
    font-size: 0.9rem;
  }
}

/* Smaller tablets and large phones */
@media (max-width: 640px) {
  .artists-page {
    padding: 1.2rem;
    border-width: 3px;
    box-shadow: 6px 6px 0px #000;
  }
  
  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.85rem;
  }
  
  .artist-card {
    border-width: 2px;
    box-shadow: 3px 3px 0px #000;
  }
  
  .artist-details {
    padding: 0.75rem;
  }
  
  .title {
    font-size: 1.6rem;
  }
  
  .back-button {
    width: 100%;
    justify-content: center;
    text-align: center;
    display: flex;
  }
  
  .page-footer {
    justify-content: center;
  }
}

/* Small phones */
@media (max-width: 576px) {
  .artists-page {
    padding: 1rem;
    border-width: 3px;
    box-shadow: 5px 5px 0px #000;
  }

  .page-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .artists-grid {
    display: none;
  }

  .mobile-artists-list {
    display: flex;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .title-underline {
    width: 80px;
    height: 5px;
  }
  
  .collage-button {
    padding: 0.4rem 0.8rem;
    border-width: 2px;
    box-shadow: 3px 3px 0px #000;
  }
  
  .close-button {
    width: 36px;
    height: 36px;
    border-width: 2px;
    box-shadow: 3px 3px 0px #000;
  }
  
  .close-icon {
    width: 20px;
    height: 20px;
  }
  
  .back-button {
    padding: 0.6rem 1rem;
    border-width: 2px;
    box-shadow: 3px 3px 0px #000;
    font-size: 0.9rem;
  }
}

/* Extra small phones */
@media (max-width: 400px) {
  .mobile-artist-item {
    padding: 0.6rem;
  }
  
  .mobile-artist-rank {
    font-size: 1rem;
    min-width: 30px;
  }
  
  .mobile-artist-image {
    width: 40px;
    height: 40px;
  }
  
  .dropdown-menu {
    width: 200px;
    right: -15px;
  }
  
  .dropdown-content {
    padding: 0.75rem;
  }
  
  .title {
    font-size: 1.3rem;
  }
  
  .button-text {
    font-size: 0.8rem;
  }
  
  .header-actions {
    gap: 0.5rem;
  }
}
</style>
