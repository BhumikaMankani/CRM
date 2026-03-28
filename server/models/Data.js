const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
    showstatus: {
        type: String,
        default: 'activate'
    },
    createdByUserId: { type: String },
    createdByUserName: { type: String },
}, { strict: false, timestamps: true });

const getDataModel = (collectionName) => {
    return mongoose.models[collectionName] ||
        mongoose.model(collectionName, DataSchema, collectionName);
};

module.exports = getDataModel;