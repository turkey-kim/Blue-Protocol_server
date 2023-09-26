const express = require("express");
const { client, connectToMongoDB } = require("./db.js");
require("dotenv").config();
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://blue-protocol-db-test.netlify.app",
    ],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // body를 파싱해주기 위해 필요한 미들웨어

async function startServer() {
  try {
    await connectToMongoDB();
    app.listen(process.env.PORT, () => {
      console.log("server is running on port: " + process.env.PORT);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();

app.get("/", async (req, res) => {
  try {
    const db = client.db("BP");
    const result = await db.collection("login").findOne({ id: "admin" });
    console.log(result);
  } catch (err) {
    console.log(err);
  }
});

app.post("/", async (req, res) => {
  console.log(req.body.name);
  res.send("전송완료");
});

app.post("/admin/login", async (req, res) => {
  const { id, pw } = req.body;
  const db = client.db("BP");
  const result = await db.collection("login").findOne({ id: id });
  if (result && pw === result.pw) {
    // 비번 검증
    const token = jwt.sign({ id: id }, process.env.JWT_KEY, {
      expiresIn: "1m",
    });
    console.log(token);
    res.json(token);
    //토큰생성
    //토큰전달
  } else {
    res.json(false);
  }
});

app.post("/api/checkToken", async (req, res) => {
  const token = req.body.token;
  try {
    const verified = jwt.verify(token, process.env.JWT_KEY);
    verified ? res.json(true) : null;
  } catch (err) {
    console.error(err);
    res.json(false);
  }
});
