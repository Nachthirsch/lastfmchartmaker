<template>
  <div class="item-detail" :class="type">
    <div class="item-image-container">
      <img v-if="imageUrl" :src="imageUrl" :alt="name" class="item-image" />
      <div v-else class="placeholder-image">No image available</div>
    </div>
    <div class="item-info">
      <h3 class="item-name">{{ name }}</h3>

      <!-- Artist info -->
      <div v-if="type === 'artist' && artistInfo">
        <p v-if="artistInfo.bio && artistInfo.bio.summary" class="item-bio" v-html="truncateBio(artistInfo.bio.summary)"></p>
        <div class="item-stats">
          <div class="stat">
            <span class="stat-label">Listeners:</span>
            <span class="stat-value">{{ formatNumber(artistInfo.stats?.listeners) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Playcount:</span>
            <span class="stat-value">{{ formatNumber(artistInfo.stats?.playcount) }}</span>
          </div>
        </div>
        <div v-if="artistInfo.tags && artistInfo.tags.tag" class="item-tags">
          <span v-for="tag in getTags(artistInfo.tags.tag)" :key="tag.name" class="tag">{{ tag.name }}</span>
        </div>
      </div>

      <!-- Album info -->
      <div v-if="type === 'album' && albumInfo">
        <div class="item-subtitle">
          <span>by {{ albumInfo.artist }}</span>
          <span v-if="albumInfo.releaseDate" class="release-date">({{ albumInfo.releaseDate }})</span>
        </div>
        <div class="item-stats">
          <div class="stat">
            <span class="stat-label">Listeners:</span>
            <span class="stat-value">{{ albumInfo.listeners }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Playcount:</span>
            <span class="stat-value">{{ albumInfo.playcount }}</span>
          </div>
        </div>
        <div v-if="albumInfo.tags && albumInfo.tags.length" class="item-tags">
          <span v-for="tag in albumInfo.tags.slice(0, 5)" :key="tag.name" class="tag">{{ tag.name }}</span>
        </div>
        <div v-if="albumInfo.tracks && albumInfo.tracks.length" class="item-tracks">
          <h4>Tracks</h4>
          <ul>
            <li v-for="(track, index) in albumInfo.tracks.slice(0, 10)" :key="index">
              {{ track.name }} <span v-if="track.duration" class="track-duration">{{ formatDuration(track.duration) }}</span>
            </li>
            <li v-if="albumInfo.tracks.length > 10" class="more-tracks">And {{ albumInfo.tracks.length - 10 }} more tracks...</li>
          </ul>
        </div>
      </div>

      <!-- Track info -->
      <div v-if="type === 'track' && trackInfo">
        <div class="item-subtitle">
          <span>by {{ trackInfo.artist }}</span>
          <span v-if="trackInfo.album" class="album-name">from {{ trackInfo.album }}</span>
        </div>
        <div class="item-stats">
          <div class="stat">
            <span class="stat-label">Listeners:</span>
            <span class="stat-value">{{ trackInfo.listeners }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Playcount:</span>
            <span class="stat-value">{{ trackInfo.playcount }}</span>
          </div>
          <div class="stat" v-if="trackInfo.duration">
            <span class="stat-label">Duration:</span>
            <span class="stat-value">{{ trackInfo.duration }}</span>
          </div>
        </div>
        <div v-if="trackInfo.tags && trackInfo.tags.length" class="item-tags">
          <span v-for="tag in trackInfo.tags.slice(0, 5)" :key="tag.name" class="tag">{{ tag.name }}</span>
        </div>
      </div>

      <div class="item-links">
        <a v-if="itemUrl" :href="itemUrl" target="_blank" class="last-fm-link">View on Last.fm</a>
      </div>
    </div>
    
    <!-- Content from the second template -->
    <div class="item-detail-content">
      <!-- Main info section with image -->
      <div class="detail-header">
        <div class="detail-image-container">
          <img v-if="imageUrl" :src="imageUrl" :alt="name" class="detail-image" />
          <div v-else class="placeholder-image">No image available</div>
        </div>

        <div class="detail-info">
          <h3>{{ name }}</h3>

          <!-- Artist name (for albums and tracks) -->
          <div v-if="type === 'album' && albumInfo" class="detail-artist">by {{ albumInfo.artist }}</div>
          <div v-if="type === 'track' && trackInfo" class="detail-artist">
            by {{ trackInfo.artist }}
            <div v-if="trackInfo.album" class="detail-album">from album: {{ trackInfo.album }}</div>
          </div>

          <!-- Stats -->
          <div v-if="stats" class="detail-stats">
            <div v-if="stats.listeners" class="stat-item">
              <span class="stat-label">Listeners:</span>
              <span class="stat-value">{{ stats.listeners }}</span>
            </div>
            <div v-if="stats.playcount" class="stat-item">
              <span class="stat-label">Plays:</span>
              <span class="stat-value">{{ stats.playcount }}</span>
            </div>
            <div v-if="stats.duration" class="stat-item">
              <span class="stat-label">Duration:</span>
              <span class="stat-value">{{ stats.duration }}</span>
            </div>
            <div v-if="stats.tracks" class="stat-item">
              <span class="stat-label">Tracks:</span>
              <span class="stat-value">{{ stats.tracks }}</span>
            </div>
            <div v-if="stats.count" class="stat-item">
              <span class="stat-label">Count:</span>
              <span class="stat-value">{{ stats.count }}</span>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="tags.length > 0" class="detail-tags">
            <div class="tag-label">Tags:</div>
            <div class="tag-list">
              <span v-for="tag in tags" :key="tag.name" class="tag">
                {{ tag.name }}
              </span>
            </div>
          </div>

          <!-- Last.fm link -->
          <div v-if="itemUrl" class="detail-link">
            <a :href="itemUrl" target="_blank" rel="noopener noreferrer">View on Last.fm</a>
          </div>
        </div>
      </div>

      <!-- Summary/Bio section -->
      <div v-if="summary" class="detail-summary">
        <h4>About</h4>
        <p>{{ summary }}</p>
      </div>

      <!-- Track list for albums -->
      <div v-if="type === 'album' && trackList.length > 0" class="detail-tracklist">
        <h4>Tracks</h4>
        <ol class="track-list">
          <li v-for="(track, index) in trackList" :key="index" class="track-item">
            <div class="track-name">{{ track.name }}</div>
            <div v-if="track.duration" class="track-duration">
              {{ new Date(parseInt(track.duration) * 1000).toISOString().substr(14, 5) }}
            </div>
          </li>
        </ol>
      </div>

      <!-- Similar artists -->
      <div v-if="type === 'artist' && similarArtists.length > 0" class="detail-similar">
        <h4>Similar Artists</h4>
        <div class="similar-grid">
          <div v-for="artist in similarArtists.slice(0, 4)" :key="artist.name" class="similar-item">
            <img v-if="artist.image && artist.image.length" :src="artist.image.find((img) => img.size === 'medium')?.['#text'] || artist.image[0]['#text']" :alt="artist.name" class="similar-image" />
            <div class="similar-name">{{ artist.name }}</div>
          </div>
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
      return props.artistInfo?.tags || [];
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
      return props.artistInfo?.bio?.summary ? formatSummary(props.artistInfo.bio.summary) : "";
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
  padding: 1.5rem;
}

.item-detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-header {
  display: flex;
  gap: 1.5rem;
}

.detail-image-container {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
  background-color: #f9f9f9;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
  color: #999;
  font-size: 0.9rem;
  background-color: #f4f4f4;
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-info h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.detail-artist {
  color: #666;
  font-size: 1.1rem;
}

.detail-album {
  font-size: 0.9rem;
  color: #888;
  margin-top: 0.25rem;
}

.detail-stats {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.stat-item {
  background-color: #f8f8f8;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.stat-label {
  font-weight: bold;
  margin-right: 0.25rem;
  color: #666;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag-label {
  font-weight: bold;
  color: #666;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: #d51007;
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  font-size: 0.8rem;
}

.detail-link a {
  color: #d51007;
  text-decoration: none;
  font-weight: bold;
  margin-top: 0.5rem;
  display: inline-block;
}

.detail-link a:hover {
  text-decoration: underline;
}

.detail-summary {
  line-height: 1.6;
  color: #444;
}

.detail-summary h4,
.detail-tracklist h4,
.detail-similar h4 {
  margin: 0 0 0.75rem 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.track-list {
  padding-left: 1.5rem;
  margin: 0;
}

.track-item {
  padding: 0.5rem 0;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f5f5f5;
}

.track-duration {
  color: #888;
  font-size: 0.9rem;
}

.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.similar-item {
  text-align: center;
}

.similar-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

.similar-name {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
  }

  .detail-image-container {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
}
</style>
