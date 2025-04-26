<template>
  <div class="p-5 bg-gray-900 rounded-lg">
    <h2 class="text-xl font-bold mb-4">Spotify API Test</h2>
    
    <div class="mb-4">
      <label for="artistName" class="block mb-2">Artist Name:</label>
      <div class="flex">
        <input 
          type="text" 
          id="artistName" 
          v-model="artistName" 
          class="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-l-md text-white"
          placeholder="Enter an artist name"
        />
        <button 
          @click="fetchArtistImage" 
          class="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-r-md text-white"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Loading...' : 'Search' }}
        </button>
      </div>
    </div>
    
    <div v-if="error" class="mb-4 p-2 bg-red-900 text-white rounded-md">
      {{ error }}
    </div>
    
    <div v-if="isLoading" class="text-center p-10">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p>Fetching artist data...</p>
    </div>
    
    <div v-else-if="imageUrl" class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Result:</h3>
      <div class="bg-gray-800 p-4 rounded-md">
        <div class="flex items-center">
          <img :src="imageUrl" alt="Artist" class="w-24 h-24 object-cover rounded-md mr-4" />
          <div>
            <div class="font-bold">{{ artistName }}</div>
            <div class="text-sm text-gray-400 mb-2">Image from Spotify API</div>
            <div class="text-xs text-gray-500 break-all">{{ imageUrl }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-2">Test Multiple Artists:</h3>
      <button 
        @click="testMultipleArtists" 
        class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white w-full"
        :disabled="isTestingMultiple"
      >
        {{ isTestingMultiple ? 'Testing...' : 'Test Batch Image Fetching' }}
      </button>
      
      <div v-if="multipleResults.length > 0" class="mt-4 bg-gray-800 p-4 rounded-md">
        <h4 class="font-semibold mb-2">Results:</h4>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div 
            v-for="(result, index) in multipleResults" 
            :key="index"
            class="bg-gray-900 p-2 rounded-md"
          >
            <img 
              v-if="result.url" 
              :src="result.url" 
              :alt="result.name" 
              class="w-full h-32 object-cover rounded-md mb-2" 
            />
            <div v-else class="w-full h-32 bg-gray-800 flex items-center justify-center rounded-md mb-2">
              No image
            </div>
            <div class="text-sm truncate">{{ result.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { spotifyService } from '../services/spotify.api';

const artistName = ref('');
const imageUrl = ref('');
const error = ref('');
const isLoading = ref(false);
const isTestingMultiple = ref(false);
const multipleResults = ref([]);

async function fetchArtistImage() {
  if (!artistName.value.trim()) {
    error.value = 'Please enter an artist name';
    return;
  }
  
  error.value = '';
  isLoading.value = true;
  imageUrl.value = '';
  
  try {
    const url = await spotifyService.getArtistImageUrl(artistName.value);
    
    if (url) {
      imageUrl.value = url;
    } else {
      error.value = `No image found for "${artistName.value}"`;
    }
  } catch (err) {
    console.error('Error fetching artist image:', err);
    error.value = `Error: ${err.message || 'Failed to fetch artist image'}`;
  } finally {
    isLoading.value = false;
  }
}

async function testMultipleArtists() {
  isTestingMultiple.value = true;
  multipleResults.value = [];
  error.value = '';
  
  try {
    // List of popular artists to test with
    const testArtists = [
      'Taylor Swift',
      'The Beatles',
      'BTS',
      'Kendrick Lamar',
      'Billie Eilish',
      'Queen',
      'Drake',
      'Ariana Grande'
    ];
    
    const imagesMap = await spotifyService.getMultipleArtistImages(testArtists);
    
    // Convert the results to an array for display
    const results = testArtists.map(name => ({
      name,
      url: imagesMap[name] || null
    }));
    
    multipleResults.value = results;
  } catch (err) {
    console.error('Error testing multiple artists:', err);
    error.value = `Error: ${err.message || 'Failed to test multiple artists'}`;
  } finally {
    isTestingMultiple.value = false;
  }
}
</script> 