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
    <div class="info-banner">
      <div class="info-icon">i</div>
      <p>Create a shareable image of your Last.fm music stats. Choose a theme below and click 'Generate Share Image'.</p>
    </div>
    
    <div class="theme-toggle">
      <button @click="toggleTheme" class="theme-toggle-btn" :class="{ 'dark-active': isDarkMode, 'light-active': !isDarkMode }">
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
    
    <div class="card-container" :class="{ 'dark-mode': isDarkMode }">
      <ShareCardLight v-if="!isDarkMode" :username="username" :period="period" />
      <ShareCardDark v-else :username="username" :period="period" />
    </div>
    
    <div class="sharing-tips">
      <h3>Sharing Tips</h3>
      <ul>
        <li>The generated image will be saved to your downloads folder</li>
        <li>Perfect for sharing on Instagram, Twitter, or Discord</li>
        <li>Image dimensions: 400x711px</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.theme-selector-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 40px;
}

.info-banner {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: rgba(255, 82, 82, 0.1);
  border-left: 4px solid #ff5252;
  margin-bottom: 20px;
  width: 100%;
  max-width: 500px;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #ff5252;
  color: white;
  font-weight: bold;
  font-size: 14px;
  margin-right: 12px;
  flex-shrink: 0;
}

.info-banner p {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
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
  padding: 12px 20px;
  font-size: 14px;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-left: 3px solid #ff5252;
  font-weight: 500;
  letter-spacing: 0.3px;
  min-width: 220px;
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
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.theme-toggle-btn:hover::after {
  transform: translateX(100%);
}

.theme-toggle-btn:active {
  transform: translateY(0);
}

.light-active {
  background-color: #f8f8f8;
  color: #333;
  border-left: 3px solid #ff5252;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dark-active {
  background-color: #222;
  color: white;
  border-left: 3px solid #ff5252;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.toggle-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  flex-shrink: 0;
}

.card-container {
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  justify-content: center;
}

.dark-mode {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 20px;
  border-radius: 4px;
}

.sharing-tips {
  margin-top: 30px;
  padding: 15px;
  border-top: 1px dashed #ddd;
  max-width: 500px;
  width: 100%;
}

.sharing-tips h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
  position: relative;
  display: inline-block;
  padding-left: 10px;
}

.sharing-tips h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: #ff5252;
}

.sharing-tips ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sharing-tips li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.sharing-tips li::before {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: #ff5252;
  font-size: 18px;
  line-height: 1;
}

@media screen and (max-width: 600px) {
  .info-banner,
  .sharing-tips {
    max-width: 100%;
  }
  
  .theme-toggle-btn {
    font-size: 13px;
    padding: 10px 15px;
    min-width: 200px;
  }
}
</style> 