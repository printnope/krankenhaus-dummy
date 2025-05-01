const crypto = require('crypto');

/**
 * Verschlüsselt ein JavaScript-Objekt mit RSA-OAEP und gibt ein Objekt mit dem Base64-codierten Cipher-Text zurück.
 *
 * @param {Object} data          – Klartext-Daten, z.B. { id: 123, email: "max@example.com" }
 * @param {string} publicKeyPem  – PEM-formatierter RSA-Public-Key als String
 * @returns {{ encryptedData: string }}
 *   – Objekt mit Feld `encryptedData`, das den verschlüsselten Base64-String enthält
 * @throws {Error} Wenn publicKeyPem fehlt oder Verschlüsselung fehlschlägt
 */
function encrypt(data, publicKeyPem) {
    if (!publicKeyPem) {
        throw new Error('Öffentlicher Schlüssel ist erforderlich.');
    }

    // 1) JSON-String → Buffer
    const bufferData = Buffer.from(JSON.stringify(data), 'utf8');

    // 2) Buffer mit RSA-OAEP (SHA-256) verschlüsseln
    const encryptedBuffer = crypto.publicEncrypt(
        {
            key: publicKeyPem,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        bufferData
    );

    // 3) Buffer → Base64-String
    const encryptedData = encryptedBuffer.toString('base64');

    // 4) Rückgabeobjekt mit verschlüsseltem Payload
    return { encryptedData };
}

module.exports = encrypt;
