/************************************************************/
// Startup Process
/************************************************************/

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/edge');

var db = mongoose.connection;
// to start in terminal with no authorization restrictions:
// mongod --port 27017 --dbpath /data/db

db.on('error', function(err) {
  console.log('mongoose connection error ', err);
});

db.once('open', function() {
  console.log('mongoose connected successfully');
});

/************************************************************/
// Schemas
/************************************************************/

const dumpSchema = mongoose.Schema({
  id: {
    type: String,
    unique: false,
    required: false
  },
  auc: Number,
  bid: Number,
  buyout: Number,
  context: Number,
  item: Number,
  owner: String,
  ownerRealm: String,
  quantity: Number,
  rand: Number,
  seed: Number,
  timeLeft: String
});
const Dumps = mongoose.model('dumps', dumpSchema);

/************************************************************/
// Inserts 
/************************************************************/

const insertBatch = (data) => {
  const dumpId = JSON.stringify(new Date());
  mongoose.connection.db.listCollections({name: dumpId})
    .next(function(err, doc) {
      if (doc) {
        console.log('dump already exists');
      } else {
        const newDump = mongoose.model(dumpId, dumpSchema);
        data = JSON.parse(data);
        console.log('inserting: ', data.auctions.length);
        newDump.insertMany(data.auctions);
      }
    });
}

// each batch should be a new collection
// each batch is roughly 23.1 megabytes / 23,100 kilobytes
// mlab offers 500 megabytes free

/************************************************************/
// Queries
/************************************************************/

var selectAll = function(item, callback) {
  mongoose.connection.db.listCollections().toArray(function(err, collInfos) {
    console.log(collInfos[collInfos.length-1].name);
    const lastBatch = collInfos[collInfos.length-1].name;
    // const coll = collInfos[collInfos.length-1];
    const coll = mongoose.model(lastBatch, dumpSchema);
    coll.find({"item": item}, function(err, results) {
      if(err) {
        console.log('err: ', err)
      } else {
        console.log('results: ', results)
        callback(results);
      }
    })
  })
};

/************************************************************/
// Node Exports
/************************************************************/

module.exports = {
  insertBatch,
  selectAll
}