# Canvas-based Chart Layout Documentation
> LastFM Chart Maker Image Generation System

This documentation explains the structure, layout design, spacing, and positioning principles used in the LastFM Chart Maker's canvas-based image generation system.

## 1. Canvas Setup & Fundamental Structure

### 1.1 Canvas Dimensions
```javascript
const canvasWidth = 1080;  // Canvas width in pixels
const canvasHeight = 1920; // Canvas height in pixels (9:16 aspect ratio)
```

The chart uses a 9:16 aspect ratio (1080×1920), which is optimized for mobile screens and social media stories. This provides ample space for content while maintaining a visually appealing proportion.

### 1.2 Coordinate System
The canvas uses a standard coordinate system where:
- (0,0) is the top-left corner
- X-axis increases to the right
- Y-axis increases downward
- All measurements are in pixels

## 2. Layout Zones & Positioning

The chart layout is divided into four primary zones:

### 2.1 Header Zone (0-340px)
```javascript
// Draw header
ctx.fillText(title, canvasWidth / 2, 160);       // Title at y=160px
ctx.fillText(username.value, canvasWidth / 2, 240); // Username at y=240px
ctx.fillText(timeRange.value, canvasWidth / 2, 300); // Time range at y=300px
ctx.fillRect(canvasWidth / 2 - 60, 340, 120, 2);  // Divider line at y=340px
```

- **Title**: Centered horizontally, positioned at y=160px
- **Username**: Centered horizontally, positioned at y=240px
- **Time Range**: Centered horizontally, positioned at y=300px
- **Divider**: Centered horizontal line (120px wide) at y=340px

### 2.2 Featured Item Zone (340-1140px)
```javascript
ctx.fillText('#1', canvasWidth / 2, 420);  // Rank indicator at y=420px

// Image placement
const imgSize = 440;
const imgX = (canvasWidth - imgSize) / 2;  // Centered horizontally
const imgY = 450;  // Top position of the image

// Text elements below image
ctx.fillText(truncatedName, canvasWidth / 2, 950);  // Item name at y=950px
ctx.fillText(truncatedArtistName, canvasWidth / 2, 1010);  // Artist at y=1010px (if applicable)
ctx.fillText(playcount, canvasWidth / 2, 1070);  // Playcount at y=1070px
```

- **Rank Indicator**: Centered horizontally at y=420px
- **Featured Image**: 440×440px, centered horizontally, top edge at y=450px
- **Item Name**: Centered at y=950px, with text truncation for overflow
- **Artist Name** (if applicable): Centered at y=1010px
- **Playcount**: Centered at y=1070px

### 2.3 List Items Zone (1140-1800px)
```javascript
const listStartY = 1140;  // Starting Y-position for list items
const itemHeight = 120;   // Height of each item
const itemWidth = canvasWidth - 120;  // Width of items (60px padding on each side)
const itemX = 60;         // Left position of items (60px from left edge)

// For each item in the list
const itemY = listStartY + (i * (itemHeight + 20));  // Position with 20px gap between items
```

Each list item contains:
- **Background**: Rounded rectangle covering entire item
- **Rank**: Positioned at (itemX + 24, itemY + 70)
- **Name**: Positioned at (itemX + 90, itemY + 52)
- **Details**: Positioned at (itemX + 90, itemY + 92)

### 2.4 Footer Zone (1800-1920px)
```javascript
const footerY = canvasHeight - 120;  // Footer starts 120px from bottom

// Divider line
ctx.fillRect(canvasWidth / 2 - 150, footerY, 300, 1);

// Site name and URL
ctx.fillText('LastFM Chart Maker', canvasWidth / 2, footerY + 50);
ctx.fillText('lastfmchartmaker.com', canvasWidth / 2, footerY + 90);
```

- **Divider**: 300px wide horizontal line, centered at y=(canvasHeight-120)
- **Site Name**: Centered text at y=(footerY+50)
- **URL**: Centered text at y=(footerY+90)

## 3. Spacing & Alignment Principles

### 3.1 Horizontal Alignment
- **Text Alignment**: Most text is centered (using `ctx.textAlign = 'center'` and drawing at x=canvasWidth/2)
- **Edge Padding**: List items and other elements maintain 60px padding from edges
- **Left-Aligned Text**: Used only in list items where text begins at a fixed distance from left edge

### 3.2 Vertical Spacing
```javascript
// Example of spacing principles in the featured item section
ctx.fillText('#1', canvasWidth / 2, 420);  // Rank
// 30px gap
imgY = 450;  // Image top position
// Image size 440px
// ~60px gap
ctx.fillText(truncatedName, canvasWidth / 2, 950);  // Name
// 60px gap between text elements
ctx.fillText(truncatedArtistName, canvasWidth / 2, 1010);  // Artist
// 60px gap
ctx.fillText(playcount, canvasWidth / 2, 1070);  // Playcount
```

- **Section Gaps**: ~40-60px between major sections
- **Element Gaps**: ~20px between list items
- **Text Spacing**: Approximately 60px between different text elements
- **Image Padding**: Adequate spacing (30-60px) before and after featured images

### 3.3 Text Positioning
When positioning text using `fillText()`, note:
- The Y coordinate represents the **baseline** of the text, not its top
- For text height 'h', baseline is approximately 0.8h from the top
- Font sizes are used to maintain proportion:
  - Main title: 80px
  - Username: 50px
  - Featured item name: 56px
  - List item names: 38px
  - Detail text: 32-40px

## 4. Responsive Techniques

