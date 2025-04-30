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
        <span v-if="isDarkMode" class="toggle-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          Switch to Light Mode
        </span>
        <span v-else class="toggle-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          Switch to Dark Mode
        </span>
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
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.theme-toggle-btn {
  background-color: #333;
  color: white;
  padding: 10px 18px;
  font-size: 14px;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border-left: 3px solid #ff5252;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.theme-toggle-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.theme-toggle-btn:hover {
  background-color: #444;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.theme-toggle-btn:hover::after {
  transform: translateX(100%);
}

.theme-toggle-btn:active {
  transform: translateY(0);
}

.toggle-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  flex-shrink: 0;
}
</style> 