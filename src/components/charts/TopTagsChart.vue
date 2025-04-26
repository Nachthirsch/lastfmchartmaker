<template>
  <div class="top-tags-chart">
    <div class="chart-header">
      <h2 class="chart-title">TOP TAGS</h2>
    </div>
    
    <div class="chart-container">
      <!-- Main visualization -->
      <div v-if="!loading && !error && displayedTags.length > 0" class="chart-visualization">
        <div class="time-indicator">
          <span>{{ timeRange.start }}</span>
          <div class="time-line"></div>
          <span>{{ timeRange.end }}</span>
        </div>
        
        <div class="tags-grid">
          <div 
            v-for="(tag, index) in displayedTags" 
            :key="tag.name"
            class="tag-item"
            :style="{ 
              '--animation-delay': `${index * 0.12}s`,
              '--tag-color': tag.color,
              '--tag-gradient': tag.gradient,
              '--tag-order': index
            }"
          >
            <div class="tag-rank">{{ index + 1 }}</div>
            <div class="tag-bar-container">
              <div class="tag-bar">
                <div class="tag-fill" :style="{ width: `${getPercentage(tag.count)}%` }"></div>
                <div class="tag-glow"></div>
                <div class="tag-pulse"></div>
              </div>
              
              <div class="tag-details">
                <span class="tag-name">{{ tag.name }}</span>
                <span class="tag-count">{{ tag.count }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="decoration-element decoration-top-right"></div>
        <div class="decoration-element decoration-bottom-left"></div>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="!loading && !error && displayedTags.length === 0" class="chart-empty">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="76" height="76">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"></circle>
            <path d="M9 10 A 3 3 0 0 1 15 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M9 16 A 3 3 0 0 0 15 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
        </div>
        <p>No tags data available</p>
        <small>Try another username or time period</small>
      </div>
      
      <!-- Loading state -->
      <div v-else-if="loading" class="chart-loading">
        <div class="loading-animation">
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
        </div>
        <span>Gathering your tags</span>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="chart-error">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" width="54" height="54">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"></circle>
            <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></line>
            <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></line>
          </svg>
        </div>
        <p>{{ error.message }}</p>
        <small>Please try again later</small>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useTagsStore } from '../../stores/tags';

export default {
  name: 'TopTagsChart',
  props: {
    username: {
      type: String,
      default: '',
    },
    maxTags: {
      type: Number,
      default: 8
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 450
    }
  },
  setup(props) {
    const tagsStore = useTagsStore();
    const loading = computed(() => tagsStore.loading);
    const error = computed(() => tagsStore.error);
    
    // Time range display values
    const timeRange = ref({
      start: '1 Apr',
      end: '30 Apr'
    });
    
    // Get max count for percentage calculations
    const maxCount = computed(() => {
      if (!tagsStore.topTags || tagsStore.topTags.length === 0) return 0;
      return Math.max(...tagsStore.topTags.map(tag => parseInt(tag.count)));
    });
    
    // Calculate percentage for bar width
    const getPercentage = (count) => {
      if (maxCount.value === 0) return 0;
      return (parseInt(count) / maxCount.value) * 100;
    };
    
    // Process tags data for visualization
    const displayedTags = computed(() => {
      if (!tagsStore.topTags.length) {
        return [];
      }
      
      // Take top N tags
      return tagsStore.topTags
        .filter(tag => tag && tag.name && tag.count)
        .slice(0, props.maxTags)
        .map((tag, index) => {
          const { color, gradient } = getTagColors(index);
          return {
            ...tag,
            color,
            gradient
          };
        });
    });
    
    // Generate vibrant colors with gradients
    const getTagColors = (index) => {
      // Vibrant color palette
      const colorPairs = [
        { 
          color: 'rgba(14, 165, 233, 0.95)', 
          gradient: 'linear-gradient(90deg, rgba(14, 165, 233, 0.95) 0%, rgba(56, 189, 248, 0.95) 100%)' 
        }, // Sky blue
        { 
          color: 'rgba(253, 186, 116, 0.95)', 
          gradient: 'linear-gradient(90deg, rgba(253, 186, 116, 0.95) 0%, rgba(251, 146, 60, 0.95) 100%)' 
        }, // Orange
        { 
          color: 'rgba(134, 239, 172, 0.95)', 
          gradient: 'linear-gradient(90deg, rgba(52, 211, 153, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)' 
        }, // Green
        { 
          color: 'rgba(196, 181, 253, 0.95)', 
          gradient: 'linear-gradient(90deg, rgba(196, 181, 253, 0.95) 0%, rgba(167, 139, 250, 0.95) 100%)' 
        }, // Purple
        { 
          color: 'rgba(248, 113, 113, 0.95)', 
          gradient: 'linear-gradient(90deg, rgba(248, 113, 113, 0.95) 0%, rgba(239, 68, 68, 0.95) 100%)' 
        }, // Red
        { 
          color: 'rgba(20, 184, 166, 0.95)', 
          gradient: 'linear-gradient(90deg, rgba(20, 184, 166, 0.95) 0%, rgba(13, 148, 136, 0.95) 100%)' 
        }, // Teal
        { 
          color: 'rgba(251, 113, 133, 0.95)', 
          gradient: 'linear-gradient(90deg, rgba(251, 113, 133, 0.95) 0%, rgba(244, 63, 94, 0.95) 100%)' 
        }, // Pink
        { 
          color: 'rgba(234, 179, 8, 0.95)', 
          gradient: 'linear-gradient(90deg, rgba(234, 179, 8, 0.95) 0%, rgba(202, 138, 4, 0.95) 100%)' 
        }, // Yellow
      ];
      
      return colorPairs[index % colorPairs.length];
    };
    
    // Fetch data if username is provided
    onMounted(async () => {
      console.log('TopTagsChart mounted, username:', props.username);
      // Keeping the same approach as before
    });
    
    return {
      tagsStore,
      loading,
      error, 
      timeRange,
      displayedTags,
      getPercentage
    };
  }
}
</script>

