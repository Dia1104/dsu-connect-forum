const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "dsu_forum",
  port: process.env.MYSQLPORT || 3306,
  ssl: process.env.MYSQLHOST ? { rejectUnauthorized: false } : false
});

db.connect(err => {
  if (err) {
    console.log("❌ DB connection failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

module.exports = db;
