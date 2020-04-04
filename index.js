const express = require("express");
const app = express();
const db = require("./public/js/database.js");
const s3 = require("./s3.js");
const chalk = require("chalk");
const { s3Url } = require("./config.json");

////////////////////////////////////////////////
///// file upload boilerplate //////////////////
////////////////////////////////////////////////

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    // create unique identifier so you can upload one image multiple times without throwing errors
    filename: function(req, file, callback) {
        uidSafe(24)
            .then(function(uid) {
                callback(null, uid + path.extname(file.originalname));
            })
            .catch(err => {
                console.log("error in file upload: ", err);
            });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        // 2 MB
        fileSize: 2097152
    }
});

////////////////////////////////////////////////
///// file upload boilerplate end //////////////
////////////////////////////////////////////////

//this serves all the front end requests
app.use(express.static("public"));

// important
app.use(express.json());

//any routes are just for info/data (no rendering / HTML stuff)

app.get("/cards", (req, res) => {
    console.log("I am the GET route for /cards");
    db.getImageData()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch(err => {
            console.log("error in image data request: ", err);
        });
});

// multer stuff and then the function that's defined in s3.js
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    // console.log("input: ", req.body);
    // console.log(chalk.red.bgBlue("file: "));
    // console.log(req.file);
    let { title, description, username } = req.body;
    // let title = req.body.title;
    // let description = req.body.description;
    // let username = req.body.username;
    let url = s3Url + req.file.filename;
    // console.log("url: ", url);
    if (req.file) {
        db.insertImageIntoDB(url, username, title, description)
            .then(({ rows }) => {
                // console.log("image was inserted");
                // console.log("rows: ", rows);
                res.json(rows);
            })
            .catch(err => {
                console.log("err insert failed", err);
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.get("/image-info/:id", (req, res) => {
    console.log(chalk.blue.bgRed("GET to /info"));
    console.log(req.params.id);
    db.retrieveImageInfo(req.params.id)
        .then(({ rows }) => {
            // console.log("rows: ", rows);
            res.json(rows);
        })
        .catch(err => {
            console.log("error in database request: ", err);
        });
});

app.get("/user-comments/:id", (req, res) => {
    db.getComments(req.params.id)
        .then(({ rows }) => {
            res.json(rows);
            // console.log("rows in comments: ", rows);
        })
        .catch(err => {
            console.log("error in comments query: ", err);
        });
});

app.post("/user-comments", (req, res) => {
    // console.log("req.body in comments: ", req.body);
    var { username, comment, id } = req.body;
    db.addComment(username, comment, id)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch(err => {
            console.log("error in addComment: ", err);
        });
});

app.get("/more/:smallestOnscreenID", (req, res) => {
    console.log("Hi I am the GET route for /more");
    let smallestOnscreenID = req.params.smallestOnscreenID;
    console.log("smallestOnscreenID: ", smallestOnscreenID);
    db.getMoreImageData(smallestOnscreenID)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch(err => {
            console.log("error in /more image data request: ", err);
        });
});

app.listen(8080, () => {
    console.log(chalk.red.bgBlue("imageboard up and listening!"));
});
