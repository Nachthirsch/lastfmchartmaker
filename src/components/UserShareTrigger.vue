<script setup>
import { ref } from "vue";
import ShareCard from "./ShareCard.vue";

// Props
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

// Reactive state
const showShareCard = ref(false);
const selectedPeriod = ref("overall");

// Available time periods
const timePeriods = [
  { value: "overall", label: "All Time" },
  { value: "7day", label: "Last 7 Days" },
  { value: "1month", label: "Last Month" },
  { value: "3month", label: "Last 3 Months" },
  { value: "6month", label: "Last 6 Months" },
  { value: "12month", label: "Last Year" },
];

// Toggle share card visibility
function toggleShareCard() {
  showShareCard.value = !showShareCard.value;
}
</script>

<template>
  <div class="user-share-trigger">
    <!-- Share button -->
    <button @click="toggleShareCard" class="share-button">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
      </svg>
      Create Share Image
    </button>

    <!-- Share card modal -->
    <div v-if="showShareCard" class="share-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Create Last.fm Share Image</h3>
          <button @click="toggleShareCard" class="close-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        
        <div class="time-period-selection">
          <label for="period-select">Time Period:</label>
          <select id="period-select" v-model="selectedPeriod" class="period-select">
            <option v-for="period in timePeriods" :key="period.value" :value="period.value">
              {{ period.label }}
            </option>
          </select>
        </div>
        
        <div class="fixed-size-note">
          <span>Note:</span> The generated image will be 400x711px regardless of device size
        </div>
        
        <div class="modal-body">
          <ShareCard :username="username" :period="selectedPeriod" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-share-trigger {
  position: relative;
}

.share-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  font-weight: 700;
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.share-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-content {
  background-color: white;
  border: 4px solid #000;
  box-shadow: 8px 8px 0px #000;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden; /* Hide any overflowing content */
}

.modal-header {
  background-image: linear-gradient(to right, #ff69b4, #4dd4ac, #9b5de5);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #000;
}

.close-button {
  background: black;
  border: 2px solid #000;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s;
}

.close-button:hover {
  transform: scale(1.1);
}

.time-period-selection {
  padding: 15px 20px;
  border-bottom: 3px solid #000;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f8f8f8;
}

.period-select {
  padding: 8px 12px;
  border: 2px solid #000;
  background-color: white;
  color: #000;
  font-weight: 600;
  flex-grow: 1;
}

label {
  font-weight: 700;
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
  display: flex;
  justify-content: center;
}

/* Fixed size info */
.fixed-size-note {
  text-align: center;
  padding: 8px 0;
  background-color: #f0f0f0;
  border-bottom: 2px solid #ddd;
  font-size: 0.9rem;
  color: #333;
}

.fixed-size-note span {
  font-weight: bold;
}

/* Enhanced mobile responsiveness */
@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    height: auto;
    max-height: 95vh;
    margin: 0;
    box-shadow: none;
  }
  
  .share-modal {
    padding: 0;
    align-items: center;
  }
  
  .modal-body {
    padding: 10px 5px;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 10px 15px;
  }
  
  .modal-title {
    font-size: 1rem;
  }
  
  .time-period-selection {
    padding: 10px 15px;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .period-select {
    width: 100%;
  }
  
  .close-button {
    width: 28px;
    height: 28px;
  }
}
</style> 