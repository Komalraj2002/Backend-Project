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
app.use(express.static("public")); //public is a foler where we can store , serve static file from public folder
app.use(cookieParser()); //	Parses cookies and puts them on req.cookies

//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/comment", dashboardRouter);

export { app };
