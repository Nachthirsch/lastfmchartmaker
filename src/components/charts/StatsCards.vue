<!-- Statistics cards showing artists, albums, and tracks counts with trends -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
    <!-- Artists Card -->
    <div class="p-5 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-purple-300 text-black relative overflow-hidden min-h-[100px] shadow-md">
      <div class="text-base mb-4">Artists</div>
      <div class="flex justify-between items-end">
        <div class="flex flex-col">
          <span class="text-4xl font-bold">{{ artistsCount }}</span>
          <span v-if="artistsTrend > 0" class="text-sm font-medium text-green-800">↑ {{ formatTrend(artistsTrend) }}%</span>
          <span v-else-if="artistsTrend < 0" class="text-sm font-medium text-red-800">↓ {{ formatTrend(Math.abs(artistsTrend)) }}%</span>
        </div>
        <div class="flex gap-1 items-end h-12">
          <div v-for="i in 3" :key="`artist-ind-${i}`" 
              class="w-2.5 bg-black bg-opacity-20 rounded-sm"
              :class="[
                i === 1 ? 'h-10' : '',
                i === 2 ? 'h-6' : '',
                i === 3 ? 'h-4' : ''
              ]">
          </div>
        </div>
      </div>
    </div>

    <!-- Albums Card -->
    <div class="p-5 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-teal-300 text-black relative overflow-hidden min-h-[100px] shadow-md">
      <div class="text-base mb-4">Albums</div>
      <div class="flex justify-between items-end">
        <div class="flex flex-col">
          <span class="text-4xl font-bold">{{ albumsCount }}</span>
          <span v-if="albumsTrend > 0" class="text-sm font-medium text-green-800">↑ {{ formatTrend(albumsTrend) }}%</span>
          <span v-else-if="albumsTrend < 0" class="text-sm font-medium text-red-800">↓ {{ formatTrend(Math.abs(albumsTrend)) }}%</span>
        </div>
        <div class="flex gap-1 items-end h-12">
          <div v-for="i in 3" :key="`album-ind-${i}`" 
              class="w-2.5 bg-black bg-opacity-20 rounded-sm"
              :class="[
                i === 1 ? 'h-10' : '',
                i === 2 ? 'h-6' : '',
                i === 3 ? 'h-4' : ''
              ]">
          </div>
        </div>
      </div>
    </div>

    <!-- Tracks Card -->
    <div class="p-5 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-blue-400 text-black relative overflow-hidden min-h-[100px] shadow-md">
      <div class="text-base mb-4">Tracks</div>
      <div class="flex justify-between items-end">
        <div class="flex flex-col">
          <span class="text-4xl font-bold">{{ tracksCount }}</span>
          <span v-if="tracksTrend > 0" class="text-sm font-medium text-green-800">↑ {{ formatTrend(tracksTrend) }}%</span>
          <span v-else-if="tracksTrend < 0" class="text-sm font-medium text-red-800">↓ {{ formatTrend(Math.abs(tracksTrend)) }}%</span>
        </div>
        <div class="flex gap-1 items-end h-12">
          <div v-for="i in 3" :key="`track-ind-${i}`" 
              class="w-2.5 bg-black bg-opacity-20 rounded-sm"
              :class="[
                i === 1 ? 'h-10' : '',
                i === 2 ? 'h-6' : '',
                i === 3 ? 'h-4' : ''
              ]">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { formatTrend } from '../../utils/formatUtils';

defineProps({
  artistsCount: {
    type: Number,
    required: true
  },
  albumsCount: {
    type: Number,
    required: true
  },
  tracksCount: {
    type: Number,
    required: true
  },
  artistsTrend: {
    type: Number,
    default: 0
  },
  albumsTrend: {
    type: Number,
    default: 0
  },
  tracksTrend: {
    type: Number,
    default: 0
  }
});
</script>

<script>
export default {
  name: 'StatsCards'
};
</script> 