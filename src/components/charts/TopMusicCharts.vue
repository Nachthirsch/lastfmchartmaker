<!-- A component displaying top music charts in a modern card layout -->
<template>
  <div class="top-music-wrapper">
    <div class="section-header">
      <h2 class="section-title">TOP MUSIC</h2>
      <div class="section-underline"></div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="stats-grid">
      <!-- Artists Card -->
      <div class="stats-card artists-card">
        <div class="card-header">Artists</div>
        <div class="stats-content">
          <div class="stats-number">
            {{ artistsCount }}
            <span class="trend up" v-if="artistsTrend > 0">↑ {{ formatTrend(artistsTrend) }}%</span>
            <span class="trend down" v-else-if="artistsTrend < 0">↓ {{ formatTrend(Math.abs(artistsTrend)) }}%</span>
          </div>
          <div class="stats-bar">
            <div class="bar-indicator" v-for="i in 3" :key="`artist-ind-${i}`"></div>
          </div>
        </div>
      </div>

      <!-- Albums Card -->
      <div class="stats-card albums-card">
        <div class="card-header">Albums</div>
        <div class="stats-content">
          <div class="stats-number">
            {{ albumsCount }}
            <span class="trend up" v-if="albumsTrend > 0">↑ {{ formatTrend(albumsTrend) }}%</span>
            <span class="trend down" v-else-if="albumsTrend < 0">↓ {{ formatTrend(Math.abs(albumsTrend)) }}%</span>
          </div>
          <div class="stats-bar">
            <div class="bar-indicator" v-for="i in 3" :key="`album-ind-${i}`"></div>
          </div>
        </div>
      </div>

      <!-- Tracks Card -->
      <div class="stats-card tracks-card">
        <div class="card-header">Tracks</div>
        <div class="stats-content">
          <div class="stats-number">
            {{ tracksCount }}
            <span class="trend up" v-if="tracksTrend > 0">↑ {{ formatTrend(tracksTrend) }}%</span>
            <span class="trend down" v-else-if="tracksTrend < 0">↓ {{ formatTrend(Math.abs(tracksTrend)) }}%</span>
          </div>
          <div class="stats-bar">
            <div class="bar-indicator" v-for="i in 3" :key="`track-ind-${i}`"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Items Grid -->
    <div class="top-items-grid">
      <!-- Top Artist Section -->
      <div class="top-item-section">
        <div class="top-item featured-item" v-if="topArtist" @click="showArtistDetails(topArtist.name)">
          <div class="featured-item-image">
            <img :src="getArtistImage(topArtist)" :alt="topArtist.name" />
            <div class="featured-badge">Top Artist</div>
          </div>
          <div class="featured-item-info">
            <h3 class="featured-item-title">#1 {{ topArtist.name }}</h3>
            <div class="featured-item-playcount">{{ formatPlaycount(topArtist.playcount) }} scrobbles</div>
          </div>
        </div>

        <div class="top-item-list">
          <div v-for="(artist, index) in otherTopArtists" :key="artist.mbid || index" class="list-item" @click="showArtistDetails(artist.name)">
            <div class="list-item-rank">#{{ index + 2 }}</div>
            <div class="list-item-name">{{ artist.name }}</div>
            <div class="list-item-playcount">{{ formatPlaycount(artist.playcount) }}</div>
          </div>
        </div>
      </div>

      <!-- Top Album Section -->
      <div class="top-item-section">
        <div class="top-item featured-item" v-if="topAlbum" @click="showAlbumDetails(topAlbum.name, topAlbum.artist?.name)">
          <div class="featured-item-image">
            <img :src="getAlbumImage(topAlbum)" :alt="topAlbum.name" />
            <div class="featured-badge">Top Album</div>
          </div>
          <div class="featured-item-info">
            <h3 class="featured-item-title">#1 {{ topAlbum.name }}</h3>
            <div class="featured-item-artist">{{ topAlbum.artist?.name }}</div>
            <div class="featured-item-playcount">{{ formatPlaycount(topAlbum.playcount) }} scrobbles</div>
          </div>
        </div>

        <div class="top-item-list">
          <div v-for="(album, index) in otherTopAlbums" :key="album.mbid || index" class="list-item" @click="showAlbumDetails(album.name, album.artist?.name)">
            <div class="list-item-rank">#{{ index + 2 }}</div>
            <div class="list-item-name">{{ album.name }}</div>
            <div class="list-item-playcount">{{ formatPlaycount(album.playcount) }}</div>
          </div>
        </div>
      </div>

      <!-- Top Track Section -->
      <div class="top-item-section">
        <div class="top-item featured-item" v-if="topTrack" @click="showTrackDetails(topTrack.name, topTrack.artist?.name)">
          <div class="featured-item-image">
            <img :src="getTrackImage(topTrack)" :alt="topTrack.name" />
            <div class="featured-badge">Top Track</div>
          </div>
          <div class="featured-item-info">
            <h3 class="featured-item-title">#1 {{ topTrack.name }}</h3>
            <div class="featured-item-artist">{{ topTrack.artist?.name }}</div>
            <div class="featured-item-playcount">{{ formatPlaycount(topTrack.playcount) }} scrobbles</div>
          </div>
        </div>

        <div class="top-item-list">
          <div v-for="(track, index) in otherTopTracks" :key="track.mbid || index" class="list-item" @click="showTrackDetails(track.name, track.artist?.name)">
            <div class="list-item-rank">#{{ index + 2 }}</div>
            <div class="list-item-name">{{ track.name }}</div>
            <div class="list-item-playcount">{{ formatPlaycount(track.playcount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Items Grid -->
    <div class="new-items-grid">
      <div class="new-item-section">
        <h3 class="new-section-title">New Artists</h3>
        <!-- New artists will be displayed here -->
      </div>
      <div class="new-item-section">
        <h3 class="new-section-title">New Albums</h3>
        <!-- New albums will be displayed here -->
      </div>
      <div class="new-item-section">
        <h3 class="new-section-title">New Tracks</h3>
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

<style scoped>
.top-music-wrapper {
  width: 100%;
  padding: 20px;
  background-color: #000;
  color: #fff;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 30px;
}

.section-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.section-underline {
  width: 100px;
  height: 3px;
  background-color: #fff;
}

/* Stats Grid Styles */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  padding: 20px;
  border-radius: 10px 10px 10px 0;
  color: #000;
  position: relative;
  overflow: hidden;
  min-height: 100px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.artists-card {
  background-color: #daabff;
}

.albums-card {
  background-color: #7fffd4;
}

.tracks-card {
  background-color: #59a5ff;
}

.card-header {
  font-size: 16px;
  margin-bottom: 15px;
}

.stats-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.stats-number {
  font-size: 42px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
}

.trend {
  font-size: 14px;
  font-weight: 500;
}

.trend.up {
  color: #228b22;
}

.trend.down {
  color: #b22222;
}

.stats-bar {
  display: flex;
  gap: 5px;
  align-items: flex-end;
  height: 50px;
}

.bar-indicator {
  width: 10px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.bar-indicator:nth-child(2) {
  height: 25px;
}

.bar-indicator:nth-child(3) {
  height: 15px;
}

/* Top Items Grid Styles */
.top-items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.top-item-section {
  display: flex;
  flex-direction: column;
}

.featured-item {
  position: relative;
  margin-bottom: 20px;
  background-color: #111;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.featured-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.featured-item-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.featured-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.featured-item:hover .featured-item-image img {
  transform: scale(1.05);
}

.featured-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: #7fffd4;
  color: #000;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 3px;
  z-index: 2;
}

.top-item-section:nth-child(1) .featured-badge {
  background-color: #daabff;
}

.top-item-section:nth-child(2) .featured-badge {
  background-color: #7fffd4;
}

.top-item-section:nth-child(3) .featured-badge {
  background-color: #59a5ff;
}

.featured-item-info {
  padding: 15px;
}

.featured-item-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.featured-item-artist {
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}

.featured-item-playcount {
  font-size: 12px;
  color: #777;
}

.top-item-list {
  background-color: #111;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #222;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background-color: #222;
}

.list-item-rank {
  width: 40px;
  font-weight: 600;
  font-size: 14px;
}

.list-item-name {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item-playcount {
  width: 40px;
  font-size: 12px;
  color: #777;
  text-align: right;
}

/* New Items Grid Styles */
.new-items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.new-item-section {
  background-color: #111;
  border-radius: 8px;
  padding: 15px;
  min-height: 100px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.new-section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}

/* Responsive Design */
@media (max-width: 900px) {
  .stats-grid,
  .top-items-grid,
  .new-items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid,
  .top-items-grid,
  .new-items-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-number {
    font-size: 36px;
  }
}
</style> 