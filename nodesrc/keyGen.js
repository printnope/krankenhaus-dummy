const { generateKeyPair } = require('crypto');
const { promisify } = require('util');

const generateKeyPairAsync = promisify(generateKeyPair);

async function createKeyPair() {
    const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {

        modulusLength: 2048,

        //Public Key Encoding
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },

        //Private Key Encoding
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });

    return { publicKey, privateKey };
}

module.exports = { createKeyPair };
