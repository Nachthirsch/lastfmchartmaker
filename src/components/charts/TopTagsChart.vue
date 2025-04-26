<template>
  <div class="top-tags-chart">
    <div class="chart-header">
      <h2 class="chart-title">TOP TAGS</h2>
      <button @click="shareTagsChart" class="share-button">
        <span class="share-text">Share</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
        </svg>
      </button>
    </div>
    
    <div class="chart-container">
      <!-- Main visualization - Tag Constellation -->
      <div 
        ref="chartRef" 
        v-if="!loading && !error && displayedTags.length > 0" 
        class="constellation-visualization"
      >
        <div class="time-period">{{ timeRange.start }} - {{ timeRange.end }}</div>
        
        <div class="constellation-container" ref="constellationContainer">
          <!-- Central tag -->
          <div v-if="displayedTags[0]" class="tag-star central-star" @mouseover="setActiveTag(displayedTags[0])" @mouseleave="setActiveTag(null)">
            <div class="tag-star-inner" :style="{ backgroundColor: displayedTags[0].color }">
              <div class="tag-star-pulse" :style="{ borderColor: displayedTags[0].color }"></div>
            </div>
            <div class="tag-star-label">{{ displayedTags[0].name }}</div>
        </div>
        
          <!-- Orbital tags -->
          <div 
            v-for="(tag, index) in displayedTags.slice(1)" 
            :key="tag.name"
            class="tag-star" 
            :class="{ 'tag-star-active': activeTag && activeTag.name === tag.name }"
            :style="{ 
              '--rotation-angle': `${(index * 40) % 360}deg`,
              '--orbit-size': `${getOrbitSize(index)}px`,
              '--animation-delay': `${index * 0.5}s`,
              '--tag-color': tag.color,
              '--tag-size': `${getTagSize(tag.count)}px`
            }"
            @mouseover="setActiveTag(tag)"
            @mouseleave="setActiveTag(null)"
          >
            <div class="tag-star-inner" :style="{ backgroundColor: tag.color }">
              <div class="tag-star-pulse" :style="{ borderColor: tag.color }"></div>
            </div>
            <div class="tag-star-label">{{ tag.name }}</div>
              </div>
              
          <!-- Connection lines between related tags -->
          <svg class="constellation-connections" ref="connectionsSvg">
            <!-- Lines will be drawn dynamically with JavaScript -->
          </svg>
          
          <!-- Tag details popup -->
          <div v-if="activeTag" class="tag-details-popup" :style="{ top: tagPopupPosition.top + 'px', left: tagPopupPosition.left + 'px' }">
            <h3>{{ activeTag.name }}</h3>
            <div class="tag-weight">Weight: {{ activeTag.count }}</div>
            <a :href="activeTag.url" target="_blank" class="tag-link">View on Last.fm</a>
              </div>
            </div>
        
        <!-- Tag legend -->
        <div class="tag-legend">
          <div v-for="(tag, index) in displayedTags.slice(0, 5)" :key="`legend-${tag.name}`" class="legend-item">
            <div class="legend-color" :style="{ backgroundColor: tag.color }"></div>
            <div class="legend-text">
              <div class="legend-name">{{ tag.name }}</div>
              <div class="legend-count">{{ tag.count }}</div>
          </div>
        </div>
        </div>
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
          <div class="loading-star"></div>
          <div class="loading-orbit">
            <div class="loading-planet"></div>
        </div>
          <div class="loading-orbit outer-orbit">
            <div class="loading-planet"></div>
          </div>
        </div>
        <span>Discovering your musical universe</span>
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
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import { useTagsStore } from '../../stores/tags';
import html2canvas from 'html2canvas';

