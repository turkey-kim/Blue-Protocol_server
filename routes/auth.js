import express from "express";
import { client } from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const { id, pw } = req.body;
  const db = client.db("BP");
  const result = await db.collection("login").findOne({ id: id });
  if (result && pw === result.pw) {
    const token = jwt.sign({ id: id }, process.env.JWT_KEY, {
      expiresIn: "5h",
    });
    console.log(token);
    res.json(token);
  } else {
    res.json(false);
  }
});

authRouter.post("/checkToken", (req, res) => {
  const token = req.body.token;
  try {
    const verified = jwt.verify(token, process.env.JWT_KEY);
    verified ? res.json(true) : null;
  } catch (err) {
    console.error(err);
    res.json(false);
  }
});

export default authRouter;
