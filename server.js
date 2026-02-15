const express = require("express");
const session = require("express-session");
const multer = require("multer");
const bodyParser = require("body-parser");
const db = require("./db");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(session({
  secret: "dsu_secret",
  resave: false,
  saveUninitialized: true
}));

// ================= FILE UPLOAD =================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "video/mp4",
      "application/pdf"
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb("Only images/videos/pdf allowed");
  }
});

// ================= DEFAULT PAGE =================
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// ================= LOGIN PAGE =================
app.get("/login.html", (req, res) => {
  if (req.session.user) return res.redirect("/home.html");
  res.sendFile(__dirname + "/public/login.html");
});

// ================= REGISTER PAGE =================
app.get("/register.html", (req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});

// ================= HOME PAGE =================
app.get("/home.html", (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");
  res.sendFile(__dirname + "/public/home.html");
});

// ================= REGISTER =================
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!email.endsWith("@dsu.edu.in"))
    return res.send("Only DSU students allowed");

  db.query(
    "INSERT INTO users(name,email,password) VALUES(?,?,?)",
    [name, email, password],
    (err) => {
      if (err) return res.send("User already exists");
      res.redirect("/login.html");
    }
  );
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, result) => {
      if (result.length > 0) {
        req.session.user = result[0];
        res.redirect("/home.html");
      } else {
        res.send("Invalid login");
      }
    }
  );
});

// ================= LOGOUT =================
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// ================= CREATE POST =================
app.post("/post", upload.single("media"), (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");

  const content = req.body.content;
  const team = req.body.team || null;
  const media = req.file ? req.file.filename : null;

  db.query(
    "INSERT INTO posts(user_id,content,media,team,votes) VALUES(?,?,?,?,0)",
    [req.session.user.id, content, media, team],
    () => {
      res.redirect("/home.html");
    }
  );
});

// ================= GET POSTS =================
app.get("/posts", (req, res) => {
  db.query(
    "SELECT posts.*, users.name FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.id DESC",
    (err, result) => res.json(result)
  );
});

// ================= PROFILE =================
app.get("/myprofile", (req, res) => {
  if (!req.session.user) return res.send("login");

  db.query(
    "SELECT * FROM posts WHERE user_id=? ORDER BY id DESC",
    [req.session.user.id],
    (err, posts) => {
      res.json({
        user: req.session.user,
        posts: posts
      });
    }
  );
});

// ================= UPVOTE =================
app.post("/upvote/:id", (req, res) => {
  db.query(
    "UPDATE posts SET votes=votes+1 WHERE id=?",
    [req.params.id],
    () => res.send("ok")
  );
});

// ================= COMMENT =================
app.post("/comment", (req, res) => {
  if (!req.session.user) return res.send("login");

  const { post_id, text } = req.body;

  db.query(
    "INSERT INTO comments(post_id,user_id,text) VALUES(?,?,?)",
    [post_id, req.session.user.id, text],
    () => res.send("ok")
  );
});

// ================= GET COMMENTS =================
app.get("/comments/:postid", (req, res) => {
  db.query(
    "SELECT comments.*, users.name FROM comments JOIN users ON comments.user_id = users.id WHERE post_id=? ORDER BY id DESC",
    [req.params.postid],
    (err, result) => res.json(result)
  );
});

// ================= START SERVER =================
app.listen(process.env.PORT || 3000)
