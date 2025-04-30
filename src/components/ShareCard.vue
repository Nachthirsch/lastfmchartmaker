<script setup>
import { ref } from "vue";
import ShareCardLight from "./ShareCardLight.vue";
import ShareCardDark from "./ShareCardDark.vue";

// Props and emits
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    default: "overall", // overall, 7day, 1month, 3month, 6month, 12month
  },
});

// Mode switching
const isDarkMode = ref(false);

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
}
</script>

<template>
  <div class="theme-selector-container">
    <div class="theme-toggle">
      <button @click="toggleTheme" class="theme-toggle-btn">
        <span v-if="isDarkMode">Switch to Light Mode</span>
        <span v-else>Switch to Dark Mode</span>
      </button>
    </div>
    
    <ShareCardLight v-if="!isDarkMode" :username="username" :period="period" />
    <ShareCardDark v-else :username="username" :period="period" />
  </div>
</template>

<style scoped>
.theme-selector-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.theme-toggle {
  margin-bottom: 15px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.theme-toggle-btn {
  background-color: #333;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.theme-toggle-btn:hover {
  background-color: #444;
}
</style> 