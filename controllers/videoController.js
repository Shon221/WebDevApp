const favoriteRepository = require("../repositories/favoriteRepository");
const youtubeService = require("../services/youtubeService");

class VideoController {
    async showVideos(req, res) {
        try {
            const userId = req.session.user.id;
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

            // Check if already favorited
            const existing = await favoriteRepository.findByVideoId(userId, videoId);
            if (existing) {
                return res.redirect("/videos");
            }

            await favoriteRepository.create({ userId, videoId, title, thumbnail });
            res.redirect("/videos");
        } catch (err) {
            res.redirect("/videos");
        }
    }

    async deleteFavorite(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;
            await favoriteRepository.delete(id, userId);
            res.redirect("/videos");
        } catch (err) {
            res.redirect("/videos");
        }
    }

    async updateOrder(req, res) {
        try {
            const { favorites } = req.body; // array of {id, orderIndex}
            const userId = req.session.user.id;
            await favoriteRepository.updateOrder(userId, favorites);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new VideoController();