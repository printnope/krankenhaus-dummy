
const crypto = require('crypto');

function encrypt(data, publicKeyPem) {
    if (!publicKeyPem) {
        throw new Error('Öffentlicher Schlüssel ist erforderlich.');
    }

    // 1) Objekt → JSON → Buffer
    const bufferData = Buffer.from(JSON.stringify(data), 'utf8');

    // 2) RSA-OAEP Verschlüsselung
    const encryptedBuffer = crypto.publicEncrypt(
        {
            key: publicKeyPem,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        bufferData
    );

    // 3) Buffer → Base64
    const encryptedData = encryptedBuffer.toString('base64');

    // 4) Objekt zurückgeben
    return { encryptedData };
}
