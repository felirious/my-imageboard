DROP TABLE IF EXISTS comments;

CREATE TABLE comments (
         id SERIAL PRIMARY KEY,
         username VARCHAR(255) NOT NULL,
         comment VARCHAR(255) NOT NULL,
         image_id INT NOT NULL references images(id),
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );

INSERT INTO comments (username, comment, image_id) VALUES (
    'felix',
    'This is the best picture I have ever seen!',
    '22'
);
INSERT INTO comments (username, comment, image_id) VALUES (
    'felix',
    'Amazing',
    '21'
);
INSERT INTO comments (username, comment, image_id) VALUES (
    'felix',
    'Amazing',
    '20'
);
INSERT INTO comments (username, comment, image_id) VALUES (
    'felix',
    'Amazing',
    '19'
);
INSERT INTO comments (username, comment, image_id) VALUES (
    'felix',
    'Amazing',
    '18'
);
INSERT INTO comments (username, comment, image_id) VALUES (
    'felix',
    'Amazing',
    '17'
);
INSERT INTO comments (username, comment, image_id) VALUES (
    'felix',
    'Amazing',
    '16'
);
INSERT INTO comments (username, comment, image_id) VALUES (
    'felix',
    'Terrible!',
    '15'
);
