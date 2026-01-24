const authService = require("../services/authService");

class AuthController {
    showRegister(req, res) {
        res.render("register", { error: null });
    }

    async register(req, res) {
        try {
            const { email, fullName, password } = req.body;
            const user = await authService.register({ email, fullName, password });

            // Regenerate session ID to prevent session fixation
            req.session.regenerate((err) => {
                if (err) {
                    console.error('Session regenerate error:', err);
                    return res.status(500).render("register", { error: 'Session error' });
                }

                // Store user in new session
                req.session.user = { id: user.id, email: user.email, fullName: user.fullName };
                req.session.save((saveErr) => {
                    if (saveErr) {
                        console.error('Session save error (register):', saveErr);
                        return res.status(500).render("register", { error: 'Session error' });
                    }
                    console.log('New session created for user:', user.id, 'Session ID:', req.sessionID);
                    res.redirect("/");
                });
            });
        } catch (err) {
            res.status(400).render("register", { error: err.message });
        }
    }

    showLogin(req, res) {
        res.render("login", { error: null });
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await authService.login({ email, password });

            // Regenerate session ID to prevent session fixation
            req.session.regenerate((err) => {
                if (err) {
                    console.error('Session regenerate error:', err);
                    return res.status(500).render("login", { error: 'Session error' });
                }

                // Store user in new session
                req.session.user = { id: user.id, email: user.email, fullName: user.fullName };
                req.session.save((saveErr) => {
                    if (saveErr) {
                        console.error('Session save error (login):', saveErr);
                        return res.status(500).render("login", { error: 'Session error' });
                    }
                    console.log('New session created for user:', user.id, 'Session ID:', req.sessionID);
                    res.redirect("/");
                });
            });
        } catch (err) {
            res.status(400).render("login", { error: err.message });
        }
    }

    logout(req, res) {
        const sessionID = req.sessionID;
        console.log('Destroying session:', sessionID);
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return res.redirect("/login");
            }
            console.log('Session destroyed:', sessionID);
            res.clearCookie('sessionId');
            res.redirect("/login");
        });
    }
}

module.exports = new AuthController();
