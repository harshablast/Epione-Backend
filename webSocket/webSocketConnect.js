const WebSocket = require('ws');
const axios = require('axios');

const ws = new WebSocket('ws://139.59.12.96:59985/api/v1/streams/valid_transactions');

module.exports = {
    ws
}