require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(express.static(__dirname + "/.."));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 },
  })
);
app.use("/api/cart", require("./routes/cart"));

connectDB();

app.use("/api", require("./routes/auth"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/search", require("./routes/search"));

app.get("/", (req, res) => {
  res.send("API StyleShop работает 🚀");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
app.use("/api/admin", require("./routes/admin"));
app.use("/api/orders", require("./routes/orders"));