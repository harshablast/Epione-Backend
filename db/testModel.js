/**
 * Created by hemanthkumar on 11/03/18.
 */
const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var testSchema = new mongoose.Schema({
    doctorID: {
        type:String,
        default:null
    },
    testCode: {
        type:String,
        default:null
    },
    scheduledDate: {
        type: Date,
        default: Date.now()
    },
    testStatus: {
        type:Boolean,
        default:false
    },
    diagnosticCodes: {
        ICDx: {type: String, default: null},
        date: {type: Date, default: Date.now()},
        doctorID: {type: String},
        latitude: {type: String},
        longitude: {type: String}
    }
});

var Test = mongoose.model('Test', testSchema);



module.exports = {Test};