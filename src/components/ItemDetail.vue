<template>
  <div class="item-detail" :class="type">
    <div class="detail-header">
      <div class="detail-image-container">
        <img v-if="imageUrl" :src="imageUrl" :alt="name" class="detail-image" />
        <div v-else class="placeholder-image">No image available</div>
      </div>

      <div class="detail-primary-info">
        <h2 class="detail-title">{{ name }}</h2>

        <!-- Artist name (for albums and tracks) -->
        <div v-if="type === 'album' && albumInfo" class="detail-artist">
          by <span class="highlight">{{ albumInfo.artist }}</span>
          <span v-if="albumInfo.releaseDate" class="release-date">({{ albumInfo.releaseDate }})</span>
        </div>

        <div v-if="type === 'track' && trackInfo" class="detail-artist">
          by <span class="highlight">{{ trackInfo.artist }}</span>
          <div v-if="trackInfo.album" class="detail-album">from album: {{ trackInfo.album }}</div>
        </div>

        <!-- Tags -->
        <div v-if="tags.length > 0" class="detail-tags">
          <span v-for="tag in tags.slice(0, 5)" :key="tag.name" class="tag">{{ tag.name }}</span>
        </div>

        <!-- Last.fm link -->
        <div class="detail-link">
          <a v-if="itemUrl" :href="itemUrl" target="_blank" rel="noopener noreferrer" class="lastfm-button">
            View on Last.fm
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
              <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="detail-stats-container">
      <h3 class="section-title">Stats</h3>
      <div class="detail-stats-grid">
        <div v-if="stats?.listeners" class="stat-box">
          <div class="stat-value">{{ formatNumber(stats.listeners) }}</div>
          <div class="stat-label">Listeners</div>
        </div>
        <div v-if="stats?.playcount" class="stat-box">
          <div class="stat-value">{{ formatNumber(stats.playcount) }}</div>
          <div class="stat-label">Plays</div>
        </div>
        <div v-if="stats?.duration" class="stat-box">
          <div class="stat-value">{{ stats.duration }}</div>
          <div class="stat-label">Duration</div>
        </div>
        <div v-if="stats?.tracks" class="stat-box">
          <div class="stat-value">{{ stats.tracks }}</div>
          <div class="stat-label">Tracks</div>
        </div>
        <div v-if="stats?.count" class="stat-box">
          <div class="stat-value">{{ stats.count }}</div>
          <div class="stat-label">Count</div>
        </div>
      </div>
    </div>

    <!-- Summary/Bio section -->
    <div v-if="summary" class="detail-summary">
      <h3 class="section-title">About</h3>
      <p>{{ summary }}</p>
    </div>

    <!-- Track list for albums -->
    <div v-if="type === 'album' && trackList.length > 0" class="detail-tracklist">
      <h3 class="section-title">Tracks</h3>
      <ol class="track-list">
        <li v-for="(track, index) in trackList" :key="index" class="track-item">
          <div class="track-number">{{ index + 1 }}</div>
          <div class="track-name">{{ track.name }}</div>
          <div v-if="track.duration" class="track-duration">
            {{ formatDuration(track.duration) }}
          </div>
        </li>
      </ol>
    </div>

    <!-- Similar artists -->
    <div v-if="type === 'artist' && similarArtists.length > 0" class="detail-similar">
      <h3 class="section-title">Similar Artists</h3>
      <div class="similar-grid">
        <div v-for="artist in similarArtists.slice(0, 4)" :key="artist.name" class="similar-item">
          <img v-if="artist.image && artist.image.length" :src="artist.image.find((img) => img.size === 'medium')?.['#text'] || artist.image[0]['#text']" :alt="artist.name" class="similar-image" />
          <div class="similar-name">{{ artist.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ["artist", "album", "track", "tag"].includes(value),
  },
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  itemUrl: {
    type: String,
    default: "",
  },
  artistInfo: {
    type: Object,
    default: null,
  },
  albumInfo: {
    type: Object,
    default: null,
  },
  trackInfo: {
    type: Object,
    default: null,
  },
  tagInfo: {
    type: Object,
    default: null,
  },
});

// Add the missing truncateBio function
const truncateBio = (text) => {
  if (!text) return "";
  // Remove HTML tags and Last.fm attribution text
  let cleanText = text.replace(/<[^>]*>/g, "");
  // Remove "Read more on Last.fm" text and anything after
  const lastFmIndex = cleanText.indexOf("Read more on Last.fm");
  if (lastFmIndex !== -1) {
    cleanText = cleanText.substring(0, lastFmIndex);
  }
  return cleanText.trim();
};

const formatSummary = (text) => {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "");
};

// Format numbers with commas
const formatNumber = (num) => {
  if (!num) return "Unknown";
  return parseInt(num).toLocaleString();
};

// Format track duration
const formatDuration = (milliseconds) => {
  if (!milliseconds) return "";
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Get limited number of tags
const getTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.slice(0, 5);
};

const stats = computed(() => {
  switch (props.type) {
    case "artist":
      return props.artistInfo
        ? {
            listeners: props.artistInfo.stats?.listeners || "Unknown",
            playcount: props.artistInfo.stats?.playcount || "Unknown",
          }
        : null;
    case "album":
      return props.albumInfo
        ? {
            listeners: props.albumInfo.listeners || "Unknown",
            playcount: props.albumInfo.playcount || "Unknown",
            tracks: props.albumInfo.tracks?.length || 0,
          }
        : null;
    case "track":
      return props.trackInfo
        ? {
            listeners: props.trackInfo.listeners || "Unknown",
            playcount: props.trackInfo.playcount || "Unknown",
            duration: props.trackInfo.duration || "Unknown",
          }
        : null;
    case "tag":
      return props.tagInfo
        ? {
            count: props.tagInfo.count || "Unknown",
          }
        : null;
    default:
      return null;
  }
});

