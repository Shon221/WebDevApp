const axios = require('axios');

class YouTubeService {
    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY;
        // No throw here, to allow URL handling without API
    }

    async searchVideos(query, maxResults = 10) {
        try {
            // Check if query is a YouTube URL
            const videoId = this.extractVideoId(query);
            if (videoId) {
                // Use oEmbed to get video details without API key
                const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
                const response = await axios.get(oembedUrl);
                return [{
                    videoId: videoId,
                    title: response.data.title,
                    thumbnail: response.data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/default.jpg`,
                    description: response.data.description || 'Video from provided URL'
                }];
            }

            // For regular searches, try API if key is available
            if (!this.apiKey) {
                throw new Error('YouTube API key not configured for search');
            }

            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${this.apiKey}`;
            const response = await axios.get(url);

            return response.data.items.map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.default?.url || '',
                description: item.snippet.description
            }));
        } catch (error) {
            console.error('YouTube API error:', error.response?.data || error.message);
            // For URLs, if oEmbed fails, fallback
            const videoId = this.extractVideoId(query);
            if (videoId) {
                return [{
                    videoId: videoId,
                    title: `YouTube Video (${videoId})`,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/default.jpg`,
                    description: 'Video from provided URL (details unavailable)'
                }];
            }
            throw new Error(`Failed to search YouTube videos: ${error.message}`);
        }
    }

    extractVideoId(url) {
        const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : null;
    }
}

module.exports = new YouTubeService();