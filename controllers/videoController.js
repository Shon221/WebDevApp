const favoriteRepository = require("../repositories/favoriteRepository");
const youtubeService = require("../services/youtubeService");

class VideoController {
    async showVideos(req, res) {
        try {
            const userId = req.session.user.id;
            console.log('showVideos - User ID:', userId);
            const favorites = await favoriteRepository.findByUserId(userId);
            res.render("videos", {
                user: req.session.user,
                favorites,
                searchResults: null,
                error: null
            });
        } catch (err) {
            res.status(500).render("videos", {
                user: req.session.user,
                favorites: [],
                searchResults: null,
                error: err.message
            });
        }
    }

    async searchVideos(req, res) {
        try {
            const { query } = req.body;
            const userId = req.session.user.id;
            console.log('searchVideos - User ID:', userId, 'Query:', query);
            const favorites = await favoriteRepository.findByUserId(userId);
            const searchResults = await youtubeService.searchVideos(query);
            res.render("videos", {
                user: req.session.user,
                favorites,
                searchResults,
                error: null
            });
        } catch (err) {
            const userId = req.session.user.id;
            console.log('searchVideos error - User ID:', userId, 'Error:', err.message);
            const favorites = await favoriteRepository.findByUserId(userId);
            res.render("videos", {
                user: req.session.user,
                favorites,
                searchResults: null,
                error: err.message
            });
        }
    }

    async addFavorite(req, res) {
        try {
            const { videoId, title, thumbnail } = req.body;
            const userId = req.session.user.id;
            console.log('addFavorite - User ID:', userId, 'Video ID:', videoId);

            // Check if already favorited
            const existing = await favoriteRepository.findByVideoId(userId, videoId);
            if (existing) {
                console.log('Video already favorited for user:', userId);
                return res.redirect("/videos");
            }

            await favoriteRepository.create({ userId, videoId, title, thumbnail });
            console.log('Favorite added for user:', userId);
            res.redirect("/videos");
        } catch (err) {
            console.log('addFavorite error - User ID:', req.session.user.id, 'Error:', err.message);
            res.redirect("/videos");
        }
    }

    async deleteFavorite(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;
            console.log('deleteFavorite - User ID:', userId, 'Favorite ID:', id);
            await favoriteRepository.delete(id, userId);
            console.log('Favorite deleted for user:', userId);
            res.redirect("/videos");
        } catch (err) {
            console.log('deleteFavorite error - User ID:', req.session.user.id, 'Error:', err.message);
            res.redirect("/videos");
        }
    }

    async updateOrder(req, res) {
        try {
            const { favorites } = req.body; // array of {id, orderIndex}
            const userId = req.session.user.id;
            console.log('updateOrder - User ID:', userId, 'Favorites:', favorites);
            await favoriteRepository.updateOrder(userId, favorites);
            res.json({ success: true });
        } catch (err) {
            console.log('updateOrder error - User ID:', req.session.user.id, 'Error:', err.message);
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new VideoController();