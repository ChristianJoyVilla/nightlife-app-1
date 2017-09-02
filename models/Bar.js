const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const barSchema = new Schema({
  name: String,
  going: Array
}, { timestamp: true });

module.exports = mongoose.model('bar', barSchema);
