function verifyToken(req, res, next) {

    const authHeader = req.headers['authorization'] || '';
    const parts = authHeader.split(' ');

    const token = (parts.length === 2 && parts[0] === 'Bearer') ? parts[1] : '';

    // Vergleich mit dem in .env hinterlegten Token
    if (token !== process.env.APPTOKEN) {
        return res.socket.destroy();
    }
    next();
}

module.exports = { verifyToken };
