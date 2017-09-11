const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const barSchema = new Schema({
  yelp_id: String,
  going: Array
}, { timestamp: true });

module.exports = mongoose.model('bar', barSchema);
