# Last.fm Chart Maker

![Last.fm Chart Maker Logo](https://lastfm-img2.akamaized.net/i/u/270x270/2a96cbd8b46e442fc41c2b86b821562f.png)

Last.fm Chart Maker is a modern web application that allows you to visualize and share your music listening history from Last.fm. Create beautiful, customizable charts showing your top artists, albums, tracks, and music tags across different time periods.

## 🎵 Features

### User Profile Integration
- Connect with your Last.fm account
- View comprehensive listening statistics
- Display user profile information and playcount metrics

### Top Music Visualizations
- **Top Artists**: View your most listened artists with play counts and images
- **Top Albums**: Explore your favorite albums with detailed statistics
- **Top Tracks**: See your most played songs with play frequency
- **Top Tags**: Analyze your music taste with genre/tag visualization

### Time Period Selection
- All Time
- Last 7 Days
- Last Month
- Last 3 Months
- Last 6 Months
- Last Year

### Detailed Item Information
- Artist biographies and similar artists
- Album details including track listings
- Track information with lyrics and similar tracks
- Tag analysis showing related genres

### Export and Sharing
- Generate beautiful chart images for social media sharing
- Canvas-based image generation in 9:16 aspect ratio (perfect for stories)
- Customizable layouts for different chart types

### Spotify Integration
- Enhance visualization with Spotify album artwork
- Preview Spotify tracks directly in the application

## 🚀 Technology Stack

- **Frontend**: Vue 3 with Composition API
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **API Integration**: Last.fm API, Spotify API
- **Visualization**: Chart.js, ApexCharts
- **Build System**: Vite

## 🛠️ Setup and Installation

### Prerequisites
- Node.js (v14+)
- API Keys from Last.fm and Spotify (for full functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lastfmchartmaker.git
cd lastfmchartmaker
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env` file with the following keys:
```
VITE_LASTFM_API_KEY=your_lastfm_api_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

## 📊 Usage

1. Enter your Last.fm username in the input field at the top
2. Select a time period from the dropdown menu
3. View your top artists, albums, tracks, and tags charts
4. Click on any item to see detailed information
5. Use the export functionality to generate shareable images
6. Explore insights about your music taste and listening habits

## 📱 Mobile Friendly

The application is fully responsive and works well on mobile devices, making it easy to create and share charts on the go.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚖️ License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Last.fm API](https://www.last.fm/api) for providing access to music listening data
- [Spotify API](https://developer.spotify.com/documentation/web-api/) for enhanced music metadata
- All the open-source libraries that made this project possible
