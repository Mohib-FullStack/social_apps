const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const cron = require("node-cron");
const { errorResponse } = require("./controller/responseController");
const logger = require("./config/logger");
const realIp = require("./middleware/realIP");

// Services
const BirthdayService = require("./services/birthdayService");
const AnniversaryService = require("./services/anniversaryService");

// Routers
const userRouter = require("./router/userRouter");
const chatRouter = require("./router/chatRouter");
const friendShipsRouter = require("./router/friendShipRouter");
const phoneRouter = require("./router/phoneRouter");
const authRouter = require("./router/authRouter");
const genderRouter = require("./router/genderRouter");
const birthDateRouter = require("./router/birthDateRouter");
const messageRouter = require("./router/messageRouter");
const notificationRouter = require("./router/notificationRouter");

const app = express();
const server = require("http").createServer(app);

// =======================
// Scheduled Jobs Setup
// =======================
const setupScheduledJobs = () => {
  // Birthday reminders at 9 AM daily
  cron.schedule("0 9 * * *", async () => {
    try {
      logger.info("Running daily birthday check...");
      await BirthdayService.checkBirthdays();
      logger.info("Birthday check completed successfully");
    } catch (error) {
      logger.error("Birthday check failed", { error: error.message, stack: error.stack });
    }
  });

  // Anniversary reminders at 10 AM daily
  cron.schedule("0 10 * * *", async () => {
    try {
      logger.info("Running daily anniversary check...");
      await AnniversaryService.checkAnniversaries();
      logger.info("Anniversary check completed successfully");
    } catch (error) {
      logger.error("Anniversary check failed", { error: error.message, stack: error.stack });
    }
  });

  logger.info("Scheduled jobs initialized");
};

// Initialize scheduled jobs
setupScheduledJobs();

// =======================
// Socket.IO Integration
// =======================
let io = null;
app.attachSocketIO = (socketInstance) => {
  io = socketInstance;
  app.use((req, res, next) => {
    req.io = io;
    next();
  });
};

// =======================
// Enhanced Security Middleware
// =======================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "http://localhost:3030", "https://*.example.com"],
        connectSrc: ["'self'", "ws://localhost:3030", "https://api.example.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Real IP middleware
app.use(realIp);

// =======================
// Optimized Rate Limiting
// =======================
const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later."
  }
});

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests. Please wait a minute."
  }
});

// Friend request rate limiter (added)
const { friendRequestLimiter } = require('./middleware/friendRequestLimiter');

// =======================
// CORS Configuration
// =======================
const allowedOrigins = ["http://localhost:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =======================
// Middleware Stack
// =======================
app.use(xssClean());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply rate limiters
app.use("/api/auth", authRateLimiter);
app.use("/api/friendships/requests", friendRequestLimiter); // Added specific limiter for friend requests
app.use(generalRateLimiter);

// =======================
// Static Files
// =======================
app.use(
  "/uploads",
  (req, res, next) => {
    res.set("Access-Control-Allow-Origin", allowedOrigins[0]);
    res.set("Access-Control-Allow-Credentials", "true");
    next();
  },
  express.static(path.join(__dirname, "upload"))
);

// =======================
// Route Handling
// =======================
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/friendships", friendShipsRouter);
app.use("/api/phone", phoneRouter);
app.use("/api/gender", genderRouter);
app.use("/api/birthdate", birthDateRouter);
app.use("/api/message", messageRouter);
app.use("/api/notifications", notificationRouter);

// =======================
// Basic Routes
// =======================
app.get("/", (req, res) => {
  res.send(`
    <h1>Welcome to my API!!</h1>
    <p>This API is built using Express.js.</p>
  `);
});

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date(),
    services: {
      birthdayJob: "active",
      anniversaryJob: "active"
    }
  });
});

// =======================
// Error Handling
// =======================
app.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