// Format tags based on item type
const tags = computed(() => {
  switch (props.type) {
    case "artist":
      return props.artistInfo?.tags?.tag || [];
    case "album":
      return props.albumInfo?.tags || [];
    case "track":
      return props.trackInfo?.tags || [];
    default:
      return [];
  }
});

// Get bio/summary based on item type
const summary = computed(() => {
  switch (props.type) {
    case "artist":
      return props.artistInfo?.bio?.summary ? truncateBio(props.artistInfo.bio.summary) : "";
    case "track":
      return props.trackInfo?.wiki?.summary ? formatSummary(props.trackInfo.wiki.summary) : "";
    default:
      return "";
  }
});

// For albums, get track list
const trackList = computed(() => {
  if (props.type !== "album" || !props.albumInfo || !props.albumInfo.tracks) return [];
  return props.albumInfo.tracks;
});

// Show similar artists if available
const similarArtists = computed(() => {
  if (props.type !== "artist" || !props.artistInfo || !props.artistInfo.similar) return [];
  return props.artistInfo.similar;
});
</script>

<style scoped>
.item-detail {
  padding: 2rem;
  background-color: #fff;
  color: #111;
  border: 4px solid #000;
  box-shadow: 8px 8px 0px #000;
  font-family: "Arial", sans-serif;
  position: relative;
  margin-bottom: 2rem;
}

.section-title {
  text-transform: uppercase;
  font-weight: 900;
  margin: 0 0 1rem 0;
  border-bottom: 4px solid #000;
  padding-bottom: 0.5rem;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30%;
  height: 4px;
  background-color: #ff69b4;
}

.detail-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-image-container {
  min-width: 220px;
  width: 220px;
  height: 220px;
  border: 4px solid #000;
  box-shadow: 6px 6px 0px #000;
  overflow: hidden;
  background-color: #f0f0f0;
  flex-shrink: 0;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: bold;
  text-transform: uppercase;
  padding: 1rem;
  text-align: center;
  border: 2px dashed #000;
  margin: 10px;
}

.detail-primary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-title {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 900;
  line-height: 1.1;
  text-transform: uppercase;
  color: #000;
  position: relative;
  z-index: 1;
}

.detail-title::before {
  content: "";
  position: absolute;
  width: 30%;
  height: 12px;
  background-color: #ff69b4;
  bottom: 4px;
  left: 0;
  z-index: -1;
}

.detail-artist {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: -0.5rem;
}

.highlight {
  background-color: #ffff00;
  padding: 0 0.25rem;
  font-weight: 700;
}

.release-date {
  background-color: #111;
  color: white;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-size: 0.85rem;
}

.detail-album {
  font-size: 1rem;
  margin-top: 0.25rem;
  background-color: #f0f0f0;
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-left: 4px solid #ff69b4;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background-color: #111;
  color: white;
  padding: 0.25rem 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  border: 2px solid #000;
  transform: rotate(-1deg);
}

.tag:nth-child(odd) {
  transform: rotate(1deg);
  background-color: #ff69b4;
}

.tag:hover {
  transform: rotate(0);
  transition: transform 0.2s;
}

.detail-link {
  margin-top: 1rem;
}

.lastfm-button {
  background-color: #d51007;
  color: white;
  border: 3px solid #000;
  padding: 0.5rem 1rem;
  font-weight: 800;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 4px 4px 0px #000;
  transition: transform 0.2s, box-shadow 0.2s;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.lastfm-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.detail-stats-container {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 4px solid #000;
  background-color: #f8f8f8;
}

.detail-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-box {
  border: 3px solid #000;
  padding: 1rem;
  background-color: white;
  box-shadow: 4px 4px 0px #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.stat-box::before {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #ffff00;
  top: -10px;
  left: -10px;
  transform: rotate(45deg);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 900;
  color: #000;
}

.stat-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #666;
  margin-top: 0.25rem;
}

.detail-summary {
  margin: 2rem 0;
  border: 4px solid #000;
  padding: 1.5rem;
  background-color: white;
  position: relative;
}

.detail-summary p {
  line-height: 1.7;
  margin: 0;
  font-size: 1.05rem;
}

.detail-tracklist {
  margin: 2rem 0;
  border: 4px solid #000;
  padding: 1.5rem;
  background-color: white;
}

.track-list {
  padding-left: 0;
  list-style-type: none;
  margin: 0;
}

.track-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-bottom: 2px solid #eee;
  transition: background-color 0.2s;
}

.track-item:hover {
  background-color: #f8f8f8;
}

.track-number {
  font-weight: 900;
  color: #ff69b4;
  font-size: 1.2rem;
}

.track-name {
  font-weight: 600;
}

.track-duration {
  color: #666;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: monospace;
  background-color: #f0f0f0;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.detail-similar {
  margin: 2rem 0;
  border: 4px solid #000;
  padding: 1.5rem;
  background-color: white;
}

.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1.5rem;
}

.similar-item {
  text-align: center;
  transition: transform 0.2s;
}

.similar-item:hover {
  transform: translateY(-5px);
}

.similar-image {
  width: 100px;
  height: 100px;
  border: 3px solid #000;
  box-shadow: 3px 3px 0px #000;
  object-fit: cover;
}

.similar-name {
  margin-top: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
  }

  .detail-image-container {
    width: 100%;
    min-width: unset;
    max-width: 300px;
    height: 300px;
    margin: 0 auto 1.5rem;
  }

  .detail-stats-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .track-item {
    grid-template-columns: 30px 1fr auto;
  }
}

@media (max-width: 480px) {
  .item-detail {
    padding: 1rem;
  }

  .detail-title {
    font-size: 1.75rem;
  }

  .detail-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
