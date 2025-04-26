const crypto = require('crypto');

function encryptData(id, email, encryptedId, publicKeyPem) {
    // 1. Objekt erstellen
    const obj = {
        enc: encryptedId,
        id: id,
        email: email
    };

    // 2. Objekt in JSON-String umwandeln
    const jsonString = JSON.stringify(obj);

    // 3. JSON-String verschlüsseln mit PublicKey
    const encryptedBuffer = crypto.publicEncrypt(publicKeyPem, Buffer.from(jsonString, 'utf8'));

    return encryptedBuffer;
}

module.exports = { encryptData };
