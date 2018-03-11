const {conn} = require('./bigchainConnect');
const BigchainDB = require('bigchaindb-driver');
const axios = require('axios');

function createTransactionObject(object, metaData, key) {
    const txCreateObject = BigchainDB.Transaction.makeCreateTransaction(
        // Asset field
        {object},
        // Metadata field, contains information about the transaction itself
        // (can be `null` if not needed)
        {metaData},
        // Output. For this case we create a simple Ed25519 condition
        [BigchainDB.Transaction.makeOutput(BigchainDB.Transaction.makeEd25519Condition(key))],
        // Issuers
        key
    );

    console.log(txCreateObject);
    // The owner of the painting signs the transaction
    const txSigned = BigchainDB.Transaction.signTransaction(txCreateObject, alice.privateKey);
    console.log(txSigned);
    // Send the transaction off to BigchainDB
    conn.postTransaction(txSigned)
    // Check the status of the transaction
        .then(() => conn.pollStatusAndFetchTransaction(txSigned.id))
        .then(res => {
            document.body.innerHTML += '<h3>Transaction created</h3>';
            document.body.innerHTML += txSigned.id
            // txSigned.id corresponds to the asset id of the painting
        })
}

function transferOwnership(txCreatedID, newOwner) {
    const newUser = new BigchainDB.Ed25519Keypair();
    // Get transaction payload by ID
    conn.getTransaction(txCreatedID)
        .then((txCreated) => {
            const createTranfer = BigchainDB.Transaction.
            makeTransferTransaction(
                // The output index 0 is the one that is being spent
                [{
                    tx: txCreated,
                    output_index: 0
                }],
                [BigchainDB.Transaction.makeOutput(
                    BigchainDB.Transaction.makeEd25519Condition(
                        newOwner.publicKey))
                ],
                {
                    datetime: new Date().toString(),
                    value: {
                        value_eur: '30000000€',
                        value_btc: '2100',
                    }
                }
            );
            // Sign with the key of the owner of the painting (Alice)
            const signedTransfer = BigchainDB.Transaction
                .signTransaction(createTranfer, alice.privateKey)
            return conn.postTransaction(signedTransfer)
        })
        .then((signedTransfer) => conn.pollStatusAndFetchTransaction(signedTransfer.id))
        .then(res => {
            document.body.innerHTML += '<h3>Transfer Transaction created</h3>'
            document.body.innerHTML += res.id
        })
}

function getTxInfo(assetID) {
    return axios.get('http://139.59.12.96:59984/api/v1/transactions/' + assetID);
}

function userTransactions(publicKey) {
    return axios.get('http://139.59.12.96:59984/api/v1/outputs?public_key=' + publicKey);
}

module.exports = {
    createTransactionObject,
    transferOwnership,
    getTxInfo,
    userTransactions
};