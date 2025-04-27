/**
 * Utilities for sharing functionality
 */
import { loadImage } from './imageUtils';
import { roundedRect, roundedImage } from './canvasUtils';
import { formatPlaycount, truncateText } from './formatUtils';

/**
 * Draw neobrutalism style border and shadow
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
 */
function drawNeoBorder(ctx, x, y, width, height, radius, borderColor = '#000000', borderWidth = 4, offsetX = 6, offsetY = 6) {
  // Save the current context state
  ctx.save();
  
  // Draw the offset shadow first (beneath everything)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
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
 * Generate and share a chart image for artists, albums, or tracks
 * @param {string} section - Section to share ('artists', 'albums', or 'tracks')
 * @param {object} data - Data required for sharing
 * @returns {Promise<void>}
 */
export async function shareChart(section, data) {
  console.log(`Sharing ${section} section`);
  
  const {
    username,
    timeRange,
    topItem,
    itemList,
    getItemImage,
    tags = []
  } = data;
  
  try {
    // Create a new canvas-based chart instead of using DOM elements
    const canvasWidth = 1080;
    const canvasHeight = 1920;
    
    // Create a new canvas element
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Fill background - add subtle noise texture for neobrutalism
    ctx.fillStyle = '#131313';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Add subtle texture (noise pattern) - This is a light noise effect
    const createNoisePattern = () => {
      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = 100;
      noiseCanvas.height = 100;
      const noiseCtx = noiseCanvas.getContext('2d');
      const imageData = noiseCtx.createImageData(100, 100);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Very subtle noise (almost invisible but adds texture)
        const value = Math.random() > 0.97 ? 40 : 0;
        data[i] = value;      // red
        data[i + 1] = value;  // green
        data[i + 2] = value;  // blue
        data[i + 3] = value > 0 ? 40 : 0; // alpha
      }
      
      noiseCtx.putImageData(imageData, 0, 0);
      return ctx.createPattern(noiseCanvas, 'repeat');
    };
    
    // Apply the noise pattern
    ctx.fillStyle = createNoisePattern();
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Set up data based on section
    let title = '';
    let accentColor = '#FF7597';
    
    if (section === 'artists') {
      title = 'TOP ARTISTS';
      accentColor = '#FF7597';
    } else if (section === 'albums') {
      title = 'TOP ALBUMS';
      accentColor = '#4DD4AC';
    } else if (section === 'tracks') {
      title = 'TOP TRACKS';
      accentColor = '#64B5F6';
    }
    
    // Load and prepare fonts
    const fontFaceSet = document.fonts;
    await fontFaceSet.ready;
    
    // Draw header with neobrutalism style - slightly offset, bold text effect
    ctx.fillStyle = '#FFFFFF';
    // Draw shadow for 3D effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvasWidth / 2 + 3, 160 + 3);
    // Draw actual text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(title, canvasWidth / 2, 160);
    // Draw border around text (neobrutalism style)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(title, canvasWidth / 2, 160);
    
    // Draw username with neobrutalism style
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.font = '50px sans-serif';
    ctx.fillText(username, canvasWidth / 2 + 2, 240 + 2);
    // Actual text
    ctx.fillStyle = accentColor;
    ctx.fillText(username, canvasWidth / 2, 240);
    
    // Draw time range
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '36px sans-serif';
    ctx.fillText(timeRange, canvasWidth / 2, 300);
    
    // Draw divider line - make it bolder for neobrutalism
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(canvasWidth / 2 - 100, 340, 200, 4);
    
    // Draw main item
    if (topItem) {
      // Draw #1 rank with neobrutalism style - bolder and with shadow
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('#1', canvasWidth / 2 + 2, 420 + 2);
      // Actual text
      ctx.fillStyle = accentColor;
      ctx.fillText('#1', canvasWidth / 2, 420);
      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText('#1', canvasWidth / 2, 420);
      
      // Draw main item image
      const imageUrl = getItemImage(topItem);
      
      // Preload image
      if (imageUrl) {
        const img = await loadImage(imageUrl);
        const imgSize = 440;
        const imgX = (canvasWidth - imgSize) / 2;
        const imgY = 450;
        
        // Draw shadow behind image (neobrutalism effect)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        roundedRect(ctx, imgX + 8, imgY + 8, imgSize, imgSize, 12);
        
        // Draw image with neobrutalism border
        roundedImage(ctx, imgX, imgY, imgSize, imgSize, 12);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
        
        // Add thick black border for neobrutalism look
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(imgX + 12, imgY);
        ctx.lineTo(imgX + imgSize - 12, imgY);
        ctx.quadraticCurveTo(imgX + imgSize, imgY, imgX + imgSize, imgY + 12);
        ctx.lineTo(imgX + imgSize, imgY + imgSize - 12);
        ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - 12, imgY + imgSize);
        ctx.lineTo(imgX + 12, imgY + imgSize);
        ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - 12);
        ctx.lineTo(imgX, imgY + 12);
        ctx.quadraticCurveTo(imgX, imgY, imgX + 12, imgY);
        ctx.closePath();
        ctx.stroke();
        
        // Draw item name with neobrutalism style
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.font = 'bold 56px sans-serif';
        ctx.textAlign = 'center';
        const name = topItem.name || '';
        const truncatedName = truncateText(ctx, name, canvasWidth - 120);
        ctx.fillText(truncatedName, canvasWidth / 2 + 3, 950 + 3);
        // Actual text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(truncatedName, canvasWidth / 2, 950);
        // Outline for neobrutalism
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText(truncatedName, canvasWidth / 2, 950);
        
        // Draw artist name for albums and tracks
        if (section !== 'artists' && topItem.artist) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '42px sans-serif';
          const artistName = topItem.artist.name || 'Unknown Artist';
          const truncatedArtistName = truncateText(ctx, artistName, canvasWidth - 150);
          ctx.fillText(truncatedArtistName, canvasWidth / 2, 1010);
        }
        
        // Draw playcount
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '40px sans-serif';
        const playcount = formatPlaycount(topItem.playcount) + ' scrobbles';
        ctx.fillText(playcount, canvasWidth / 2, 1070);
        
        // Draw tags if available with neobrutalism style
        if (tags && tags.length > 0) {
          // Draw 'Tags:' label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Tags:', canvasWidth / 2, 1120);
          
          // Draw tags in a row with neobrutalism style
          ctx.font = 'bold 28px sans-serif';
          
          const tagSpacing = 20;
          const tagMetrics = tags.map(tag => ctx.measureText(tag.name));
          const totalTagWidth = tagMetrics.reduce((sum, metric, i) => 
            sum + metric.width + (i < tagMetrics.length - 1 ? tagSpacing : 0), 0);
          
          let tagX = (canvasWidth - totalTagWidth) / 2;
          
          tags.forEach((tag, index) => {
            // Create neobrutalism-style tag boxes
            const tagWidth = tagMetrics[index].width + 20;
            const tagHeight = 36;
            const tagY = 1138;
            
            // Draw tag box shadow (offset)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            roundedRect(ctx, tagX - 10 + 3, tagY - 28 + 3, tagWidth, tagHeight, 6);
            
            // Draw tag box background
            ctx.fillStyle = accentColor;
            roundedRect(ctx, tagX - 10, tagY - 28, tagWidth, tagHeight, 6);
            
            // Draw tag box border
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tagX - 10 + 6, tagY - 28);
            ctx.lineTo(tagX - 10 + tagWidth - 6, tagY - 28);
            ctx.quadraticCurveTo(tagX - 10 + tagWidth, tagY - 28, tagX - 10 + tagWidth, tagY - 28 + 6);
            ctx.lineTo(tagX - 10 + tagWidth, tagY - 28 + tagHeight - 6);
            ctx.quadraticCurveTo(tagX - 10 + tagWidth, tagY - 28 + tagHeight, tagX - 10 + tagWidth - 6, tagY - 28 + tagHeight);
            ctx.lineTo(tagX - 10 + 6, tagY - 28 + tagHeight);
            ctx.quadraticCurveTo(tagX - 10, tagY - 28 + tagHeight, tagX - 10, tagY - 28 + tagHeight - 6);
            ctx.lineTo(tagX - 10, tagY - 28 + 6);
            ctx.quadraticCurveTo(tagX - 10, tagY - 28, tagX - 10 + 6, tagY - 28);
            ctx.closePath();
            ctx.stroke();
            
            // Draw tag text
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'left';
            ctx.fillText(tag.name, tagX, 1160);
            
            // Move to next tag position
            tagX += tagMetrics[index].width + (index < tags.length - 1 ? tagSpacing : 0);
            
            // Add a dot between tags (except after the last tag)
            if (index < tags.length - 1) {
              ctx.fillStyle = 'white';
              ctx.fillText('·', tagX - 15, 1160);
            }
          });
        }
      }
    }
    
    // Adjust starting point for list items based on whether we have tags
    const listStartY = tags && tags.length > 0 ? 1200 : 1140;
    
    // Draw list items with neobrutalism style
    const itemHeight = 120;
    const itemWidth = canvasWidth - 120;
    const itemX = 60;
    
    for (let i = 0; i < itemList.length; i++) {
      const item = itemList[i];
      const itemY = listStartY + (i * (itemHeight + 20));
      
      // Draw shadow for 3D effect (neobrutalism)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      roundedRect(ctx, itemX + 6, itemY + 6, itemWidth, itemHeight, 12);
      
      // Draw item background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      roundedRect(ctx, itemX, itemY, itemWidth, itemHeight, 12);
      
      // Draw thick border for neobrutalism
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(itemX + 12, itemY);
      ctx.lineTo(itemX + itemWidth - 12, itemY);
      ctx.quadraticCurveTo(itemX + itemWidth, itemY, itemX + itemWidth, itemY + 12);
      ctx.lineTo(itemX + itemWidth, itemY + itemHeight - 12);
      ctx.quadraticCurveTo(itemX + itemWidth, itemY + itemHeight, itemX + itemWidth - 12, itemY + itemHeight);
      ctx.lineTo(itemX + 12, itemY + itemHeight);
      ctx.quadraticCurveTo(itemX, itemY + itemHeight, itemX, itemY + itemHeight - 12);
      ctx.lineTo(itemX, itemY + 12);
      ctx.quadraticCurveTo(itemX, itemY, itemX + 12, itemY);
      ctx.closePath();
      ctx.stroke();
      
      // Draw rank with neobrutalism style
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${i + 2}`, itemX + 24 + 2, itemY + 70 + 2);
      // Actual text
      ctx.fillStyle = accentColor;
      ctx.fillText(`#${i + 2}`, itemX + 24, itemY + 70);
      // Border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeText(`#${i + 2}`, itemX + 24, itemY + 70);
      
      // Draw item name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 38px sans-serif';
      const name = item.name || '';
      const truncatedName = truncateText(ctx, name, itemWidth - 100);
      ctx.fillText(truncatedName, itemX + 90, itemY + 52);
      
      // Draw artist name for albums and tracks
      if (section !== 'artists' && item.artist) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '32px sans-serif';
        const artistName = item.artist.name || 'Unknown Artist';
        const playcount = formatPlaycount(item.playcount);
        const text = `${artistName} • ${playcount}`;
        const truncatedText = truncateText(ctx, text, itemWidth - 120);
        ctx.fillText(truncatedText, itemX + 90, itemY + 92);
      } else {
        // Draw playcount for artists
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '32px sans-serif';
        const playcount = formatPlaycount(item.playcount) + ' scrobbles';
        ctx.fillText(playcount, itemX + 90, itemY + 92);
      }
    }
    
    // Draw footer with neobrutalism style
    const footerY = canvasHeight - 120;
    
    // Draw divider
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(canvasWidth / 2 - 150, footerY, 300, 3); // Slightly thicker
    
    // Draw site name with neobrutalism style
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Last Songs', canvasWidth / 2 + 3, footerY + 50 + 3);
    // Actual text
    ctx.fillStyle = accentColor;
    ctx.fillText('Last Songs', canvasWidth / 2, footerY + 50);
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText('Last Songs', canvasWidth / 2, footerY + 50);
    
    // Draw site URL
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '32px sans-serif';
    ctx.fillText('lastsongs.netlify.app', canvasWidth / 2, footerY + 90);
    
    // Convert canvas to image and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `${username}-top-${section}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    console.log(`Successfully shared ${section}`);
  } catch (error) {
    console.error(`Error sharing ${section}:`, error);
  }
} 