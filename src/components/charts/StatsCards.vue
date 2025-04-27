<!-- Statistics cards showing artists, albums, and tracks counts with trends -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
    <!-- Artists Card -->
    <div class="p-5 bg-purple-300 text-black relative overflow-hidden min-h-[110px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] border-3 border-black transform hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.7)] transition-all">
      <div class="text-base font-bold uppercase tracking-wider mb-4">Artists</div>
      <div class="flex justify-between items-end">
        <div class="flex flex-col">
          <span class="text-4xl font-black">{{ artistsCount }}</span>
          <span v-if="artistsTrend > 0" class="text-sm font-black text-green-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
            {{ formatTrend(artistsTrend) }}%
          </span>
          <span v-else-if="artistsTrend < 0" class="text-sm font-black text-red-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            {{ formatTrend(Math.abs(artistsTrend)) }}%
          </span>
        </div>
        <div class="flex gap-1 items-end h-12">
          <div v-for="i in 3" :key="`artist-ind-${i}`" class="w-3 bg-black border border-black" :class="[i === 1 ? 'h-10' : '', i === 2 ? 'h-6' : '', i === 3 ? 'h-4' : '']"></div>
        </div>
      </div>
    </div>

    <!-- Albums Card -->
    <div class="p-5 bg-teal-300 text-black relative overflow-hidden min-h-[110px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] border-3 border-black transform hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.7)] transition-all">
      <div class="text-base font-bold uppercase tracking-wider mb-4">Albums</div>
      <div class="flex justify-between items-end">
        <div class="flex flex-col">
          <span class="text-4xl font-black">{{ albumsCount }}</span>
          <span v-if="albumsTrend > 0" class="text-sm font-black text-green-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
            {{ formatTrend(albumsTrend) }}%
          </span>
          <span v-else-if="albumsTrend < 0" class="text-sm font-black text-red-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            {{ formatTrend(Math.abs(albumsTrend)) }}%
          </span>
        </div>
        <div class="flex gap-1 items-end h-12">
          <div v-for="i in 3" :key="`album-ind-${i}`" class="w-3 bg-black border border-black" :class="[i === 1 ? 'h-10' : '', i === 2 ? 'h-6' : '', i === 3 ? 'h-4' : '']"></div>
        </div>
      </div>
    </div>

    <!-- Tracks Card -->
    <div class="p-5 bg-blue-400 text-black relative overflow-hidden min-h-[110px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] border-3 border-black transform hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.7)] transition-all">
      <div class="text-base font-bold uppercase tracking-wider mb-4">Tracks</div>
      <div class="flex justify-between items-end">
        <div class="flex flex-col">
          <span class="text-4xl font-black">{{ tracksCount }}</span>
          <span v-if="tracksTrend > 0" class="text-sm font-black text-green-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
            {{ formatTrend(tracksTrend) }}%
          </span>
          <span v-else-if="tracksTrend < 0" class="text-sm font-black text-red-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            {{ formatTrend(Math.abs(tracksTrend)) }}%
          </span>
        </div>
        <div class="flex gap-1 items-end h-12">
          <div v-for="i in 3" :key="`track-ind-${i}`" class="w-3 bg-black border border-black" :class="[i === 1 ? 'h-10' : '', i === 2 ? 'h-6' : '', i === 3 ? 'h-4' : '']"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { formatTrend } from "../../utils/formatUtils";

defineProps({
  artistsCount: {
    type: Number,
    required: true,
  },
  albumsCount: {
    type: Number,
    required: true,
  },
  tracksCount: {
    type: Number,
    required: true,
  },
  artistsTrend: {
    type: Number,
    default: 0,
  },
  albumsTrend: {
    type: Number,
    default: 0,
  },
  tracksTrend: {
    type: Number,
    default: 0,
  },
});
</script>

<script>
export default {
  name: "StatsCards",
};
</script>
