// decryptJson.js
const crypto = require('crypto');

/**
 * Entschlüsselt einen Base64-kodierten Ciphertext, der mit RSA-OAEP/SHA-256 erzeugt wurde,
 * und gibt das ursprüngliche JSON-Objekt zurück.
 *
 * @param {string} encryptedBase64 – Base64-kodierter Ciphertext
 * @returns {Object}               – Das entschlüsselte Objekt (z.B. { id, email })
 * @throws {Error}                – Bei fehlendem Schlüssel oder Entschlüsselungsfehler
 */
function decryptJson(encryptedBase64) {
    const privateKeyPem = process.env.PRIVATE_KEY;
    if (!privateKeyPem) {
        throw new Error('Privater Schlüssel nicht in der .env gefunden.');
    }

    // Base64 → Buffer
    const buffer = Buffer.from(encryptedBase64, 'base64');

    // RSA-OAEP Decryption mit SHA-256
    const decryptedBuffer = crypto.privateDecrypt(
        {
            key: privateKeyPem,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        buffer
    );

    // Buffer → UTF-8 → JSON
    return JSON.parse(decryptedBuffer.toString('utf8'));
}

module.exports = decryptJson;
