import express from "express";
import session from "express-session";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5501",
      "http://127.0.0.1:5501",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(
  session({
    secret: "pizza_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // local geliştirme için
      sameSite: "lax", // local geliştirme için en uyumlu ayar
    },
  })
);

let db;

(async () => {
  db = await open({
    filename: "./users.db",
    driver: sqlite3.Database,
  });
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    fullname TEXT
  )`);
  // Yeni sipariş tablosu
  await db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    pizza_name TEXT,
    toppings TEXT,
    quantity INTEGER,
    order_date TEXT,
    size TEXT
  )`);
})();

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { username, password, fullname } = req.body;
  if (!username || !password || !fullname)
    return res.status(400).json({ error: "Eksik alanlar" });
  try {
    // Şifre düz metin olarak kaydediliyor
    await db.run(
      "INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)",
      [username, password, fullname]
    );
    req.session.user = { username, fullname };
    res.json({ success: true, username, fullname });
  } catch (e) {
    res.status(400).json({ error: "Kullanıcı adı zaten var" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get("SELECT * FROM users WHERE username = ? AND password = ?", [
    username,
    password
  ]);
  if (user) {
    req.session.user = { username: user.username, fullname: user.fullname };
    res.json({
      success: true,
      username: user.username,
      fullname: user.fullname,
    });
  } else {
    res.status(401).json({ error: "Geçersiz bilgiler" });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// User info endpoint (daha estetik ve genişletilebilir)
app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      username: req.session.user.username,
      fullname: req.session.user.fullname,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.session.user.fullname || req.session.user.username)}&background=0D8ABC&color=fff&size=128`,
      welcomeMessage: `Hoşgeldin, ${req.session.user.fullname || req.session.user.username}!`,
      // İleride: rol, kayıt tarihi, vs. eklenebilir
    });
  } else {
    res.json({
      loggedIn: false,
      message: "Oturum bulunamadı. Lütfen giriş yapın.",
      avatar: "https://ui-avatars.com/api/?name=Guest&background=cccccc&color=fff&size=128"
    });
  }
});

// Sipariş kaydetme endpoint'i
app.post("/api/order", async (req, res) => {
  const { username, pizza_name, toppings, quantity, size } = req.body;
  if (!username || !pizza_name || !quantity) {
    return res.status(400).json({ error: "Eksik sipariş bilgisi" });
  }
  try {
    await db.run(
      "INSERT INTO orders (username, pizza_name, toppings, quantity, order_date, size) VALUES (?, ?, ?, ?, datetime('now', 'localtime'), ?)",
      [username, pizza_name, toppings, quantity, size]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Sipariş kaydedilemedi" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
