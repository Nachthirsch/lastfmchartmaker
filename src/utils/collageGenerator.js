// Utility for generating collages from various music data
// Can be used by album, artist, and track pages

/**
 * Generate a music collage in 9:16 ratio
 * @param {Object} options - Configuration options for the collage
 * @param {Array} options.items - Array of items to display (albums, artists, tracks)
 * @param {Function} options.getImageUrl - Function to get image URL for an item
 * @param {String} options.title - Collage title (e.g., "TOP ALBUMS COLLAGE")
 * @param {String} options.username - Username to display
 * @param {String} options.timeRange - Time range text (e.g., "Last 7 days")
 * @param {String} options.collageSize - Size code (e.g., "3x3", "4x4", "5x5")
 * @param {String} options.theme - Theme ("dark" or "light")
 * @param {Boolean} options.showNames - Whether to show item names
 * @param {String} options.accentColor - Accent color in hex format (e.g., "#4DD4AC")
 * @param {Object} options.sizeConfig - Configuration for the selected grid size
 * @param {String} options.period - Time period code for filename
 * @param {String} options.type - Type of collage ("albums", "artists", "tracks")
 * @param {Array} options.tags - Optional tags for the top item in the collage
 */
export async function generateCollage(options) {
  const {
    items,
    getImageUrl,
    title,
    username,
    timeRange,
    collageSize,
    theme,
    showNames,
    accentColor,
    sizeConfig,
    period,
    type,
    tags = []
  } = options;

  const gridSize = sizeConfig.gridSize;
  const itemCount = sizeConfig.itemCount;
  
  console.log(`[COLLAGE] Creating ${collageSize} ${type} collage with ${itemCount} items`);
  
  try {
    // Use 9:16 aspect ratio for the canvas
    const canvasWidth = 1080;
    const canvasHeight = 1920; // 9:16 ratio
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Theme colors
    const isLightTheme = theme === 'light';
    const colors = {
      background: isLightTheme ? '#FFFFFF' : '#131313',
      text: isLightTheme ? '#111111' : '#FFFFFF',
      accent: accentColor,
      secondary: isLightTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
      divider: isLightTheme ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)',
      rankBadgeBg: isLightTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
    };
    
    // Fill background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Load fonts
    const fontFaceSet = document.fonts;
    await fontFaceSet.ready;
    
    // Draw header
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvasWidth / 2, 120);
    
    // Draw username
    ctx.fillStyle = colors.accent;
    ctx.font = '40px sans-serif';
    ctx.fillText(username, canvasWidth / 2, 180);
    
    // Draw time range
    ctx.fillStyle = colors.secondary;
    ctx.font = '28px sans-serif';
    ctx.fillText(timeRange, canvasWidth / 2, 230);
    
    // Draw divider line
    ctx.fillStyle = colors.divider;
    ctx.fillRect(canvasWidth / 2 - 120, 270, 240, 2);
    
    // Determine items to display
    const itemsToDisplay = Math.min(itemCount, items.length);
    
    // Calculate image size and padding for the grid
    // Use the width for calculations to ensure square images
    const horizontalPadding = 20;
    const imageSize = (canvasWidth - ((gridSize + 1) * horizontalPadding)) / gridSize;
    
    // Calculate starting Y position for the grid
    // Adjust starting position if we have tags
    const startY = tags && tags.length > 0 ? 360 : 320; // Below header section, with extra space for tags if needed
    
    // Draw top item tags if available
    if (tags && tags.length > 0) {
      // Draw 'Tags:' label
      ctx.fillStyle = colors.secondary;
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Top Tags:', canvasWidth / 2, 290);
      
      // Draw tags in a row
      ctx.font = 'bold 24px sans-serif';
      
      const tagSpacing = 15;
      const tagMetrics = tags.map(tag => ctx.measureText(tag.name));
      const totalTagWidth = tagMetrics.reduce((sum, metric, i) => 
        sum + metric.width + (i < tagMetrics.length - 1 ? tagSpacing : 0), 0);
      
      let tagX = (canvasWidth - totalTagWidth) / 2;
      
      tags.forEach((tag, index) => {
        // Draw tag text
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'left';
        ctx.fillText(tag.name, tagX, 325);
        
        // Move to next tag position
        tagX += tagMetrics[index].width + (index < tags.length - 1 ? tagSpacing : 0);
        
        // Add a dot between tags (except after the last tag)
        if (index < tags.length - 1) {
          ctx.fillStyle = colors.text;
          ctx.fillText('·', tagX - 10, 325);
        }
      });
    }
    
    // Load all images
    const itemImages = [];
    for (let i = 0; i < itemsToDisplay; i++) {
      const item = items[i];
      const imageUrl = getImageUrl(item);
      try {
        const img = await loadImage(imageUrl);
        itemImages.push({
          img,
          rank: i + 1,
          name: type === 'artists' ? item.name : item.name,
          artist: type === 'artists' ? null : item.artist?.name || 'Unknown Artist'
        });
      } catch (error) {
        console.error(`[COLLAGE] Error loading image for ${type} "${item.name}":`, error);
      }
    }
    
    // Draw item grid
    for (let i = 0; i < itemsToDisplay; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      const x = horizontalPadding + col * (imageSize + horizontalPadding);
      const y = startY + row * (imageSize + horizontalPadding);
      
      const itemData = itemImages[i];
      if (!itemData) continue;
      
      // Draw image with proper handling to prevent cutting off
      ctx.save();
      
      // Create clipping path for rounded corners
      // Use circle for artists, rounded rectangles for albums and tracks
      if (type === 'artists') {
        // Circle mask for artists
        ctx.beginPath();
        ctx.arc(x + imageSize/2, y + imageSize/2, imageSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else {
        // Rounded rectangle for albums and tracks
        roundedRect(ctx, x, y, imageSize, imageSize, 8);
        ctx.clip();
      }
      
      // Draw the image properly centered and scaled to fit while maintaining aspect ratio
      const img = itemData.img;
      let sx, sy, sWidth, sHeight;
      
      if (img.width / img.height > 1) {
        // Landscape image
        sHeight = img.height;
        sWidth = sHeight;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        // Portrait image or square
        sWidth = img.width;
        sHeight = sWidth;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      }
      
      // Draw the image centered and properly scaled
      ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, imageSize, imageSize);
      ctx.restore();
      
      // Draw rank badge
      const badgeSize = 36;
      const badgeX = x + 12;
      const badgeY = y + 12;
      
      ctx.fillStyle = colors.rankBadgeBg;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${itemData.rank}`, badgeX + badgeSize/2, badgeY + badgeSize/2);
      
      // Reset text baseline
      ctx.textBaseline = 'alphabetic';
      
      // Draw name if option enabled
      if (showNames) {
        // Create semi-transparent background for text
        const textBgHeight = itemData.artist ? 46 : 32;  // Taller for albums/tracks to fit artist name
        const textBgY = y + imageSize - textBgHeight;
        
        ctx.fillStyle = isLightTheme ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(x, textBgY, imageSize, textBgHeight);
        
        // Draw name
        ctx.fillStyle = isLightTheme ? '#000000' : '#FFFFFF';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        
        // Truncate name if too long
        const maxWidth = imageSize - 16;
        const name = truncateText(ctx, itemData.name, maxWidth);
        
        // For albums and tracks, show both track/album name and artist
        if (itemData.artist) {
          ctx.fillText(name, x + imageSize / 2, textBgY + 18);
          
          // Draw artist name
          ctx.fillStyle = isLightTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
          ctx.font = '12px sans-serif';
          
          const artistName = truncateText(ctx, itemData.artist, maxWidth);
          ctx.fillText(artistName, x + imageSize / 2, textBgY + 36);
        } else {
          // Just show name for artists
          ctx.fillText(name, x + imageSize / 2, textBgY + 20);
        }
      }
    }
    
    // Calculate footer position based on grid size
    const lastRow = Math.ceil(itemsToDisplay / gridSize) - 1;
    const gridBottom = startY + (lastRow + 1) * (imageSize + horizontalPadding);
    const footerY = Math.max(gridBottom + 120, canvasHeight - 120);
    
    // Draw collage info
    ctx.fillStyle = colors.text;
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${sizeConfig.label} collage • ${itemsToDisplay} ${type}`, canvasWidth / 2, footerY - 50);
    
    // Draw divider
    ctx.fillStyle = colors.divider;
    ctx.fillRect(canvasWidth / 2 - 180, footerY - 20, 360, 2);
    
    // Draw site name
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Last Songs', canvasWidth / 2, footerY + 30);
    
    // Draw site URL
    ctx.fillStyle = colors.secondary;
    ctx.font = '24px sans-serif';
    ctx.fillText('lastsongs.netlify.app', canvasWidth / 2, footerY + 70);
    
    // Convert canvas to image and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    const themeSuffix = isLightTheme ? 'light' : 'dark';
    downloadLink.download = `${username}-${sizeConfig.label}-${type}-collage-${themeSuffix}-${period}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    console.log(`[COLLAGE] Successfully created ${type} collage`);
    return { success: true };
  } catch (error) {
    console.error(`[COLLAGE] Error creating ${type} collage:`, error);
    return { success: false, error };
  }
}

// Helper function to load an image and return a Promise
function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      // Create a placeholder colored rectangle instead
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#666666';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No Image', 150, 150);
      
      const img = new Image();
      img.src = canvas.toDataURL();
      img.onload = () => resolve(img);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS
    
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.log(`[COLLAGE] Failed to load image: ${url}, creating placeholder`);
      // Create a placeholder image
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#666666';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No Image', 150, 150);
      
      const placeholderImg = new Image();
      placeholderImg.src = canvas.toDataURL();
      placeholderImg.onload = () => resolve(placeholderImg);
    };
    
    // Handle potential CORS issues by trying with a proxy if available
    try {
      img.src = url;
    } catch (e) {
      console.error(`[COLLAGE] Error setting image src: ${e}`);
      img.onerror();
    }
  });
}

// Helper function to draw rounded rectangle
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// Helper function to truncate text
function truncateText(ctx, text, maxWidth) {
  if (!text) return '';
  
  // Check if the text fits
  const metrics = ctx.measureText(text);
  if (metrics.width <= maxWidth) {
    return text;
  }
  
  // Truncate text with ellipsis
  let truncated = text;
  let width = metrics.width;
  
  while (width > maxWidth && truncated.length > 3) {
    truncated = truncated.slice(0, -1);
    width = ctx.measureText(truncated + '...').width;
  }
  
  return truncated + '...';
} 