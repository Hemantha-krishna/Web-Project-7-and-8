/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!

// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try {
      const info = await SchemaInfo.find({});
      if (info.length === 0) {
        // No SchemaInfo found - return 500 error
        return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch (err) {
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }
  } else if (param === "counts") {
    // If the request parameter is "counts", we need to return the counts of all collections.
    // To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
    // We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.

    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];

    try {
      await Promise.all(
        collections.map(async (col) => {
          col.count = await col.collection.countDocuments({});
          return col;
        })
      );

      const obj = {};
      for (let i = 0; i < collections.length; i++) {
        obj[collections[i].name] = collections[i].count;
      }
      return response.end(JSON.stringify(obj));
    } catch (err) {
      return response.status(500).send(JSON.stringify(err));
    }
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    return res.status(200).json(users); // Explicitly return the response
  } catch (error) {
    console.error("Error fetching user list:", error);
    return res.status(500).send({ message: "Error fetching user list" });
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "_id first_name last_name location description occupation"
    );
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    return res.status(200).json(user); // Explicitly return the response
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(400).send({ message: "Invalid user ID" });
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */

app.get("/photosOfUser/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: "Invalid user ID format" });
    }

    const photos = await Photo.find({ user_id: userId })
      .select("_id user_id file_name date_time comments")
      .populate({
        path: "comments.user_id",
        model: "User",
        select: "_id first_name last_name",
      });

    if (!photos.length) {
      return res.status(400).send({ message: "No photos found for this user" });
    }

    const formattedPhotos = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: photo.comments.map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: {
          _id: comment.user_id?._id,
          first_name: comment.user_id?.first_name,
          last_name: comment.user_id?.last_name,
        },
      })),
    }));

    return res.status(200).json(formattedPhotos);
  } catch (error) {
    console.error("Error fetching photos for user:", error);
    return res.status(500).send({ message: "Server error fetching photos" });
  }
});


// Endpoint to get photo and comment counts for each user
/*app.get('/user/:userId/stats', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Count photos by user
    const photoCount = await Photo.countDocuments({ user_id: userId });

    // Find comments by user
    const comments = await Photo.aggregate([
      { $unwind: '$comments' },
      { $match: { 'comments.user_id': userId } },
      {
        $project: {
          _id: 1,
          file_name: 1,
          'comments.comment': 1,
          'comments.date_time': 1,
        },
      },
    ]);

    const commentCount = comments.length;

    res.status(200).json({
      photoCount,
      commentCount,
      comments,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).send("Error fetching stats");
  }
});
*/

// Endpoint to get photo and comment counts for each user
app.get('/user/:userId/stats', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Convert userId string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Count photos by user
    const photoCount = await Photo.countDocuments({ user_id: userObjectId });

    // Count comments by user using aggregation pipeline
    const commentStats = await Photo.aggregate([
      // Unwind the comments array to create a document for each comment
      { $unwind: "$comments" },
      // Match comments made by the specified user
      {
        $match: {
          "comments.user_id": userObjectId
        }
      },
      // Group to get the count and details
      {
        $group: {
          _id: null,
          commentCount: { $sum: 1 },
          comments: {
            $push: {
              photoId: "$_id",
              fileName: "$file_name",
              comment: "$comments.comment",
              dateTime: "$comments.date_time"
            }
          }
        }
      },
      // Project the final format
      {
        $project: {
          _id: 0,
          commentCount: 1,
          recentComments: { $slice: ["$comments", 5] } // Get only the 5 most recent comments
        }
      }
    ]);

    // Format the response
    const stats = {
      userId: userId,
      photoCount: photoCount,
      commentCount: commentStats[0]?.commentCount || 0,
      recentComments: commentStats[0]?.recentComments || []
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error("Error fetching user stats:", error);
    return res.status(500).json({ 
      message: "Error fetching user stats",
      error: error.message 
    });
  }
});

// Add these helper endpoints for more detailed information if needed
app.get('/user/:userId/photos', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const photos = await Photo.find(
      { user_id: userId },
      'file_name date_time'
    ).sort({ date_time: -1 });

    return res.status(200).json(photos);

  } catch (error) {
    console.error("Error fetching user photos:", error);
    return res.status(500).json({ 
      message: "Error fetching user photos",
      error: error.message 
    });
  }
});

app.get('/user/:userId/comments', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const photos = await Photo.aggregate([
      { $unwind: "$comments" },
      { 
        $match: { 
          "comments.user_id": new mongoose.Types.ObjectId(userId) 
        }
      },
      {
        $project: {
          file_name: 1,
          comment: "$comments.comment",
          date_time: "$comments.date_time"
        }
      },
      
    ]);

    return res.status(200).json(photos);

  } catch (error) {
    console.error("Error fetching user comments:", error);
    return res.status(500).json({ 
      message: "Error fetching user comments",
      error: error.message 
    });
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