### 4.1 Text Truncation
```javascript
function truncateText(ctx, text, maxWidth) {
  // If text fits within maxWidth, return it as is
  const metrics = ctx.measureText(text);
  if (metrics.width <= maxWidth) {
    return text;
  }
  
  // Otherwise, truncate and add ellipsis
  let truncated = text;
  let width = metrics.width;
  
  while (width > maxWidth && truncated.length > 3) {
    truncated = truncated.slice(0, -1);
    width = ctx.measureText(truncated + '...').width;
  }
  
  return truncated + '...';
}
```

Text that doesn't fit in its allocated space is truncated with an ellipsis to maintain clean layout.

### 4.2 Image Handling
```javascript
// Example of image placement with centered alignment
const imgSize = 440;
const imgX = (canvasWidth - imgSize) / 2;  // Center horizontally
const imgY = 450;  // Position vertically
```

Images are sized proportionally and placed with precise positioning to maintain layout harmony.

## 5. Visual Style Elements

### 5.1 Rounded Corners
```javascript
// Helper function for rounded rectangles
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
```

Rounded corners (12-24px radius) are used for both images and list item backgrounds to create a modern, friendly appearance.

### 5.2 Color Scheme
```javascript
// Examples of color usage
ctx.fillStyle = '#131313';  // Background color (dark gray)
ctx.fillStyle = accentColor;  // Section-specific accent color
ctx.fillStyle = '#FFFFFF';  // Primary text color
ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';  // Secondary text (slightly transparent)
ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';  // List item backgrounds
```

- **Background**: Dark (#131313)
- **Accent Colors**: Section-specific (#FF7597 for artists, #4DD4AC for albums, #64B5F6 for tracks)
- **Text**: White with varying opacity levels for hierarchy

## 6. Modifying the Layout

To adjust the layout or positioning:

### 6.1 Vertical Adjustments
Modify the y-coordinates for elements to move them up or down:
```javascript
// Move title 20px higher
ctx.fillText(title, canvasWidth / 2, 140);  // Changed from 160 to 140

// Increase spacing between list items
const itemY = listStartY + (i * (itemHeight + 30));  // Changed from +20 to +30
```

### 6.2 Horizontal Adjustments
Adjust the x-coordinates or modify width calculations:
```javascript
// Decrease side padding for list items
const itemWidth = canvasWidth - 80;  // Changed from -120 to -80
const itemX = 40;  // Changed from 60 to 40

// Left-align the title
ctx.textAlign = 'left';  
ctx.fillText(title, 60, 160);  // Instead of centering
```

### 6.3 Size Adjustments
Modify size variables to change element dimensions:
```javascript
// Make featured image larger
const imgSize = 500;  // Changed from 440 to 500

// Adjust item height
const itemHeight = 140;  // Changed from 120 to 140
```

## 7. Debugging & Measurement Tips

When making adjustments to positioning:

1. **Visual Grid**: Add temporary grid lines to visualize spacing
   ```javascript
   // Draw temporary horizontal grid lines every 100px
   ctx.strokeStyle = 'rgba(255,0,0,0.3)';
   for (let y = 0; y < canvasHeight; y += 100) {
     ctx.beginPath();
     ctx.moveTo(0, y);
     ctx.lineTo(canvasWidth, y);
     ctx.stroke();
     // Optional: Label grid lines
     ctx.fillText(y.toString(), 10, y);
   }
   ```

2. **Element Boundaries**: Draw temporary rectangles around elements
   ```javascript
   // Draw box around text area for debugging
   ctx.strokeStyle = 'rgba(0,255,0,0.5)';
   ctx.strokeRect(itemX + 90, itemY + 20, itemWidth - 120, 60);
   ```

3. **Incremental Testing**: Make small adjustments and review outputs to fine-tune spacing

## 8. Common Adjustments Guide

Here are solutions for common adjustment needs:

### 8.1 Make the entire layout more compact
```javascript
// Reduce main image size
const imgSize = 400; // (from 440)

// Reduce list item heights
const itemHeight = 100; // (from 120)

// Reduce spacing between sections
const listStartY = 1080; // (from 1140)
```

### 8.2 Add more items to the list
```javascript
// Reduce item height and spacing
const itemHeight = 100; // (from 120)
const itemY = listStartY + (i * (itemHeight + 15)); // (gap from 20 to 15)

// Also consider adjusting font sizes
ctx.font = 'bold 32px sans-serif'; // (from 38px)
```

### 8.3 Adjust for longer text/internationalization
```javascript
// Increase truncation width for languages with longer words
const truncatedName = truncateText(ctx, name, canvasWidth - 80); // (from -120)

// Consider smaller font sizes
ctx.font = 'bold 48px sans-serif'; // (from 56px for featured name)
```

By understanding these principles, you can confidently modify the layout, spacing, and positioning to achieve the exact design requirements for the chart images.

## 9. Visual Reference

Here's a simplified visual reference of the layout zones:

```
+-----------------------------------+
|                                   |
|            HEADER ZONE            |
|          (0px to 340px)           |
|                                   |
+-----------------------------------+
|                                   |
|                                   |
|                                   |
|        FEATURED ITEM ZONE         |
|         (340px to 1140px)         |
|                                   |
|                                   |
|                                   |
+-----------------------------------+
|                                   |
|                                   |
|                                   |
|          LIST ITEMS ZONE          |
|        (1140px to 1800px)         |
|                                   |
|                                   |
|                                   |
+-----------------------------------+
|            FOOTER ZONE            |
|        (1800px to 1920px)         |
+-----------------------------------+
``` 