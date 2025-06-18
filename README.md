🎬 videoTube  (YouTube backend Clone)
VideoTube is a comprehensive backend application that emulates the core functionalities of YouTube. Built with modern technologies, it offers features like user authentication, video management, tweet integration, subscriptions, playlists, and more.

🚀 Features
1. User Authentication
   
Secure registration and login
Access and refresh token implementation
Update user details and passwords

2.Video Management

Full CRUD operations for videos
Like and view tracking
Comment system with full CRUD
Dashboard with channel statistics (total videos, likes, views)

3.Tweet Integration

Full CRUD operations for tweets
Like functionality for tweets

4.Subscription System

Subscribe/unsubscribe to channels
Retrieve subscriber lists

5.Playlist Management

Create, update, delete playlists
Add or remove videos from playlists

6.Likes System

Like functionality for videos, tweets, and comments
Retrieve liked videos

🛠️ Tech Stack
Languages & Frameworks: JavaScript, Node.js, Express.js
Database: MongoDB with Mongoose ODM
File Handling: Multer for file uploads
Media Storage: Cloudinary integration
Data Handling: Mongoose Aggregation and Pagination

📚 API Endpoints

User Endpoints (Controller: user.controllers.js)
POST /api/v1/users/register: Register a new user.
POST /api/v1/users/login: Login a user.
POST /api/v1/users/logout: Logout the current user.
POST /api/v1/users/refreshToken: Refresh access token.
POST /api/v1/users/changeCurrentPassword: Change the current user's password.
GET /api/v1/users/getCurrnetUser: Get the current logged-in user's details.
PATCH /api/v1/users/updateAccountDetails: Update user account details.
PATCH /api/v1/users/updateAvatarImage: Update user avatar.
PATCH /api/v1/users/changeCoverImage: Update user cover image.
GET /api/v1/users/channel/:username: Get a user's channel profile.
GET /api/v1/users/getWatchHistory: Get the user's watch history.

Video Endpoints (Controller: video.controllers.js)
GET /api/v1/videos: Get all videos.
POST /api/v1/videos: Publish a new video.
GET /api/v1/videos/:videoId: Get a video by ID.
DELETE /api/v1/videos/:videoId: Delete a video by ID.
PATCH /api/v1/videos/:videoId: Update video details.
PATCH /api/v1/videos/:videoId: Update video thumbnail.
PATCH /api/v1/videos/toggle/publish/:videoId: Toggle video publish status.

Tweet Endpoints (Controller: tweet.controllers.js)
POST /api/v1/tweets/createTweet: Create a new tweet.
GET /api/v1/tweets/user/:userId: Get all tweets by a user.
PATCH /api/v1/tweets/:tweetId: Update a tweet.
DELETE /api/v1/tweets/:tweetId: Delete a tweet.

Subscription Endpoints (Controller: subscription.controllers.js)
POST /api/v1/subscriptions/c/:channelId: Subscribe/unsubscribe to a channel.
GET /api/v1/subscriptions/c/:channelId: Get subscribers of a channel.
GET /api/v1/subscriptions/u/:subscriberId: Get channels subscribed by a user.

Playlist Endpoints (Controller: playlist.controllers.js)
POST /api/v1/playlists: Create a new playlist.
GET /api/v1/playlists/:playlistId: Get a playlist by ID.
PATCH /api/v1/playlists/:playlistId: Update a playlist.
DELETE /api/v1/playlists/:playlistId: Delete a playlist.
PATCH /api/v1/playlists/add/:videoId/:playlistId: Add a video to a playlist.
PATCH /api/v1/playlists/remove/:videoId/:playlistId: Remove a video from a playlist.
GET /api/v1/playlists/user/:userId: Get all playlists of a user.

Like Endpoints (Controller: like.controllers.js)
POST /api/v1/likes/toggle/v/:videoId: Like/unlike a video.
POST /api/v1/likes/toggle/c/:commentId: Like/unlike a comment.
POST /api/v1/likes/toggle/t/:tweetId: Like/unlike a tweet.
GET /api/v1/likes/videos: Get all liked videos.

Comment Endpoints (Controller: comment.controllers.js)
GET /api/v1/comments/:videoId: Get all comments for a video.
POST /api/v1/comments/:videoId: Add a comment to a video.
PATCH /api/v1/comments/c/:commentId: Update a comment.
DELETE /api/v1/comments/c/:commentId: Delete a comment.

Dashboard Endpoints (Controller: dashboard.controllers.js)
GET /api/v1/dashboard/stats: Get channel statistics.
GET /api/v1/dashboard/videos: Get all videos uploaded by the channel.
