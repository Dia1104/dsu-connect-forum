drop database dsu_forum;
CREATE DATABASE dsu_forum;
USE dsu_forum;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100),
  skills VARCHAR(200),
  role VARCHAR(20) DEFAULT 'student'
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  content TEXT,
  media VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
show tables;
ALTER TABLE posts ADD votes INT DEFAULT 0;
CREATE TABLE comments(
 id INT AUTO_INCREMENT PRIMARY KEY,
 post_id INT,
 user_id INT,
 text TEXT
);