app.use((err, req, res, next) => {
  logger.error(`API Error: ${err.message}`, { stack: err.stack });
  errorResponse(res, {
    statusCode: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

module.exports = { app, server };




//! original
// const express = require("express");
// const morgan = require("morgan");
// const createError = require("http-errors");
// const xssClean = require("xss-clean");
// const rateLimit = require("express-rate-limit");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const path = require("path");
// const helmet = require("helmet");
// const cron = require("node-cron");
// const { errorResponse } = require("./controller/responseController");
// const logger = require("./config/logger");
// const realIp = require("./middleware/realIP");

// // Services
// const BirthdayService = require("./services/birthdayService");
// const AnniversaryService = require("./services/anniversaryService");

// // Routers
// const userRouter = require("./router/userRouter");
// const chatRouter = require("./router/chatRouter");
// const friendShipsRouter = require("./router/friendShipRouter");
// const phoneRouter = require("./router/phoneRouter");
// const authRouter = require("./router/authRouter");
// const genderRouter = require("./router/genderRouter");
// const birthDateRouter = require("./router/birthDateRouter");
// const messageRouter = require("./router/messageRouter");
// const notificationRouter = require("./router/notificationRouter");

// const app = express();
// const server = require("http").createServer(app);

// // =======================
// // Scheduled Jobs Setup
// // =======================
// const setupScheduledJobs = () => {
//   // Birthday reminders at 9 AM daily
//   cron.schedule("0 9 * * *", async () => {
//     try {
//       logger.info("Running daily birthday check...");
//       await BirthdayService.checkBirthdays();
//       logger.info("Birthday check completed successfully");
//     } catch (error) {
//       logger.error("Birthday check failed", { error: error.message, stack: error.stack });
//     }
//   });

//   // Anniversary reminders at 10 AM daily
//   cron.schedule("0 10 * * *", async () => {
//     try {
//       logger.info("Running daily anniversary check...");
//       await AnniversaryService.checkAnniversaries();
//       logger.info("Anniversary check completed successfully");
//     } catch (error) {
//       logger.error("Anniversary check failed", { error: error.message, stack: error.stack });
//     }
//   });

//   logger.info("Scheduled jobs initialized");
// };

// // Initialize scheduled jobs
// setupScheduledJobs();

// // =======================
// // Socket.IO Integration
// // =======================
// let io = null;
// app.attachSocketIO = (socketInstance) => {
//   io = socketInstance;
//   app.use((req, res, next) => {
//     req.io = io;
//     next();
//   });
// };

// // =======================
// // Enhanced Security Middleware
// // =======================
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         imgSrc: ["'self'", "data:", "http://localhost:3030"],
//         connectSrc: ["'self'", "ws://localhost:3030"],
//         fontSrc: ["'self'"],
//         objectSrc: ["'none'"],
//         upgradeInsecureRequests: [],
//       },
//     },
//   })
// );

// // Real IP middleware
// app.use(realIp);

// // =======================
// // Optimized Rate Limiting
// // =======================
// const generalRateLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many requests from this IP. Please try again later."
//   }
// });

// const authRateLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many authentication requests. Please wait a minute."
//   }
// });

// // =======================
// // CORS Configuration
// // =======================
// const allowedOrigins = ["http://localhost:5173"];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // =======================
// // Middleware Stack
// // =======================
// app.use(xssClean());
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use("/api/auth", authRateLimiter);
// app.use(generalRateLimiter);

// // =======================
// // Static Files
// // =======================
// app.use(
//   "/uploads",
//   (req, res, next) => {
//     res.set("Access-Control-Allow-Origin", allowedOrigins[0]);
//     res.set("Access-Control-Allow-Credentials", "true");
//     next();
//   },
//   express.static(path.join(__dirname, "upload"))
// );

// // =======================
// // Route Handling
// // =======================
// app.use("/api/auth", authRouter);
// app.use("/api/users", userRouter);
// app.use("/api/chat", chatRouter);
// app.use("/api/friendships", friendShipsRouter);
// app.use("/api/phone", phoneRouter);
// app.use("/api/gender", genderRouter);
// app.use("/api/birthdate", birthDateRouter);
// app.use("/api/message", messageRouter);
// app.use("/api/notifications", notificationRouter);

// // =======================
// // Basic Routes
// // =======================
// app.get("/", (req, res) => {
//   res.send(`
//     <h1>Welcome to my API!!</h1>
//     <p>This API is built using Express.js.</p>
//   `);
// });

// app.get("/health", (req, res) => {
//   res.status(200).json({ 
//     status: "OK", 
//     timestamp: new Date(),
//     services: {
//       birthdayJob: "active",
//       anniversaryJob: "active"
//     }
//   });
// });

// // =======================
// // Error Handling
// // =======================
// app.use((req, res, next) => {
//   next(createError(404, "Route not found"));
// });

// app.use((err, req, res, next) => {
//   logger.error(`API Error: ${err.message}`, { stack: err.stack });
//   errorResponse(res, {
//     statusCode: err.status || 500,
//     message: err.message || "Internal Server Error",
//   });
// });

// module.exports = { app, server };






































