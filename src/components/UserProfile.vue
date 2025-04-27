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
const userInfo = computed(() => (userStore.userInfo ? userStore.userInfo.user : null));
const userImage = computed(() => userStore.userImage);
const userStats = computed(() => userStore.userStats);
const registrationInfo = computed(() => userStore.registrationInfo);

// Watch for username changes
watch(
  () => props.username,
  async (newUsername) => {
    if (newUsername) {
      await fetchUserInfo(newUsername);
    }
  }
);

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
  <div class="user-profile">
    <div class="profile-header">
      <h2 class="profile-title">User Profile</h2>
    </div>

    <div class="profile-content">
      <!-- Loading state -->
      <div v-if="isLoading" class="loading-container">
        <div class="loader">
          <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="loading-text">Loading user data...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <h3 class="error-title">Error loading user data</h3>
        <p class="error-message">{{ error.message }}</p>
      </div>

      <!-- User profile content -->
      <div v-else-if="userInfo" class="profile-grid">
        <!-- Profile image and basic info -->
        <div class="profile-basic-info">
          <div class="profile-image-container">
            <img v-if="userImage" :src="userImage" :alt="userInfo.name" class="profile-image" />
            <div v-else class="profile-image-placeholder">
              <span>{{ userInfo.name.charAt(0).toUpperCase() }}</span>
            </div>
          </div>

          <h3 class="username">{{ userInfo.name }}</h3>
          <p v-if="userInfo.realname" class="realname">{{ userInfo.realname }}</p>

          <a :href="userInfo.url" target="_blank" rel="noopener noreferrer" class="lastfm-profile-link">
            View Last.fm Profile
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a.5.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
              <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
            </svg>
          </a>
        </div>

        <!-- User statistics -->
        <div class="profile-stats-container">
          <h3 class="section-title">Profile Stats</h3>

          <div class="stats-grid">
            <!-- Statistics grid -->
            <div v-if="userStats" class="stats-column">
              <div class="stat-box">
                <span class="stat-value">{{ userStats.playcount }}</span>
                <span class="stat-label">Total Plays</span>
              </div>

              <div class="stat-box">
                <span class="stat-value">{{ userStats.playlists }}</span>
                <span class="stat-label">Playlists</span>
              </div>

              <div class="stat-box">
                <span class="stat-value">{{ userStats.country || "Unknown" }}</span>
                <span class="stat-label">Country</span>
              </div>

              <div v-if="userStats.age !== 'Unknown'" class="stat-box">
                <span class="stat-value">{{ userStats.age }}</span>
                <span class="stat-label">Age</span>
              </div>

              <div v-if="userStats.subscriber" class="stat-box subscriber">
                <span class="stat-value">Pro User</span>
                <span class="stat-label">Subscriber</span>
              </div>
            </div>

            <!-- Registration info -->
            <div v-if="registrationInfo" class="stats-column registration-info">
              <div class="stat-box">
                <span class="stat-value">{{ registrationInfo.date }}</span>
                <span class="stat-label">Member Since</span>
              </div>

              <div v-if="registrationInfo.years !== 'Unknown'" class="stat-box">
                <span class="stat-value">{{ registrationInfo.years }}</span>
                <span class="stat-label">Years on Last.fm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No data state -->
      <div v-else class="no-data">
        <p>No user data available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  background-color: #fff;
  border: 4px solid #000;
  box-shadow: 8px 8px 0px #000;
  overflow: hidden;
  position: relative;
  margin-bottom: 2rem;
}

.profile-header {
  background-image: linear-gradient(to right, #ff69b4, #4dd4ac, #9b5de5);
  padding: 1.25rem;
  position: relative;
}

.profile-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #000;
  transform: rotate(-1deg);
}

.profile-content {
  padding: 1.5rem;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.spinner {
  animation: spin 1s linear infinite;
  width: 3rem;
  height: 3rem;
}

.spinner-track {
  opacity: 0.25;
}

.spinner-path {
  opacity: 0.75;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 1rem;
  font-weight: 600;
  color: #666;
}

.error-container {
  border: 3px dashed #ff0066;
  background-color: #fff0f5;
  padding: 1.5rem;
  margin: 0.5rem;
}

.error-title {
  color: #ff0066;
  margin-top: 0;
  font-weight: 800;
  text-transform: uppercase;
}

.error-message {
  color: #333;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.profile-basic-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.profile-image-container {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 4px solid #000;
  box-shadow: 6px 6px 0px #000;
  margin-bottom: 1.25rem;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #000;
  font-size: 4rem;
  font-weight: 900;
}

.username {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #000;
  position: relative;
  z-index: 1;
}

.username::after {
  content: "";
  position: absolute;
  bottom: 2px;
  left: 0;
  width: 100%;
  height: 8px;
  background-color: #ff69b4;
  z-index: -1;
  transform: rotate(-1deg);
}

.realname {
  color: #666;
  margin: 0.5rem 0 1.25rem;
  font-size: 1.1rem;
}

.lastfm-profile-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #d51007;
  color: white;
  padding: 0.5rem 1rem;
  font-weight: 700;
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.lastfm-profile-link:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.profile-stats-container {
  position: relative;
}

.section-title {
  text-transform: uppercase;
  font-weight: 900;
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 4px solid #000;
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

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.stats-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-box {
  border: 3px solid #000;
  padding: 1rem;
  background-color: #f8f8f8;
  box-shadow: 4px 4px 0px #000;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  font-size: 1.4rem;
  font-weight: 800;
  color: #000;
}

.stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #666;
  margin-top: 0.25rem;
}

.subscriber .stat-value {
  background-color: #4caf50;
  color: white;
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 1rem;
  align-self: flex-start;
}

.no-data {
  text-align: center;
  padding: 3rem 1rem;
  font-weight: 600;
  color: #666;
  background-color: #f8f8f8;
  border: 3px dashed #ccc;
  margin: 0.5rem;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-image-container {
    width: 150px;
    height: 150px;
    margin-bottom: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
