const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres://postgres:postgres@localhost:5432/imageboard"
);

exports.getImageData = function() {
    return db.query(`SELECT * FROM images ORDER BY id DESC LIMIT 10`);
};

exports.getMoreImageData = function(startID) {
    return db.query(
        `SELECT *, (
    SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1) AS "lowestID" FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 10`,
        [startID]
    );
};

exports.insertImageIntoDB = function(url, username, title, description) {
    return db.query(
        `INSERT into images (url, username, title, description) VALUES ($1, $2, $3, $4) returning *`,
        [url, username, title, description]
    );
};

exports.retrieveImageInfo = function(id) {
    return db.query(`SELECT * FROM images WHERE id = ($1)`, [id]);
};

exports.getComments = function(id) {
    return db.query(`SELECT * FROM comments WHERE image_id = ($1)`, [id]);
};

exports.addComment = function(username, comment, id) {
    return db.query(
        `INSERT into comments (username, comment, image_id) VALUES ($1, $2, $3) returning *`,
        [username, comment, id]
    );
};
