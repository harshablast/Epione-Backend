var express = require('express');
var bodyParser  = require('body-parser');
var bip39 = require('bip39');
const BigchainDB = require('bigchaindb-driver');

const {createTransactionObject, transferOwnership, getTxInfo, userTransactions,getMetadata} = require('./bigchainUtils/bigchainTransactions');
const {ws} = require('./webSocket/webSocketConnect');
var {mongoose} = require('./db/mongoose');
var {User} = require('./db/userModel');
var {Test} = require('./db/testModel');

const port = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/register', (req, res) => {

    const keyPair = new BigchainDB.Ed25519Keypair();
    email = req.body.email;
    password = req.body.password;

    body = {
        email,
        password,
        key: keyPair.publicKey
    };
    console.log(body);

    var user = new User(body);

    User.findOne({email: user.email}).then((foundUser) => {
        if (!foundUser) {
            console.log('No existing email. Proceed with registration');
            user.save().then(() => {
                res.json({
                    status: 1,
                    message: "User Successfully registered",
                    privateKey: keyPair.privateKey,
                    publicKey: keyPair.publicKey
                });
            }, (e) => {
                console.log(e);
            });
        }
        else {
            console.log('Email already exists!');
            res.json({
                status: 0,
                message: "Email already exists"
            });
        }
    }, (e) => {
        console.log(e);
    });
});


app.post('/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        res.json({
            status: 1,
            message: "Successfully logged in",
            key: {

            }
        });
    }, (errJson) => {
        res.json(errJson);
    });

    }, (err) => {
        console.log(err);
});

app.post('/push2chain', (req,res) => {
    pubKey = req.body.pubKey;
    priKey = req.body.priKey;

    txAsset = req.body.txAsset;
    txMetaData = req.body.txMetaData;

    console.log({
        pubKey,
        priKey,
        txAsset,
        txMetaData
    });

    createTransactionObject(txAsset, txMetaData, pubKey, priKey, (err, txID) => {
        if(err){
            console.log(err);
            res.json({
                status: 0,
                message: err
            })
        } else {
            res.json({
                status: 1,
                message: "Transaction" + txID + "has been updated in BlockChain database succesfully"
            })
        }
    });
});

app.post('/getfromchain', (req,res) => {
    pubKey = req.body.pubKey;

    getMetadata(pubKey, (data) => {
        console.log(data);
        res.json(data);
    });
    //userTransactions(pubKey).then((data) => {
    //    res.json(data.data);
    //},(err) => {
    //console.log(err);
    //});

});


ws.on('open', () => {
    console.log("CONNECTED");
});
ws.on('connection', function connection(ws) {
    ws.on('message', (data) => {
        const json = JSON.parse(data);

        if (json.type == 0) {
            //Client is requesting patient's transactions
            publicKey = json.publicKey;
            userTransactions(publicKey)
                .then((transactions) => {
                    ws.send(transactions)
                })
                .catch((error) => {
                    console.log(error)
                })

        } else if (json.type == 1) {
            //Client is requesting to push a transaction
            transaction = json.transaction;
            createTransactionObject(transaction);
        } else {
            //Client is requesting to get info of a transaction
            txID = json.txID;
            getTxInfo(txID)
                .then((txInfo) => {
                    ws.send(txInfo)
                })
                .catch((error) => {
                    console.log(error)
                })

        }
    });
});




app.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});