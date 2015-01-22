var express = require('express');
var fs = require('fs');
var path = require("path");
var router = express.Router();

router.get('/', function(req, res) {
  res.redirect("userdirectories");
});
router.get('/userdirectories', function(req, res) {
    var db = req.db;
    var collection = db.get('userdirectorycollection');
    collection.find({},{},function(e,docs){
        res.render('userdirectories', {
            "userlist" : docs
        });
    });
});

router.get('/updateuserdirectory/:id', function(req, res) {
    var doc_id = new require('mongodb').ObjectID(req.params.id);
    var db = req.db;
    var collection = db.get('userdirectorycollection');

    collection.findOne({_id: doc_id}, function(err, document) {
      console.log(document.username);

      res.render('updateuserdirectory', { user: document });
    });
});
router.post('/updateuserdirectory/:id', function(req, res) {
    var doc_id = new require('mongodb').ObjectID(req.params.id);
    var db = req.db;
    var collection = db.get('userdirectorycollection');

    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    
    fs.readFile(req.files.uploadImage.path, function (err, data) {
        var imageName = req.files.uploadImage.name;
        if(!imageName)
        {
            console.log("There was an error");
            res.redirect("/");
            res.end();
        } 
        else
        {
            var pathCreate= path.join(__dirname, '../public', 'images');
            var newPath = pathCreate + "/" + imageName;

            fs.writeFile(newPath, data, function (err) {
                collection.update(
                    { _id: doc_id },
                    { 
                        $set:
                        { 
                            firstname: firstName,
                            lastname : lastName,
                            imageurl : "/images/" +  req.files.uploadImage.name
                        }
                    }, function (err, doc) {
                    if (err) {
                        res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        res.redirect("/userdirectories");
                    }
                });
            });
        }
    });
});
router.get('/adduserdirectory', function(req, res) {
    res.render('adduserdirectory', { title: 'Add New User' });
});
router.post('/adduserdirectory', function(req, res) {
    var db = req.db;
    var collection = db.get('userdirectorycollection');
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;

    fs.readFile(req.files.uploadImage.path, function (err, data) {
        var imageName = req.files.uploadImage.name;
        if(!imageName){
            console.log("There was an error");
            res.redirect("/");
            res.end();
        } 
        else {
            var pathCreate= path.join(__dirname, '../public', 'images');
            var newPath = pathCreate + "/" + imageName;
            fs.writeFile(newPath, data, function (err) {

                collection.insert({
                    "firstname" : firstName,
                    "lastname" : lastName,
                    "imageurl" :"/images/" +  req.files.uploadImage.name
                }, function (err, doc) {
                    if (err) {
                        res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        res.redirect("userdirectories");
                    }
                });
            });
        }
    });
    
    
});
router.delete('/deleteuserdirectory/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('userdirectorycollection');
    var docid = new require('mongodb').ObjectID(req.params.id);
    
    collection.remove({"_id" : docid});
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Hello");
});

/* GET home page. */
//router.get('/', function(req, res) {
//  res.render('home', { title: 'Express' });
//});

module.exports = router;