<style scoped>
/* Base styles */
.top-tags-chart {
  --chart-bg: rgba(15, 23, 42, 0.97);
  --chart-bg-lighter: rgba(30, 41, 59, 0.8);
  --chart-text: #ffffff;
  --chart-text-secondary: rgba(255, 255, 255, 0.65);
  --chart-accent: #0ea5e9;
  --chart-accent-hover: #38bdf8;
  --chart-line: rgba(255, 255, 255, 0.15);
  --chart-border-radius: 18px;
  --chart-animation-duration: 0.8s;
  
  width: 100%;
  color: var(--chart-text);
  font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
  margin: 2rem auto;
  user-select: none;
}

/* Header styling */
.chart-header {
  padding-bottom: 1.75rem;
  position: relative;
}

.chart-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  margin: 0;
  position: relative;
  display: inline-block;
  text-transform: uppercase;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.chart-title::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -12px;
  width: 70px;
  height: 4px;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  border-radius: 8px;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.8; width: 40px; }
  50% { opacity: 1; width: 70px; }
  100% { opacity: 0.8; width: 40px; }
}

/* Main container */
.chart-container {
  background: var(--chart-bg);
  border-radius: var(--chart-border-radius);
  overflow: hidden;
  padding: 2.5rem;
  box-shadow: 
    0 10px 30px -5px rgba(0, 0, 0, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  min-height: 380px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(
      circle at top right,
      rgba(56, 189, 248, 0.2),
      transparent 60%
    );
  z-index: -1;
}

/* Decorative elements */
.decoration-element {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.15;
  z-index: -1;
}

.decoration-top-right {
  top: -20px;
  right: 10%;
  width: 150px;
  height: 150px;
  background: rgba(56, 189, 248, 0.5);
  animation: pulse-glow 8s ease-in-out infinite;
}

.decoration-bottom-left {
  bottom: -30px;
  left: 15%;
  width: 120px;
  height: 120px;
  background: rgba(192, 132, 252, 0.5);
  animation: pulse-glow 8s ease-in-out infinite 2s;
}

@keyframes pulse-glow {
  0% { transform: scale(0.8); opacity: 0.1; }
  50% { transform: scale(1.2); opacity: 0.2; }
  100% { transform: scale(0.8); opacity: 0.1; }
}

/* Time indicator */
.time-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 0.5rem 0;
  color: var(--chart-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.time-line {
  flex: 1;
  height: 1px;
  background: var(--chart-line);
  margin: 0 1rem;
  position: relative;
}

.time-line::before,
.time-line::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--chart-accent);
  border-radius: 50%;
  top: -2.5px;
}

.time-line::before {
  left: 0;
}

