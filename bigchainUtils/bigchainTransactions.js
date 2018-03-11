const {conn} = require('./bigchainConnect');
const BigchainDB = require('bigchaindb-driver');
const axios = require('axios');

function createTransactionObject(object, metaData, pubKey, priKey) {
    const txCreateObject = BigchainDB.Transaction.makeCreateTransaction(
        {object},
        {metaData},
        [BigchainDB.Transaction.makeOutput(BigchainDB.Transaction.makeEd25519Condition(pubKey))],
        pubKey
    );

    const txSigned = BigchainDB.Transaction.signTransaction(txCreateObject, priKey);
    conn.postTransaction(txSigned)
        .then(() => conn.pollStatusAndFetchTransaction(txSigned.id), (err) => console.log(err))
        .then(retrievedTx => console.log('Transaction', retrievedTx.id, 'successfully posted.'), err => console.log(err))
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