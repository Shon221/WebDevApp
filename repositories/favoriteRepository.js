const db = require("../config/db");
const Favorite = require("../models/favorite");

class FavoriteRepository {
    async findByUserId(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM Favorites WHERE userId = ? ORDER BY orderIndex ASC`,
                [userId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows.map(row => new Favorite(row)));
                }
            );
        });
    }

    async create({ userId, videoId, title, thumbnail }) {
        const createdAt = new Date().toISOString();
        const orderIndex = await this.getNextOrderIndex(userId);

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Favorites (userId, videoId, title, thumbnail, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, videoId, title, thumbnail, orderIndex, createdAt],
                function (err) {
                    if (err) return reject(err);
                    resolve(
                        new Favorite({
                            id: this.lastID,
                            userId,
                            videoId,
                            title,
                            thumbnail,
                            orderIndex,
                            createdAt,
                        })
                    );
                }
            );
        });
    }

    async delete(id, userId) {
        return new Promise((resolve, reject) => {
            console.log('Deleting favorite ID:', id, 'for user:', userId);
            db.run(
                `DELETE FROM Favorites WHERE id = ? AND userId = ?`,
                [id, userId],
                function (err) {
                    if (err) {
                        console.error('Delete error:', err);
                        return reject(err);
                    }
                    console.log('Rows deleted:', this.changes);
                    resolve(this.changes > 0);
                }
            );
        });
    }

    async updateOrder(userId, favorites) {
        // favorites is array of {id, orderIndex}
        const promises = favorites.map(fav =>
            new Promise((resolve, reject) => {
                db.run(
                    `UPDATE Favorites SET orderIndex = ? WHERE id = ? AND userId = ?`,
                    [fav.orderIndex, fav.id, userId],
                    function (err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            })
        );
        return Promise.all(promises);
    }

    async getNextOrderIndex(userId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT MAX(orderIndex) as maxOrder FROM Favorites WHERE userId = ?`,
                [userId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve((row.maxOrder || 0) + 1);
                }
            );
        });
    }

    async findByVideoId(userId, videoId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM Favorites WHERE userId = ? AND videoId = ?`,
                [userId, videoId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row ? new Favorite(row) : null);
                }
            );
        });
    }
}

module.exports = new FavoriteRepository();