.time-line::after {
  right: 0;
}

/* Tags grid */
.tags-grid {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  position: relative;
  z-index: 2;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  animation: slideIn var(--chart-animation-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: var(--animation-delay);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Tag rank */
.tag-rank {
  width: 28px;
  height: 28px;
  background: var(--chart-bg-lighter);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--chart-text);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* Tag bar container */
.tag-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

/* Tag bars and details */
.tag-bar {
  height: 8px;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.tag-fill {
  height: 100%;
  background: var(--tag-gradient, var(--chart-accent));
  border-radius: 6px;
  transform-origin: left;
  animation: growWidth var(--chart-animation-duration) cubic-bezier(0.26, 0.86, 0.44, 0.98) forwards;
  animation-delay: calc(var(--animation-delay) + 0.2s);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@keyframes growWidth {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.tag-glow {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 15px;
  background: var(--tag-color, var(--chart-accent));
  filter: blur(8px);
  opacity: 0.7;
}

.tag-pulse {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  background: var(--tag-color, var(--chart-accent));
  filter: blur(5px);
  opacity: 0;
  animation: pulse 2s ease-in-out infinite;
  animation-delay: calc(var(--animation-delay) + 1s);
}

@keyframes pulse {
  0% { opacity: 0; transform: translateX(-10px) scaleX(1); }
  50% { opacity: 0.8; transform: translateX(0) scaleX(1.5); }
  100% { opacity: 0; transform: translateX(10px) scaleX(1); }
}

.tag-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.tag-name {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tag-count {
  font-size: 0.825rem;
  font-weight: 700;
  color: var(--tag-color, var(--chart-accent));
  background: rgba(0, 0, 0, 0.25);
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* States styling */
.chart-empty,
.chart-loading,
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 300px;
  gap: 1.5rem;
  color: var(--chart-text-secondary);
}

/* Empty state */
.empty-icon svg {
  color: var(--chart-text-secondary);
  opacity: 0.5;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.chart-empty p {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 600;
  color: var(--chart-text);
}

/* Loading state */
.loading-animation {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 60px;
  gap: 5px;
}

.loading-bar {
  background: var(--chart-accent);
  width: 6px;
  height: 20px;
  border-radius: 3px;
  animation: loadingBar 1.4s ease-in-out infinite;
}

.loading-bar:nth-child(1) { animation-delay: 0s; }
.loading-bar:nth-child(2) { animation-delay: 0.2s; }
.loading-bar:nth-child(3) { animation-delay: 0.4s; }
.loading-bar:nth-child(4) { animation-delay: 0.6s; }
.loading-bar:nth-child(5) { animation-delay: 0.8s; }

@keyframes loadingBar {
  0%, 100% {
    height: 10px;
    background: rgba(56, 189, 248, 0.6);
  }
  50% {
    height: 60px;
    background: rgba(56, 189, 248, 1);
  }
}

.chart-loading span {
  font-size: 1.1rem;
  font-weight: 500;
  margin-top: 1rem;
}

/* Error state */
.error-icon svg {
  color: rgba(239, 68, 68, 0.9);
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.chart-error p {
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  color: rgba(239, 68, 68, 0.9);
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-container {
    padding: 1.75rem;
  }
  
  .chart-title {
    font-size: 1.5rem;
  }
  
  .tags-grid {
    gap: 1.5rem;
  }
  
  .tag-item {
    gap: 1rem;
  }
  
  .tag-name {
    font-size: 0.925rem;
  }
  
  .tag-count {
    font-size: 0.775rem;
    padding: 0.25rem 0.5rem;
  }
}

/* Dark glass effect for modern browsers */
@supports (backdrop-filter: blur(10px)) {
  .chart-container {
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(16px);
  }
}

/* Hover effects */
.tag-item:hover .tag-bar {
  transform: scaleY(1.8);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.tag-item:hover .tag-name {
  color: var(--chart-accent-hover);
  transition: all 0.3s ease;
  transform: translateX(3px);
}

.tag-item:hover .tag-count {
  transform: scale(1.1);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.tag-item:hover .tag-glow {
  opacity: 1;
  width: 30px;
  filter: blur(10px);
  transition: all 0.4s ease;
}

.tag-item:hover .tag-rank {
  background: var(--tag-color);
  color: white;
  transform: scale(1.1);
  transition: all 0.3s ease;
}
</style> 