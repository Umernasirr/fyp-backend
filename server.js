process.env.UV_THREADPOOL_SIZE = 5;
const express = require("express");
const dotenv = require("dotenv");
const morgan = require(`morgan`);
const colors = require(`colors`);
const fileupload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const cluster = require("cluster");
const bodyParser = require("body-parser");

const connectDb = require(`./config/db`);
const errorHandler = require(`./middleware/error`);
const auth = require("./routes/auth");
const song = require("./routes/song");
const playlist = require("./routes/playlist");
const post = require("./routes/post");
const request = require("./routes/request");
const vibe = require("./routes/vibe");

dotenv.config({ path: "./config/config.env" });

if (cluster.isMaster) {
  cluster.fork();
  // cluster.fork();
  // cluster.fork();
  // cluster.fork();
} else {
  //Connect to db
  connectDb();

  const app = express();

  //Body parser
  app.use(express.json());
  app.use(bodyParser.json());

  // Dev logging middleware
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }
  // File uploading
  app.use(fileupload());

  app.use(cookieParser());

  //Sanitize data
  app.use(mongoSanitize());

  //Set security headers
  app.use(helmet());
  // Prevent XSS attacks
  app.use(xss());

  //Rate limiting
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100,
  });

  app.use(limiter);

  //Prevent http param pollution
  app.use(hpp());

  //Enable CORS
  app.use(cors());

  // Set static folder
  app.use(express.static(path.join(__dirname, "public")));
  console.log("coming before route");
  //Mount routers
  app.use(`/api/v1/auth`, auth);
  app.use(`/api/v1/song`, song);
  app.use("/api/v1/playlist", playlist);
  app.use("/api/v1/post", post);
  app.use("/api/v1/request", request);
  app.use("/api/v1/vibe", vibe);

  console.log("Coming after route");
  app.use(errorHandler);
  console.log("coming after error handler");

  const PORT = process.env.PORT || 4000;

  const server = app.listen(
    PORT,
    console.log(
      `Servdsdser running on in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
        .bold
    )
  );
  console.log("coming adter server");

  //Handle unhandled promise rejection
  process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(() => process.exit(1));
  });
}
