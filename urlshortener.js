const express = require('express');
const path = require('path');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://agbales:mlaber1@dbh36.mlab.com:27367/heroku_0l5llftx';
const app = express();
const port = process.env.PORT || 8080;

app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
	process.on('uncaughtException', function (err) {
	    console.log(err);
	});
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get('/urls', function(req, res){
   MongoClient.connect(url, function(err, db) {
      if (err) throw err
      console.log("connected to mongo")
      var collection = db.collection('urls');
      collection.find({}).toArray(function(err, result) {
         if (err) throw err 
         res.send(result);
        db.close()
      });
   });
});

app.get('/:query', function(req, res) {
    var query = req.params.query
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err
        console.log('Connection established to', url);
        
        db.collection('urls').find({
            short : query
        }).toArray(function(err, docs) {
            if (err) throw err
            res.redirect(docs[0].original)
            db.close();
        })
    });
    
});

app.get('/http(s)?://*', function(req, res) {
    var fullUrl = req.url.slice(1);
    var listing;
    
    MongoClient.connect(url, function (err, db) {
        if (err) throw err
        console.log('Connection established to', url);
        var shortUrl;
        
        db.collection('urls').count()
                            .then(function(num) {
                                if (err) throw err;
                                listing = {
                                    original : fullUrl,
                                    short: num.toString()
                                }
                                console.log(listing);
                                insertListing(err, listing);
                            });
                            
        function insertListing() {
            var collection = db.collection('urls');
            collection.insert(listing, function(err, data) {
                if (err) throw err
                res.send('https://url-shortner-agbales.c9users.io/' + listing.short);
                db.close();
            });
        }
    });
});   
        


