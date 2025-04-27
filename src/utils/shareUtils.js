/**
 * Utilities for sharing functionality
 */
import { loadImage } from './imageUtils';
import { roundedRect, roundedImage } from './canvasUtils';
import { formatPlaycount, truncateText } from './formatUtils';

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
    
    // Fill background
    ctx.fillStyle = '#131313';
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
    
    // Draw header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvasWidth / 2, 160);
    
    // Draw username
    ctx.fillStyle = accentColor;
    ctx.font = '50px sans-serif';
    ctx.fillText(username, canvasWidth / 2, 240);
    
    // Draw time range
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '36px sans-serif';
    ctx.fillText(timeRange, canvasWidth / 2, 300);
    
    // Draw divider line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(canvasWidth / 2 - 60, 340, 120, 2);
    
    // Draw main item
    if (topItem) {
      // Draw #1 rank
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('#1', canvasWidth / 2, 420);
      
      // Draw main item image
      const imageUrl = getItemImage(topItem);
      
      // Preload image
      if (imageUrl) {
        const img = await loadImage(imageUrl);
        const imgSize = 440;
        const imgX = (canvasWidth - imgSize) / 2;
        const imgY = 450;
        
        // Draw image with rounded corners
        roundedImage(ctx, imgX, imgY, imgSize, imgSize, 24);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
        
        // Draw item name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 56px sans-serif';
        ctx.textAlign = 'center';
        const name = topItem.name || '';
        const truncatedName = truncateText(ctx, name, canvasWidth - 120);
        ctx.fillText(truncatedName, canvasWidth / 2, 950);
        
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
        
        // Draw tags if available
        if (tags && tags.length > 0) {
          // Draw 'Tags:' label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Tags:', canvasWidth / 2, 1120);
          
          // Draw tags in a row
          ctx.font = 'bold 28px sans-serif';
          
          const tagSpacing = 20;
          const tagMetrics = tags.map(tag => ctx.measureText(tag.name));
          const totalTagWidth = tagMetrics.reduce((sum, metric, i) => 
            sum + metric.width + (i < tagMetrics.length - 1 ? tagSpacing : 0), 0);
          
          let tagX = (canvasWidth - totalTagWidth) / 2;
          
          tags.forEach((tag, index) => {
            ctx.fillStyle = accentColor;
            
            // Draw tag text
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
    
    // Draw list items
    const itemHeight = 120;
    const itemWidth = canvasWidth - 120;
    const itemX = 60;
    
    for (let i = 0; i < itemList.length; i++) {
      const item = itemList[i];
      const itemY = listStartY + (i * (itemHeight + 20));
      
      // Draw item background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      roundedRect(ctx, itemX, itemY, itemWidth, itemHeight, 12);
      
      // Draw rank
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${i + 2}`, itemX + 24, itemY + 70);
      
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
    
    // Draw footer
    const footerY = canvasHeight - 120;
    
    // Draw divider
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(canvasWidth / 2 - 150, footerY, 300, 1);
    
    // Draw site name
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Last Songs', canvasWidth / 2, footerY + 50);
    
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