// error Handler
// const errorHandler = require("./errorHandler");
// const badRequestException = require("./errorException").badRequestException;
const express = require("express");
const app = express();
const http = require("http").Server(app);
const PORT = process.env.PORT || 7000;
const db = require("./models/index");
// comments config
const comments_max = 100;
// socket cors
const io = require("socket.io")(http, {
  cors: {
    origin: ["http://localhost:8080", "https://192.168.160.38:8080"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["comment"],
    credentials: true,
  },
});

// http cors
app.use(function (req, res, next) {
  //http://localhost:8080/,
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/login", async (req, res, next) => {
  try {
    const userData = await db.users.findOne({
      where: { email: req.body.email },
    });
    if (userData) {
      res.send(userData);
    } else {
      throw new Error("test");
    }
  } catch (err) {
    res.status(404).json({ msg: "Not Found" });
    next();
    // next(new CustomError("username is required", 400));
  }
});

app.post("/signup", async (req, res) => {
  try {
    const result = await db.users.create(req.body);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

app.get("/comments", async (req, res) => {
  const comments = await db.comments.findAll();
  res.send(comments);
});

io.on("connection", function (socket) {
  socket.on("message", async function (msg) {
    try {
      const comments = await db.comments.findAll();
      if (comments.length > comments_max) {
        // idを昇順で一番上のコメントを削除
        let deleteComment;
        const commentsByAsc = await db.comments.findAll({
          order: [["id", "ASC"]],
        });
        commentsByAsc.forEach((comment, index) => {
          if (index === 0) deleteComment = comment;
        });
        await deleteComment.destroy();
      }
      const result = await db.comments.create(msg);
      io.emit("message", result);
    } catch (err) {
      io.emit("message", { error: err });
    }
  });
});

http.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
