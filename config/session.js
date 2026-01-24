const session = require("express-session");
const path = require("path");
const SQLiteStore = require("connect-sqlite3")(session);
const crypto = require('crypto');

const store = new SQLiteStore({
    db: "sessions.sqlite",
    dir: path.join(__dirname, ".."),
    table: 'sessions'
});

module.exports = session({
    store: store,
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
    name: 'sessionId',
    genid: (req) => {
        // Generate completely random session ID each time
        return crypto.randomBytes(32).toString('hex');
    }
});
