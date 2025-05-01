const crypto = require('crypto');

function encrypt(data, publicKeyPem) {
    try {
        if (!publicKeyPem) {
            throw new Error('Öffentlicher Schlüssel ist erforderlich.');
        }

        const jsonString = JSON.stringify(data);
        const bufferData = Buffer.from(jsonString, 'utf8');

        const encryptedBuffer = crypto.publicEncrypt(
            {
                key: publicKeyPem,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            bufferData
        );

        return encryptedBuffer.toString('base64');
    } catch (error) {
        console.error('Fehler bei der Verschlüsselung:', error.message);
        throw new Error('Verschlüsselung fehlgeschlagen.');
    }
}

module.exports = encrypt;
