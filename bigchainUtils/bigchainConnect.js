const BigchainDB = require('bigchaindb-driver');
const bip39 = require('bip39');

const API_PATH = 'http://139.59.12.96:59984/api/v1/';

const conn = new BigchainDB.Connection(API_PATH, {
    app_id: 'f0c5a7ce',
    app_key: 'f97a09137b19d4693554d24efb7dbd43'
});

module.exports = {
    conn
}