class Favorite {
    constructor({ id, userId, videoId, title, thumbnail, orderIndex, createdAt }) {
        this.id = id;
        this.userId = userId;
        this.videoId = videoId;
        this.title = title;
        this.thumbnail = thumbnail;
        this.orderIndex = orderIndex;
        this.createdAt = createdAt;
    }
}

module.exports = Favorite;