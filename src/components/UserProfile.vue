<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useUserStore } from "../stores/user";

// Props
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

// Initialize store
const userStore = useUserStore();

// Reactive state
const isLoading = computed(() => userStore.loading);
const error = computed(() => userStore.error);
const userInfo = computed(() => userStore.userInfo ? userStore.userInfo.user : null);
const userImage = computed(() => userStore.userImage);
const userStats = computed(() => userStore.userStats);
const registrationInfo = computed(() => userStore.registrationInfo);

// Watch for username changes
watch(() => props.username, async (newUsername) => {
  if (newUsername) {
    await fetchUserInfo(newUsername);
  }
});

// Fetch user data
async function fetchUserInfo(username) {
  try {
    await userStore.fetchUserInfo(username);
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
}

// Fetch initial data on component mount
onMounted(async () => {
  if (props.username) {
    await fetchUserInfo(props.username);
  }
});
</script>

<template>
  <div class="user-profile bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
    <div class="bg-gradient-to-r from-purple-300 via-teal-300 to-blue-400 text-black p-4">
      <h2 class="m-0 text-xl font-bold">User Profile</h2>
    </div>
    
    <div class="p-6">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <div class="loader">
          <svg class="animate-spin h-10 w-10 text-purple-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-gray-400">Loading user data...</p>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="bg-red-900 bg-opacity-20 border border-red-700 text-red-200 p-4 rounded-lg">
        <h3 class="text-lg font-semibold mb-2">Error loading user data</h3>
        <p>{{ error.message }}</p>
      </div>
      
      <!-- User profile content -->
      <div v-else-if="userInfo" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Profile image and basic info -->
        <div class="flex flex-col items-center text-center">
          <div class="mb-4 w-32 h-32 rounded-full overflow-hidden border-4 border-purple-400">
            <img 
              v-if="userImage" 
              :src="userImage" 
              :alt="userInfo.name" 
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gray-800 flex items-center justify-center">
              <span class="text-4xl text-gray-500">{{ userInfo.name.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-white mb-1">{{ userInfo.name }}</h3>
          <p v-if="userInfo.realname" class="text-gray-400 mb-4">{{ userInfo.realname }}</p>
          
          <a 
            :href="userInfo.url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-purple-300 hover:text-purple-200 transition-colors"
          >
            View Last.fm Profile
          </a>
        </div>
        
        <!-- User statistics -->
        <div class="col-span-2">
          <h3 class="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Profile Stats</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Statistics grid -->
            <div v-if="userStats" class="stat-grid space-y-3">
              <div class="stat-item">
                <span class="stat-label">Total Plays</span>
                <span class="stat-value">{{ userStats.playcount }}</span>
              </div>
              
              <div class="stat-item">
                <span class="stat-label">Playlists</span>
                <span class="stat-value">{{ userStats.playlists }}</span>
              </div>
              
              <div class="stat-item">
                <span class="stat-label">Country</span>
                <span class="stat-value">{{ userStats.country }}</span>
              </div>
              
              <div v-if="userStats.age !== 'Unknown'" class="stat-item">
                <span class="stat-label">Age</span>
                <span class="stat-value">{{ userStats.age }}</span>
              </div>
              
              <div v-if="userStats.subscriber" class="stat-item">
                <span class="stat-label">Subscriber</span>
                <span class="stat-value">
                  <span class="px-2 py-1 bg-green-900 text-green-300 text-xs font-semibold rounded-full">Pro</span>
                </span>
              </div>
            </div>
            
            <!-- Registration info -->
            <div v-if="registrationInfo" class="space-y-3">
              <div class="stat-item">
                <span class="stat-label">Member Since</span>
                <span class="stat-value">{{ registrationInfo.date }}</span>
              </div>
              
              <div v-if="registrationInfo.years !== 'Unknown'" class="stat-item">
                <span class="stat-label">Years on Last.fm</span>
                <span class="stat-value">{{ registrationInfo.years }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No data state -->
      <div v-else class="text-center py-8 text-gray-400">
        <p>No user data available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-grid {
  display: flex;
  flex-direction: column;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.stat-label {
  color: #a0aec0;
  font-size: 0.875rem;
}

.stat-value {
  color: #f7fafc;
  font-weight: 600;
}
</style> 