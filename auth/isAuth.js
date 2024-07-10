exports.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.status(401).json({ error: 'Unauthorized access: you are not allowed to be here!' });
}
