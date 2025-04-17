import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // CONNECT TO WHICH FROENTEND CORS_ORIGIN initialize in env file
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" })); //Parses JSON in request bodies from froentend AND the limit accepted depend on server power(bodyparser )
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // parse the url in request body
app.use(express.static("public"));  //public is a foler where we can store
app.use(cookieParser()) //	Parses cookies and puts them on req.cookies

export { app };