// Utility for generating collages from various music data
// Can be used by album, artist, and track pages

/**
 * Draw neobrutalism style border and shadow for an element
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {number} radius - Corner radius
 * @param {string} borderColor - Border color
 * @param {number} borderWidth - Border width
 * @param {number} offsetX - Shadow X offset
 * @param {number} offsetY - Shadow Y offset
 * @param {number} rotation - Rotation angle in degrees (optional)
 */
function drawNeoBorder(ctx, x, y, width, height, radius, borderColor = '#000000', borderWidth = 6, offsetX = 12, offsetY = 12, rotation = 0) {
  // Save the current context state
  ctx.save();
  
  // Apply rotation if specified (for enhanced neobrutalism effect)
  if (rotation !== 0) {
    // Rotate around the center of the element
    const centerX = x + width/2;
    const centerY = y + height/2;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-centerX, -centerY);
  }
  
  // Draw the offset shadow first (beneath everything) - ULTRA shadow for extreme neobrutalism
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  roundedRect(ctx, x + offsetX, y + offsetY, width, height, radius);
  
  // Draw the border
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
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
  ctx.stroke();
  
  // Restore the context state
  ctx.restore();
}

/**
 * Create a noise pattern for neobrutalism texture
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} baseColor - Base color for the noise
 * @param {number} opacity - Opacity of the noise pattern
 * @returns {CanvasPattern} - The created pattern
 */
function createNoisePattern(ctx, baseColor = '#000000', opacity = 0.08) {
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 100;
  noiseCanvas.height = 100;
  const noiseCtx = noiseCanvas.getContext('2d');
  const imageData = noiseCtx.createImageData(100, 100);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // ULTRA noise pattern for more extreme neobrutalism texture
    const value = Math.random() > 0.88 ? 80 : 0;
    data[i] = value;      // red
    data[i + 1] = value;  // green
    data[i + 2] = value;  // blue
    data[i + 3] = value > 0 ? Math.floor(opacity * 255) : 0; // alpha
  }
  
  noiseCtx.putImageData(imageData, 0, 0);
  return ctx.createPattern(noiseCanvas, 'repeat');
}

/**
 * Create a grid pattern for neobrutalism background
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} color - Color of grid lines
 * @param {number} spacing - Grid spacing
 * @param {number} lineWidth - Width of grid lines
 * @returns {CanvasPattern} - The created pattern
 */
function createGridPattern(ctx, color = 'rgba(255, 255, 255, 0.05)', spacing = 40, lineWidth = 2) {
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = spacing;
  gridCanvas.height = spacing;
  const gridCtx = gridCanvas.getContext('2d');
  
  gridCtx.strokeStyle = color;
  gridCtx.lineWidth = lineWidth;
  
  // Draw horizontal line
  gridCtx.beginPath();
  gridCtx.moveTo(0, 0);
  gridCtx.lineTo(spacing, 0);
  gridCtx.stroke();
  
  // Draw vertical line
  gridCtx.beginPath();
  gridCtx.moveTo(0, 0);
  gridCtx.lineTo(0, spacing);
  gridCtx.stroke();
  
  return ctx.createPattern(gridCanvas, 'repeat');
}

/**
 * Draw text with enhanced neobrutalism style (shadow and outline)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {object} options - Additional options
 */
