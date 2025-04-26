const crypto = require('crypto');

function decryptJSON(encryptedData, privateKeyPem) {

    const encryptedBuffer = Buffer.from(encryptedData, 'hex');

    // Entschlüsseln des gesamten Objekts
    const decryptedBuffer = crypto.privateDecrypt(privateKeyPem, encryptedBuffer);
    const decryptedJSON = decryptedBuffer.toString('utf8');

    // Umwandeln in ein Objekt
    const dataObj = JSON.parse(decryptedJSON);

    // enc-Feld ebenfalls entschlüsseln
    const encBuffer = Buffer.from(dataObj.enc, 'hex');
    const decryptedEncBuffer = crypto.privateDecrypt(privateKeyPem, encBuffer);
    const decCode = parseInt(decryptedEncBuffer.toString('utf8'), 10);

    // Zusammenbauen des neuen Objekts
    return {
        dec: decCode,
        id: dataObj.id,
        email: dataObj.email
    };
}

module.exports = { decryptJSON };
