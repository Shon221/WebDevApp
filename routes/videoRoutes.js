const express = require("express");
const videoController = require("../controllers/videoController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// All video routes require authentication
router.use(requireAuth);

router.get("/videos", videoController.showVideos);
router.post("/videos/search", videoController.searchVideos);
router.post("/videos/favorites", videoController.addFavorite);
router.delete("/videos/favorites/:id", videoController.deleteFavorite);
router.put("/videos/favorites/order", videoController.updateOrder);

module.exports = router;