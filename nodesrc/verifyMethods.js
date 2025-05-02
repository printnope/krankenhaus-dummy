function verifyToken(req, res, next) {

    const authHeader = req.headers['authorization'] || '';
    const parts = authHeader.split(' ');

    const token = (parts.length === 2 && parts[0] === 'Bearer') ? parts[1] : '';

    // Vergleich mit dem in .env hinterlegten Token
    if (token !== process.env.APPTOKEN) {
        // Verbindung direkt schließen, ohne HTTP-Antwort
        console.log("token =" + token);
        console.log("part 0 =" + parts[0]);
        console.log("part 1 =" + parts[1]);
        console.log("authHeader =" + authHeader);
        console.log("process.env.APPTOKEN =" + process.env.APPTOKEN);
        console.log("parts =" + parts);
        return res.socket.destroy();
    }
    next();
}

module.exports = { verifyToken };
