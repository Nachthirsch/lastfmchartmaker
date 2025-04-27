<!-- Top Artists Section Component -->
<template>
  <div class="flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold uppercase tracking-wide">Top Artists</h3>
      <div class="flex gap-2">
        <button @click="$emit('view-all')" class="text-white bg-purple-600 hover:bg-purple-500 transition-all transform hover:translate-x-1 hover:translate-y-1 border-2 border-white px-3 py-1 text-sm flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
          <span class="mr-1">View All</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
        <button @click="$emit('share')" class="text-white bg-purple-600 hover:bg-purple-500 transition-all transform hover:translate-x-1 hover:translate-y-1 border-2 border-white px-3 py-1 text-sm flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
          <span class="mr-1">Share</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="topArtist" @click="$emit('show-details', topArtist.name)" class="relative mb-6 bg-gray-900 overflow-hidden cursor-pointer transition-all duration-200 hover:translate-y-[-4px] shadow-[8px_8px_0px_0px_rgba(147,51,234,0.7)] border-2 border-white">
      <div class="relative w-full h-48 overflow-hidden">
        <img :src="getArtistImage(topArtist)" :alt="topArtist.name" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
        <div class="absolute bottom-2 left-2 bg-purple-500 text-black text-xs font-bold py-1 px-2 border-2 border-black transform rotate-[-2deg]">Top Artist</div>
      </div>
      <div class="p-4">
        <h3 class="text-lg font-extrabold mb-1">#1 {{ topArtist.name }}</h3>
        <div class="text-xs text-purple-400 font-bold">{{ formatPlaycount(topArtist.playcount) }} scrobbles</div>

        <!-- Artist Tags -->
        <div v-if="tags.length > 0" class="mt-3 flex flex-wrap gap-1">
          <span class="text-xs text-gray-500 uppercase">Tags:</span>
          <div class="flex flex-wrap gap-1">
            <span v-for="(tag, index) in tags" :key="index" class="text-xs px-2 py-0.5 bg-purple-600 text-white border border-purple-400">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 overflow-hidden shadow-[6px_6px_0px_0px_rgba(147,51,234,0.5)] border-2 border-white">
      <div v-for="(artist, index) in otherArtists" :key="artist.mbid || index" @click="$emit('show-details', artist.name)" class="flex items-center p-3 border-b-2 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200">
        <div class="w-10 font-black text-sm">#{{ index + 2 }}</div>
        <div class="flex-1 truncate text-sm font-medium">{{ artist.name }}</div>
        <div class="w-16 text-xs text-purple-400 font-bold text-right">{{ formatPlaycount(artist.playcount) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { formatPlaycount } from "../../utils/formatUtils";
import { getArtistImage } from "../../utils/imageUtils";

defineEmits(["view-all", "share", "show-details"]);

defineProps({
  topArtist: {
    type: Object,
    default: () => null,
  },
  otherArtists: {
    type: Array,
    default: () => [],
  },
  tags: {
    type: Array,
    default: () => [],
  },
});
</script>

<script>
export default {
  name: "TopArtistsSection",
};
</script>
