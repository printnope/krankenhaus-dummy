// decryptJson.js
const crypto = require('crypto');
const { webcrypto } = require('crypto');

const atob = (str) => Buffer.from(str, 'base64').toString('binary');
const TextDecoder = require('util').TextDecoder;

async function rsaDecrypt(encryptedData, pem) {
    const b64 = pem.replace(/-----\w+ PRIVATE KEY-----|\s+/g, '');
    if (!/^[A-Za-z0-9+/]+=*$/.test(b64))
        throw new Error('Private Key enthält ungültige Zeichen');
    const der = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const key = await webcrypto.subtle.importKey(
        'pkcs8',
        der.buffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
    );

    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    try {
        const decBuf = await webcrypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, data);
        return JSON.parse(new TextDecoder().decode(decBuf));
    } catch (err) {
        throw new Error('Fehler beim Entschlüsseln der Daten: ' + err);
    }
}

async function aesDecrypt(encryptedData, aesKey) {
    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);           // Die ersten 12 Bytes sind das IV
    const ciphertext = data.slice(12);      // Rest = verschlüsselte Nachricht

    const keyArray = Uint8Array.from(atob(aesKey), c => c.charCodeAt(0));
    if (keyArray.length !== 32) {
        throw new Error('AES-Schlüssel muss 32 Bytes (256-bit) lang sein');
    }

    const cryptoKey = await webcrypto.subtle.importKey(
        'raw',
        keyArray.buffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    try {
        const decBuf = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
        return JSON.parse(new TextDecoder().decode(decBuf));
    } catch (err) {
        throw new Error('Fehler beim Entschlüsseln der Daten: ' + err);
    }
}

async function hybridDecrypt(encryptedKey, encryptedData, rsaKey) {
    const decryptedKey = await rsaDecrypt(encryptedKey, rsaKey);
    const aesKey = decryptedKey.key;
    return await aesDecrypt(encryptedData, aesKey);
}


async function decryptJson(data) {
    const privateKeyPem = process.env.PRIVATE_KEY;
    if (!privateKeyPem) {
        throw new Error('Privater Schlüssel nicht in der .env gefunden.');
    }

    try {
        const decryptedData = await hybridDecrypt(data.encryptedKey, data.encryptedData, privateKeyPem);
        return decryptedData;
    } catch (error) {
        throw new Error(`Entschlüsselung fehlgeschlagen: ${error.message}`);
    }
}

module.exports = decryptJson;