export default {
  name: 'TopTagsChart',
  props: {
    username: {
      type: String,
      default: '',
    },
    period: {
      type: String,
      default: 'overall'
    },
    maxTags: {
      type: Number,
      default: 20 // Increased from 8 to show more in the constellation
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 600 // Increased for better visualization
    }
  },
  setup(props) {
    const tagsStore = useTagsStore();
    const loading = computed(() => tagsStore.loading);
    const error = computed(() => tagsStore.error);
    const chartRef = ref(null);
    const constellationContainer = ref(null);
    const connectionsSvg = ref(null);
    const activeTag = ref(null);
    const tagPopupPosition = ref({ top: 0, left: 0 });
    
    // Time range display values based on period prop
    const timeRange = computed(() => {
      const periodValue = props.period || 'overall';
      
      switch (periodValue) {
        case '7day': return { start: 'Last Week', end: 'Now' };
        case '1month': return { start: 'Last Month', end: 'Now' };
        case '3month': return { start: '3 Months Ago', end: 'Now' };
        case '6month': return { start: '6 Months Ago', end: 'Now' };
        case '12month': return { start: 'Last Year', end: 'Now' };
        case 'overall': return { start: 'All Time', end: 'Now' };
        default: return { start: 'All Time', end: 'Now' };
      }
    });
    
    // Get max count for percentage calculations
    const maxCount = computed(() => {
      if (!tagsStore.topTags || tagsStore.topTags.length === 0) return 0;
      return Math.max(...tagsStore.topTags.map(tag => parseInt(tag.count)));
    });
    
    // Calculate percentage for sizing elements
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
            gradient,
            size: getTagSize(tag.count),
            orbitIndex: index
          };
        });
    });
    
    // Calculate orbit size based on tag index
    const getOrbitSize = (index) => {
      // Create different orbital rings
      const baseSize = 120;
      const orbitGroup = Math.floor(index / 5) + 1; // Groups of 5 tags per orbit
      return baseSize * orbitGroup;
    };
    
    // Calculate tag size based on count
    const getTagSize = (count) => {
      const percentage = getPercentage(count);
      // Min size 20px, max size 60px
      return 20 + (percentage * 0.4);
    };
    
    // Generate vibrant colors with gradients
    const getTagColors = (index) => {
      // Expanded cosmic color palette
      const colorPairs = [
        { 
          color: 'rgba(255, 190, 11, 0.95)', // Gold
          gradient: 'linear-gradient(90deg, rgba(255, 190, 11, 0.95), rgba(251, 219, 101, 0.95))' 
        },
        { 
          color: 'rgba(45, 149, 214, 0.95)', // Blue
          gradient: 'linear-gradient(90deg, rgba(45, 149, 214, 0.95), rgba(91, 192, 235, 0.95))' 
        },
        { 
          color: 'rgba(205, 55, 242, 0.95)', // Purple
          gradient: 'linear-gradient(90deg, rgba(205, 55, 242, 0.95), rgba(249, 145, 255, 0.95))' 
        },
        { 
          color: 'rgba(250, 82, 82, 0.95)', // Red
          gradient: 'linear-gradient(90deg, rgba(250, 82, 82, 0.95), rgba(252, 136, 136, 0.95))' 
        },
        { 
          color: 'rgba(25, 211, 174, 0.95)', // Teal
          gradient: 'linear-gradient(90deg, rgba(25, 211, 174, 0.95), rgba(111, 237, 214, 0.95))' 
        },
        { 
          color: 'rgba(255, 135, 171, 0.95)', // Pink
          gradient: 'linear-gradient(90deg, rgba(255, 135, 171, 0.95), rgba(255, 181, 203, 0.95))' 
        },
        { 
          color: 'rgba(138, 201, 38, 0.95)', // Green
          gradient: 'linear-gradient(90deg, rgba(138, 201, 38, 0.95), rgba(172, 234, 73, 0.95))' 
        },
        { 
          color: 'rgba(255, 159, 28, 0.95)', // Orange
          gradient: 'linear-gradient(90deg, rgba(255, 159, 28, 0.95), rgba(255, 187, 94, 0.95))' 
        },
        { 
          color: 'rgba(126, 87, 194, 0.95)', // Deep Purple
          gradient: 'linear-gradient(90deg, rgba(126, 87, 194, 0.95), rgba(173, 142, 230, 0.95))' 
        },
        {
          color: 'rgba(27, 156, 133, 0.95)', // Emerald
          gradient: 'linear-gradient(90deg, rgba(27, 156, 133, 0.95), rgba(70, 196, 174, 0.95))'
        }
      ];
      
      return colorPairs[index % colorPairs.length];
    };
    
    // Set active tag for hover effects and popup
    const setActiveTag = (tag) => {
      activeTag.value = tag;
      
      if (tag && constellationContainer.value) {
        // Find the tag element position to place the popup
        const tagElements = constellationContainer.value.querySelectorAll('.tag-star');
        for (let i = 0; i < tagElements.length; i++) {
          const tagEl = tagElements[i];
          if (tagEl.querySelector('.tag-star-label').textContent === tag.name) {
            const rect = tagEl.getBoundingClientRect();
            const containerRect = constellationContainer.value.getBoundingClientRect();
            
            // Position popup above the tag star
            tagPopupPosition.value = {
              top: rect.top - containerRect.top - 100,
              left: rect.left - containerRect.left
            };
            break;
          }
        }
      }
    };
    
    // Draw connection lines between related tags
    const drawConnections = () => {
      if (!connectionsSvg.value || displayedTags.value.length < 2) return;
      
      // Clear existing connections
      connectionsSvg.value.innerHTML = '';
      
      // Get container dimensions
      const containerWidth = constellationContainer.value.offsetWidth;
      const containerHeight = constellationContainer.value.offsetHeight;
      
      // Update SVG dimensions
      connectionsSvg.value.setAttribute('width', containerWidth);
      connectionsSvg.value.setAttribute('height', containerHeight);
      
      // Center point coordinates
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      
      // Connect main tag to its closest related tags
      const mainTag = displayedTags.value[0];
      
      // Draw connections from center to other tags
      displayedTags.value.slice(1, 8).forEach((tag, index) => {
        // Calculate position based on tag's orbit
        const angle = (index * 40) % 360;
        const orbitSize = getOrbitSize(index);
        const radians = angle * Math.PI / 180;
        
        const x = centerX + Math.cos(radians) * orbitSize;
        const y = centerY + Math.sin(radians) * orbitSize;
        
        // Create line element
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', mainTag.color);
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-opacity', '0.4');
        line.setAttribute('class', 'constellation-line');
        
        // Add line to SVG
        connectionsSvg.value.appendChild(line);
        
        // Add some connections between tags in the same orbit
        if (index > 0 && index < 7) {
          const prevIndex = index - 1;
          const prevAngle = (prevIndex * 40) % 360;
          const prevRadians = prevAngle * Math.PI / 180;
          
          const prevX = centerX + Math.cos(prevRadians) * orbitSize;
          const prevY = centerY + Math.sin(prevRadians) * orbitSize;
          
          // Create connection between adjacent tags
          const connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          connectionLine.setAttribute('x1', x);
          connectionLine.setAttribute('y1', y);
          connectionLine.setAttribute('x2', prevX);
          connectionLine.setAttribute('y2', prevY);
          connectionLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
          connectionLine.setAttribute('stroke-width', '1');
          connectionLine.setAttribute('stroke-dasharray', '4,4');
          connectionLine.setAttribute('class', 'constellation-connection');
          
          // Add line to SVG
          connectionsSvg.value.appendChild(connectionLine);
        }
      });
    };
    
    // Share tags chart functionality
    async function shareTagsChart() {
      console.log('[COMPONENT] Sharing tags constellation');
      
      try {
        // Create a new canvas-based chart
        const canvasWidth = 1080;
        const canvasHeight = 1500;
        
        // Create a new canvas element
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Fill background with a starry night effect
        ctx.fillStyle = 'rgb(10, 15, 30)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Add stars to background
        for (let i = 0; i < 200; i++) {
          const x = Math.random() * canvasWidth;
          const y = Math.random() * canvasHeight;
          const radius = Math.random() * 1.5;
          const opacity = Math.random() * 0.8 + 0.2;
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        }
        
        // Load and prepare fonts
        const fontFaceSet = document.fonts;
        await fontFaceSet.ready;
        
        // Draw header
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MY MUSIC UNIVERSE', canvasWidth / 2, 160);
        
        // Draw username if provided
        if (props.username) {
          ctx.fillStyle = 'rgba(255, 159, 28, 0.95)'; // Orange color
          ctx.font = '50px sans-serif';
          ctx.fillText(props.username, canvasWidth / 2, 240);
        }
        
        // Draw time range
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '36px sans-serif';
        ctx.fillText(`${timeRange.value.start} - ${timeRange.value.end}`, canvasWidth / 2, props.username ? 300 : 240);
        
        // Draw divider line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(canvasWidth / 2 - 60, props.username ? 340 : 280, 120, 2);
        
        // Draw constellation
        const centerX = canvasWidth / 2;
        const centerY = 600;
        
        // Draw connection lines first
        for (let i = 1; i < Math.min(displayedTags.value.length, 8); i++) {
          const angle = (i * 40) % 360;
          const orbitSize = getOrbitSize(i - 1);
          const radians = angle * Math.PI / 180;
          
          const x = centerX + Math.cos(radians) * orbitSize;
          const y = centerY + Math.sin(radians) * orbitSize;
          
          // Draw line from center to this tag
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = displayedTags.value[0].color;
          ctx.globalAlpha = 0.4;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
          
          // Draw some connections between adjacent tags
          if (i > 1 && i < 7) {
            const prevIndex = i - 1;
            const prevAngle = (prevIndex * 40) % 360;
            const prevRadians = prevAngle * Math.PI / 180;
            
            const prevX = centerX + Math.cos(prevRadians) * orbitSize;
            const prevY = centerY + Math.sin(prevRadians) * orbitSize;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(prevX, prevY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        
        // Draw central tag
        if (displayedTags.value.length > 0) {
          const mainTag = displayedTags.value[0];
          const mainTagSize = 60;
          
          // Draw star glow
          const gradient = ctx.createRadialGradient(centerX, centerY, mainTagSize / 2, centerX, centerY, mainTagSize * 1.5);
          gradient.addColorStop(0, mainTag.color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, mainTagSize * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Draw star
          ctx.beginPath();
          ctx.arc(centerX, centerY, mainTagSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = mainTag.color;
          ctx.fill();
          
          // Draw tag name
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(mainTag.name, centerX, centerY + mainTagSize + 20);
          
          // Draw tag count
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '24px sans-serif';
          ctx.fillText(mainTag.count, centerX, centerY + mainTagSize + 50);
        }
        
        // Draw orbital tags
        for (let i = 1; i < displayedTags.value.length && i < 15; i++) {
          const tag = displayedTags.value[i];
          const angle = (i * 40) % 360;
          const orbitSize = getOrbitSize(i - 1);
          const radians = angle * Math.PI / 180;
          const tagSize = getTagSize(tag.count) / 2;
          
          const x = centerX + Math.cos(radians) * orbitSize;
          const y = centerY + Math.sin(radians) * orbitSize;
          
          // Draw star glow
          const gradient = ctx.createRadialGradient(x, y, tagSize / 2, x, y, tagSize * 1.5);
          gradient.addColorStop(0, tag.color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(x, y, tagSize * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Draw star
          ctx.beginPath();
          ctx.arc(x, y, tagSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = tag.color;
          ctx.fill();
          
          // Draw tag name
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.max(16, 20 * tagSize / 30)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(tag.name, x, y + tagSize + 20);
        }
        
        // Draw legend
        const legendY = centerY + 350;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(canvasWidth / 2 - 200, legendY, 400, 2);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TOP TAGS', canvasWidth / 2, legendY + 50);
        
        // Draw top 5 tags in legend
        for (let i = 0; i < Math.min(displayedTags.value.length, 5); i++) {
          const tag = displayedTags.value[i];
          const itemY = legendY + 100 + (i * 60);
          
          // Draw color indicator
          ctx.beginPath();
          ctx.arc(centerX - 150, itemY, 10, 0, Math.PI * 2);
          ctx.fillStyle = tag.color;
          ctx.fill();
          
          // Draw tag name
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(tag.name, centerX - 130, itemY + 8);
          
          // Draw tag count
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(tag.count, centerX + 150, itemY + 8);
        }
        
        // Draw footer
        const footerY = canvasHeight - 100;
        
        // Draw divider
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(canvasWidth / 2 - 150, footerY, 300, 1);
        
        // Draw site name
        ctx.fillStyle = 'rgba(255, 159, 28, 0.95)'; // Orange color
        ctx.font = 'bold 42px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Last Songs', canvasWidth / 2, footerY + 50);
        
        // Draw site URL
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '32px sans-serif';
        ctx.fillText('lastsongs.netlify.app', canvasWidth / 2, footerY + 90);
        
        // Convert canvas to image and trigger download
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create download link with username in filename if available
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        
        // Determine period name for the filename
        let periodName = 'alltime';
        switch(props.period) {
          case '7day': periodName = '7days'; break;
          case '1month': periodName = '1month'; break;
          case '3month': periodName = '3months'; break;
          case '6month': periodName = '6months'; break;
          case '12month': periodName = '1year'; break;
        }
        
        downloadLink.download = props.username 
          ? `${props.username}-tag-universe-${periodName}.png` 
          : `tag-universe-${periodName}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log('[COMPONENT] Successfully shared tags constellation');
      } catch (error) {
        console.error('[COMPONENT] Error sharing tags constellation:', error);
      }
    }
    
    // Set up visualization when tags change
    watch(() => displayedTags.value, async () => {
      if (displayedTags.value.length > 0) {
        // Wait for the DOM to update with the new tags
        await nextTick();
        drawConnections();
      }
    });
    
    // Watch for username changes
    watch(() => props.username, (newUsername, oldUsername) => {
      if (newUsername !== oldUsername && newUsername) {
        console.log(`TopTagsChart: Username changed from "${oldUsername}" to "${newUsername}"`);
        tagsStore.setUsername(newUsername);
        // Fetch tags data when username changes
        if (newUsername.trim()) {
          tagsStore.fetchTopTags(props.period);
        }
      }
    });
    
    // Watch for period changes 
    watch(() => props.period, (newPeriod, oldPeriod) => {
      if (newPeriod !== oldPeriod) {
        console.log(`TopTagsChart: Period changed from "${oldPeriod}" to "${newPeriod}"`);
        tagsStore.setPeriod(newPeriod);
        // Fetch tags data when period changes
        if (props.username.trim()) {
          tagsStore.fetchTopTags(newPeriod);
        }
      }
    });
    
    // Redraw connections on window resize
    const handleResize = () => {
      drawConnections();
    };
    
    // Initialize the component
    onMounted(async () => {
      console.log('TopTagsChart mounted, username:', props.username);
      
      // Update store with current props
      if (props.username) {
        tagsStore.setUsername(props.username);
        tagsStore.setPeriod(props.period);
        
        // Fetch tags data if we have a username
        if (props.username.trim()) {
          try {
            await tagsStore.fetchTopTags(props.period);
          } catch (error) {
            console.error('Error fetching tags data on mount:', error);
          }
        }
      }
      
      // Add window resize listener
      window.addEventListener('resize', handleResize);
      
      // Draw connections after initial render
      await nextTick();
      drawConnections();
    });
    
    return {
      tagsStore,
      loading,
      error, 
      timeRange,
      displayedTags,
      getPercentage,
      getTagSize,
      getOrbitSize,
      shareTagsChart,
      chartRef,
      constellationContainer,
      connectionsSvg,
      activeTag,
      tagPopupPosition,
      setActiveTag
    };
  }
}
</script>

<style scoped>
/* Base styles */
.top-tags-chart {
  --chart-bg: rgb(10, 15, 30);
  --chart-bg-lighter: rgba(30, 41, 59, 0.8);
  --chart-text: #ffffff;
  --chart-text-secondary: rgba(255, 255, 255, 0.65);
  --chart-accent: #ff9f1c;
  --chart-accent-hover: #ffbe0b;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  margin: 0;
  position: relative;
  display: inline-block;
  text-transform: uppercase;
  background: linear-gradient(90deg, #ffbe0b, #ff9f1c);
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
  background: linear-gradient(90deg, #ffbe0b, #ff9f1c);
  border-radius: 8px;
  animation: shimmer 2s infinite;
}

/* Share button styling */
.share-button {
  background-color: var(--chart-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.share-button:hover {
  background-color: var(--chart-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.share-button svg {
  width: 16px;
  height: 16px;
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
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
  min-height: 600px; /* Increased height for better visualization */
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

/* Starry background effect */
.chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(1px 1px at 50px 160px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(1px 1px at 120px 40px, rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0)),
    radial-gradient(1.5px 1.5px at 40px 60px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 90px 350px, rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 250px 150px, rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0)),
    radial-gradient(1.5px 1.5px at 300px 100px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0)),
    radial-gradient(1px 1px at 400px 250px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0));
  background-repeat: repeat;
  background-size: 500px 500px;
  opacity: 0.15;
  z-index: 0;
}

/* Constellation visualization */
.constellation-visualization {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 550px;
}

/* Time period display */
.time-period {
  color: var(--chart-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 2rem;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(5px);
  display: inline-flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.time-period::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--chart-accent);
  border-radius: 50%;
  margin-right: 8px;
}

/* Constellation container */
.constellation-container {
  width: 100%;
  height: 400px;
  position: relative;
  margin-bottom: 2rem;
}

/* SVG connections */
.constellation-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.constellation-line {
  animation: fadeIn 2s ease-out forwards;
  opacity: 0;
}

.constellation-connection {
  animation: fadeIn 3s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Tag stars */
.tag-star {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-star:not(.central-star) {
  transform-origin: center center;
  animation: orbitAnimation 60s linear infinite;
  animation-delay: var(--animation-delay, 0s);
}

@keyframes orbitAnimation {
  from { transform: rotate(var(--rotation-angle, 0deg)) translateX(var(--orbit-size, 100px)) rotate(calc(-1 * var(--rotation-angle, 0deg))) translate(-50%, -50%); }
  to { transform: rotate(calc(var(--rotation-angle, 0deg) + 360deg)) translateX(var(--orbit-size, 100px)) rotate(calc(-1 * var(--rotation-angle, 0deg) - 360deg)) translate(-50%, -50%); }
}

.central-star {
  animation: pulsateCenter 4s ease-in-out infinite;
}

@keyframes pulsateCenter {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.tag-star-inner {
  width: var(--tag-size, 30px);
  height: var(--tag-size, 30px);
  border-radius: 50%;
  background-color: var(--tag-color, var(--chart-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px 5px rgba(var(--tag-color-rgb, 255, 159, 28), 0.3);
  position: relative;
  z-index: 1;
}

.tag-star-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--tag-color, var(--chart-accent));
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  opacity: 0;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

.tag-star-label {
  margin-top: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  opacity: 0.8;
  transition: all 0.3s ease;
  max-width: 100px;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.tag-star:hover .tag-star-label,
.tag-star-active .tag-star-label {
  opacity: 1;
  transform: scale(1.1);
}

.tag-star:hover .tag-star-inner,
.tag-star-active .tag-star-inner {
  transform: scale(1.2);
}

/* Tag popup */
.tag-details-popup {
  position: absolute;
  background: rgba(20, 30, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  min-width: 150px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 10;
  animation: fadeIn 0.2s ease-out forwards;
  pointer-events: none;
}

.tag-details-popup h3 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
}

.tag-weight {
  font-size: 0.9rem;
  color: var(--chart-text-secondary);
  margin-bottom: 10px;
}

.tag-link {
  font-size: 0.8rem;
  color: var(--chart-accent);
  text-decoration: none;
}

/* Tag legend */
.tag-legend {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 1.5rem;
  background: rgba(30, 40, 60, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 12px;
}

.legend-text {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.legend-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.legend-count {
  color: var(--chart-text-secondary);
  font-size: 0.9rem;
}

/* Loading state */
.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 300px;
  gap: 1.5rem;
  color: var(--chart-text-secondary);
}

.loading-animation {
  position: relative;
  width: 120px;
  height: 120px;
}

.loading-star {
  position: absolute;
  width: 40px;
  height: 40px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--chart-accent);
  border-radius: 50%;
  animation: pulseStar 2s ease-in-out infinite;
}

@keyframes pulseStar {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
}

.loading-orbit {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: rotateOrbit 8s linear infinite;
}

.loading-orbit.outer-orbit {
  width: 160px;
  height: 160px;
  animation-duration: 12s;
  animation-direction: reverse;
}

@keyframes rotateOrbit {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.loading-planet {
  position: absolute;
  width: 16px;
  height: 16px;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(91, 192, 235, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(91, 192, 235, 0.5);
}

.outer-orbit .loading-planet {
  background: rgba(250, 82, 82, 0.9);
  box-shadow: 0 0 10px rgba(250, 82, 82, 0.5);
}

.chart-loading span {
  font-size: 1.1rem;
  font-weight: 500;
  margin-top: 1rem;
  color: var(--chart-text);
}

/* Empty and Error states */
.chart-empty,
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

.empty-icon svg,
.error-icon svg {
  color: var(--chart-text-secondary);
  opacity: 0.5;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.chart-empty p,
.chart-error p {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 600;
  color: var(--chart-text);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-container {
    padding: 1.5rem;
  }
  
  .constellation-container {
    height: 350px;
  }
  
  .tag-legend {
    padding: 1rem;
  }
  
  .chart-title {
    font-size: 1.5rem;
  }
}

/* Dark glass effect for modern browsers */
@supports (backdrop-filter: blur(10px)) {
  .chart-container {
    background: rgba(10, 15, 30, 0.85);
    backdrop-filter: blur(16px);
  }
  
  .tag-details-popup {
    backdrop-filter: blur(10px);
  }
  
  .tag-legend {
    backdrop-filter: blur(10px);
  }
}
</style> 