function drawNeoText(ctx, text, x, y, options = {}) {
  const {
    fillStyle = '#FFFFFF',
    font = 'bold 30px sans-serif',
    shadowOffset = 5,
    addOutline = true,
    outlineWidth = 3,
    outlineColor = '#000000',
    shadowColor = 'rgba(0, 0, 0, 0.8)',
    rotation = 0,
    extraRoughness = false
  } = options;
  
  // Save current context state
  ctx.save();
  
  // Set text alignment and font
  ctx.textAlign = options.textAlign || 'center';
  ctx.font = font;
  
  // Apply rotation if specified (for enhanced neobrutalism effect)
  if (rotation !== 0) {
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-x, -y);
  } else if (extraRoughness) {
    // Add slight random rotation even when not specified for extra brutalism
    const randomRotation = (Math.random() - 0.5) * 2; // -1 to 1 degree
    ctx.translate(x, y);
    ctx.rotate(randomRotation * Math.PI / 180);
    ctx.translate(-x, -y);
  }
  
  // Draw enhanced shadow (multiple layers for more drama)
  if (extraRoughness) {
    // ULTRA shadow layers for extreme neobrutalism roughness
    ctx.fillStyle = shadowColor;
    ctx.fillText(text, x + shadowOffset * 2, y + shadowOffset * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText(text, x + shadowOffset * 1.2, y + shadowOffset * 1.2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText(text, x + shadowOffset * 0.6, y + shadowOffset * 0.6);
  } else {
    // Enhanced standard shadow
    ctx.fillStyle = shadowColor;
    ctx.fillText(text, x + shadowOffset, y + shadowOffset);
    // Add second shadow layer for more depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillText(text, x + shadowOffset * 0.6, y + shadowOffset * 0.6);
  }
  
  // Draw actual text
  ctx.fillStyle = fillStyle;
  ctx.fillText(text, x, y);
  
  // Draw outline if enabled
  if (addOutline) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.strokeText(text, x, y);
  }
  
  // Restore context state
  ctx.restore();
}

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
    
    // Theme colors with EXTREME contrast for hardcore neobrutalism
    const isLightTheme = theme === 'light';
    const colors = {
      background: isLightTheme ? '#FFFFFF' : '#0A0A0A',
      text: isLightTheme ? '#000000' : '#FFFFFF', // Maximum contrast
      accent: accentColor,
      secondary: isLightTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)', // Ultra contrast
      divider: isLightTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.6)', // Bolder dividers
      rankBadgeBg: isLightTheme ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)'
    };
    
    // Fill background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Add bolder grid pattern (characteristic of extreme neobrutalism)
    ctx.fillStyle = createGridPattern(ctx, isLightTheme ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)', 40);
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 2. Add heavier noise texture on top
    ctx.fillStyle = createNoisePattern(ctx, isLightTheme ? '#000000' : '#FFFFFF', 0.08);
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 3. Add more scattered geometric shapes for EXTREME neobrutalism
    if (!isLightTheme) {
      // Only for dark theme to avoid too much clutter in light theme
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < 15; i++) { // More shapes
        const size = Math.random() * 120 + 60; // Larger shapes
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        ctx.fillRect(x, y, size, size);
      }
    } else {
      // Add some subtle shapes for light theme too
      ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
      for (let i = 0; i < 8; i++) {
        const size = Math.random() * 100 + 50;
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        ctx.fillRect(x, y, size, size);
      }
    }
    
    // Load fonts
    const fontFaceSet = document.fonts;
    await fontFaceSet.ready;
    
    // Remove "COLLAGE" from the title
    const modifiedTitle = title.replace('COLLAGE', '').trim();
    
    // Draw the modified title with EXTREME neobrutalism style
    drawNeoText(ctx, modifiedTitle, canvasWidth / 2, 120, {
      fillStyle: colors.text,
      font: 'bold 65px sans-serif', // BIGGER
      shadowOffset: 8, // ENHANCED shadow
      addOutline: true,
      outlineWidth: 4, // THICKER outline
      extraRoughness: true // Additional neobrutalism roughness
    });
    
    // Draw username with enhanced neobrutalism style
    drawNeoText(ctx, username, canvasWidth / 2, 180, {
      fillStyle: colors.accent,
      font: 'bold 50px sans-serif', // Increased size and made bold
      shadowOffset: 8, // Increased shadow depth
      addOutline: true,
      outlineWidth: 1, // Thicker outline for better contrast
      rotation: 0.8, // Reduced rotation for better readability
      extraRoughness: true // Added roughness for neo-brutalist style
    });
    
    // Draw time range
    drawNeoText(ctx, timeRange, canvasWidth / 2, 230, {
      fillStyle: colors.secondary,
      font: '28px sans-serif',
      shadowOffset: 2,
      addOutline: false
    });
    
    // Draw divider line - make it BOLDER and MORE off-angle for extreme neobrutalism
    ctx.save();
    ctx.translate(canvasWidth / 2, 270);
    ctx.rotate(0.03); // More noticeably rotated
    ctx.fillStyle = colors.divider;
    ctx.fillRect(-200, 0, 400, 6); // THICKER
    ctx.restore();
    
    // Add MULTIPLE geometric accent shapes (neobrutalism often includes unexpected geometric elements)
    ctx.fillStyle = colors.accent;
    ctx.fillRect(canvasWidth / 2 + 190, 268, 15, 15); // Bigger square
    ctx.fillStyle = isLightTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(canvasWidth / 2 - 210, 265, 10, 10); // Additional square on other side
    
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
      // Draw 'Tags:' label with neobrutalism style
      drawNeoText(ctx, 'Top Tags:', canvasWidth / 2, 290, {
        fillStyle: colors.secondary,
        font: '24px sans-serif',
        shadowOffset: 2,
        addOutline: false
      });
      
      // Draw tags in a row with enhanced neobrutalism style
      ctx.font = 'bold 24px sans-serif';
      
      const tagSpacing = 25; // Increased spacing for neobrutalism tags
      const tagMetrics = tags.map(tag => ctx.measureText(tag.name));
      const totalTagWidth = tagMetrics.reduce((sum, metric, i) => 
        sum + metric.width + 30 + (i < tagMetrics.length - 1 ? tagSpacing : 0), 0); // Add 30px for padding inside tag boxes
      
      let tagX = (canvasWidth - totalTagWidth) / 2;
      
      tags.forEach((tag, index) => {
        // Create enhanced neobrutalism-style tag boxes
        const tagWidth = tagMetrics[index].width + 30;
        const tagHeight = 40;
        const tagY = 305; // This is the correct vertical position with the title
        
        // Each tag gets a MORE different rotation for that RAW neobrutalism look
        const rotation = Math.random() * 3 - 1.5; // Random rotation between -1.5 and 1.5 degrees
        
        // Draw tag box shadow (offset) - enhanced for more extreme neobrutalism
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.save();
        ctx.translate(tagX + tagWidth/2, tagY - 10);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.fillRect(-tagWidth/2 + 6, -tagHeight/2 + 6, tagWidth, tagHeight);
        ctx.restore();
        
        // Draw tag box background
        ctx.save();
        ctx.translate(tagX + tagWidth/2, tagY - 10);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.fillStyle = colors.accent;
        ctx.fillRect(-tagWidth/2, -tagHeight/2, tagWidth, tagHeight);
        
        // Draw thick tag box border - characteristic of neobrutalism
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-tagWidth/2, -tagHeight/2, tagWidth, tagHeight);
        
        // Draw tag text
        ctx.fillStyle = '#000000'; // Always black text on tag background for contrast
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tag.name, 0, 0);
        ctx.restore();
        
        // Move to next tag position
        tagX += tagWidth + (index < tags.length - 1 ? tagSpacing : 0);
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
    
    // Draw item grid with enhanced neobrutalism
    for (let i = 0; i < itemsToDisplay; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      const x = horizontalPadding + col * (imageSize + horizontalPadding);
      const y = startY + row * (imageSize + horizontalPadding);
      
      const itemData = itemImages[i];
      if (!itemData) continue;
      
      // Apply LARGER random offset to each item for EXTREME neobrutalism imperfection
      const offsetX = Math.random() * 4 - 2; // -2 to 2 pixels
      const offsetY = Math.random() * 4 - 2; // -2 to 2 pixels
      const adjustedX = x + offsetX;
      const adjustedY = y + offsetY;
      
      // Draw enhanced shadow for EXTREME neobrutalism effect (deeper and larger offset)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      if (type === 'artists') {
        // Circle shadow for artists
        ctx.beginPath();
        ctx.arc(adjustedX + imageSize/2 + 8, adjustedY + imageSize/2 + 8, imageSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Rounded rectangle shadow for albums and tracks
        roundedRect(ctx, adjustedX + 8, adjustedY + 8, imageSize, imageSize, 8);
      }
      
      // Draw image with proper handling to prevent cutting off
      ctx.save();
      
      // Create clipping path for rounded corners
      // Use circle for artists, rounded rectangles for albums and tracks
      if (type === 'artists') {
        // Circle mask for artists
        ctx.beginPath();
        ctx.arc(adjustedX + imageSize/2, adjustedY + imageSize/2, imageSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else {
        // Rounded rectangle for albums and tracks
        roundedRect(ctx, adjustedX, adjustedY, imageSize, imageSize, 8);
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
      ctx.drawImage(img, sx, sy, sWidth, sHeight, adjustedX, adjustedY, imageSize, imageSize);
      ctx.restore();
      
      // Draw extra thick border for EXTREME neobrutalism
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6; // THICKER for more neobrutalism impact
      if (type === 'artists') {
        // Circle border for artists
        ctx.beginPath();
        ctx.arc(adjustedX + imageSize/2, adjustedY + imageSize/2, imageSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
      } else {
        // Rounded rectangle border for albums and tracks
        ctx.beginPath();
        ctx.moveTo(adjustedX + 8, adjustedY);
        ctx.lineTo(adjustedX + imageSize - 8, adjustedY);
        ctx.quadraticCurveTo(adjustedX + imageSize, adjustedY, adjustedX + imageSize, adjustedY + 8);
        ctx.lineTo(adjustedX + imageSize, adjustedY + imageSize - 8);
        ctx.quadraticCurveTo(adjustedX + imageSize, adjustedY + imageSize, adjustedX + imageSize - 8, adjustedY + imageSize);
        ctx.lineTo(adjustedX + 8, adjustedY + imageSize);
        ctx.quadraticCurveTo(adjustedX, adjustedY + imageSize, adjustedX, adjustedY + imageSize - 8);
        ctx.lineTo(adjustedX, adjustedY + 8);
        ctx.quadraticCurveTo(adjustedX, adjustedY, adjustedX + 8, adjustedY);
        ctx.closePath();
        ctx.stroke();
      }
      
      // Draw rank badge with enhanced neobrutalism style
      const badgeSize = 44; // Larger for more impact
      const badgeX = adjustedX + 12;
      const badgeY = adjustedY + 12;
      
      // Draw badge shadow - DEEPER for neobrutalism
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize/2 + 6, badgeY + badgeSize/2 + 6, badgeSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw badge background
      ctx.fillStyle = colors.rankBadgeBg;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw badge border - thicker for neobrutalism
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw rank number with shadow and outline
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${itemData.rank}`, badgeX + badgeSize/2 + 2, badgeY + badgeSize/2 + 2);
      
      ctx.fillStyle = colors.accent;
      ctx.fillText(`#${itemData.rank}`, badgeX + badgeSize/2, badgeY + badgeSize/2);
      
      // Draw outline around text for enhanced neobrutalism
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeText(`#${itemData.rank}`, badgeX + badgeSize/2, badgeY + badgeSize/2);
      
      // Reset text baseline
      ctx.textBaseline = 'alphabetic';
      
      // Draw name if option enabled
      if (showNames) {
        // Create semi-transparent background for text - taller for neobrutalism
        const textBgHeight = itemData.artist ? 54 : 40;  // Taller for albums/tracks to fit artist name
        const textBgY = adjustedY + imageSize - textBgHeight;
        
        // Draw name background with deeper shadow (neobrutalism style)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(adjustedX + 4, textBgY + 4, imageSize, textBgHeight);
        
        // Draw name background
        ctx.fillStyle = isLightTheme ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(adjustedX, textBgY, imageSize, textBgHeight);
        
        // Draw thick border around text background - key neobrutalism feature
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5; // THICKER border
        ctx.strokeRect(adjustedX, textBgY, imageSize, textBgHeight);
        
        // Draw name
        ctx.fillStyle = isLightTheme ? '#000000' : '#FFFFFF';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        
        // Truncate name if too long
        const maxWidth = imageSize - 20;
        const name = truncateText(ctx, itemData.name, maxWidth);
        
        // For albums and tracks, show both track/album name and artist
        if (itemData.artist) {
          ctx.fillText(name, adjustedX + imageSize / 2, textBgY + 22);
          
          // Draw artist name
          ctx.fillStyle = isLightTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
          ctx.font = '12px sans-serif';
          
          const artistName = truncateText(ctx, itemData.artist, maxWidth);
          ctx.fillText(artistName, adjustedX + imageSize / 2, textBgY + 42);
        } else {
          // Just show name for artists
          ctx.fillText(name, adjustedX + imageSize / 2, textBgY + 24);
        }
      }
    }
    
    // Calculate footer position based on grid size
    const lastRow = Math.ceil(itemsToDisplay / gridSize) - 1;
    const gridBottom = startY + (lastRow + 1) * (imageSize + horizontalPadding);
    const footerY = Math.max(gridBottom + 120, canvasHeight - 120);
    
    // Draw collage info with enhanced neobrutalism style
    drawNeoText(ctx, `${sizeConfig.label} collage • ${itemsToDisplay} ${type}`, canvasWidth / 2, footerY - 50, {
      fillStyle: colors.text,
      font: '22px sans-serif',
      shadowOffset: 3,
      addOutline: false,
      rotation: 0.2 // Slight rotation for neobrutalism imperfection
    });
    
    // Draw divider - make it bolder for enhanced neobrutalism
    ctx.save();
    ctx.translate(canvasWidth / 2, footerY - 20);
    ctx.rotate(-0.01); // Slightly rotated in opposite direction
    ctx.fillStyle = colors.divider;
    ctx.fillRect(-200, 0, 400, 4); // Thicker and longer
    ctx.restore();
    
    // Add geometric accent (neobrutalism characteristic)
    ctx.fillStyle = colors.accent;
    ctx.fillRect(canvasWidth / 2 - 210, footerY - 22, 6, 8);
    
    // Draw site name with EXTREME neobrutalism style
    drawNeoText(ctx, 'Last Songs', canvasWidth / 2, footerY + 30, {
      fillStyle: colors.accent,
      font: 'bold 40px sans-serif', // BIGGER
      shadowOffset: 8, // ENHANCED shadow
      addOutline: true,
      outlineWidth: 1, // THICKER outline
      extraRoughness: true,
      rotation: 0.5 // Add slight rotation for brutalist feel
    });
    
    // Draw site URL with neobrutalism style
    drawNeoText(ctx, 'lastsongs.netlify.app', canvasWidth / 2, footerY + 70, {
      fillStyle: colors.secondary,
      font: '24px sans-serif',
      shadowOffset: 2,
      addOutline: false
    });
    
    // Convert canvas to image and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    const themeSuffix = isLightTheme ? 'light' : 'dark';
    const styleSuffix = 'ultra-neobrutal';
    downloadLink.download = `${username}-${sizeConfig.label}-${type}-collage-${themeSuffix}-${styleSuffix}-${period}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    console.log(`[COLLAGE] Successfully created ${type} collage with enhanced neobrutalism style`);
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