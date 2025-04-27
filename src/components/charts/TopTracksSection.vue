<!-- Top Tracks Section Component -->
<template>
  <div class="flex flex-col">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-bold">Top Tracks</h3>
      <div class="flex gap-2">
        <button @click="$emit('view-all')" class="text-white bg-blue-600 hover:bg-blue-700 transition px-3 py-1 rounded-md text-sm flex items-center">
          <span class="mr-1">View All</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
        <button @click="$emit('share')" class="text-white bg-blue-600 hover:bg-blue-700 transition px-3 py-1 rounded-md text-sm flex items-center">
          <span class="mr-1">Share</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="topTrack" 
        @click="showDetails(topTrack.name, topTrack.artist?.name)"
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
        <div v-if="tags.length > 0" class="mt-2 flex flex-wrap gap-1">
          <span class="text-xs text-gray-500">Tags:</span>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="(tag, index) in tags" 
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
      <div v-for="(track, index) in otherTracks" 
          :key="track.mbid || index" 
          @click="showDetails(track.name, track.artist?.name)"
          class="flex items-center p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200">
        <div class="w-10 font-semibold text-sm">#{{ index + 2 }}</div>
        <div class="flex-1 truncate text-sm">{{ track.name }}</div>
        <div class="w-10 text-xs text-gray-400 text-right">{{ formatPlaycount(track.playcount) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { formatPlaycount } from '../../utils/formatUtils';
import { getTrackImage } from '../../utils/imageUtils';

const emit = defineEmits(['view-all', 'share', 'show-details']);

defineProps({
  topTrack: {
    type: Object,
    default: () => null
  },
  otherTracks: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  }
});

function showDetails(trackName, artistName) {
  if (!trackName || !artistName) return;
  emit('show-details', { trackName, artistName });
}
</script>

<script>
export default {
  name: 'TopTracksSection'
};
</script> 