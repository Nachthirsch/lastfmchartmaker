/**
 * Utility functions for formatting data
 */

/**
 * Format trend percentages to display with one decimal place
 * @param {number} value - The trend value to format
 * @returns {string} - Formatted trend percentage
 */
export function formatTrend(value) {
  return Number(value).toFixed(1);
}

/**
 * Format playcounts with K/M suffix for readability
 * @param {number|string} count - The count to format
 * @returns {string} - Formatted playcount
 */
export function formatPlaycount(count) {
  if (!count) return '0';
  
  count = Number(count);
  
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  } else {
    return count.toString();
  }
}

/**
 * Truncate text that's too long for display
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to truncate
 * @param {number} maxWidth - Maximum width allowed
 * @returns {string} - Truncated text with ellipsis if needed
 */
export function truncateText(ctx, text, maxWidth) {
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