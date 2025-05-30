const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const { errorResponse } = require("./controller/responseController");
const logger = require("./config/logger");

// Routers
const userRouter = require("./router/userRouter");
const chatRouter = require("./router/chatRouter");
const friendShipsRouter = require("./router/friendShipRouter");
const phoneRouter = require("./router/phoneRouter");
const authRouter = require("./router/authRouter");
const genderRouter = require("./router/genderRouter");
const birthDateRouter = require("./router/birthDateRouter");
const messageRouter = require("./router/messageRouter");

const app = express();
const server = require("http").createServer(app);

// ✅ Attach io to req middleware (Socket.IO integration)
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
        imgSrc: ["'self'", "data:", "http://localhost:3030"],
        connectSrc: ["'self'", "ws://localhost:3030"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

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

app.use("/api/auth", authRateLimiter);
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
app.use("/api", chatRouter);
app.use("/api/friendships", friendShipsRouter);
app.use("/api", phoneRouter);
app.use("/api", genderRouter);
app.use("/api", birthDateRouter);
app.use("/api/message", messageRouter);

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
  res.status(200).json({ status: "OK", timestamp: new Date() });
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











// const express = require("express");
// const morgan = require("morgan");
// const bodyParser = require("body-parser");
// const createError = require("http-errors");
// const xssClean = require("xss-clean");
// const rateLimit = require("express-rate-limit");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const path = require("path");
// const helmet = require("helmet");
// const { errorResponse } = require("./controller/responseController");
// const logger = require("./config/logger"); // Make sure logger is imported

// // Routers
// const userRouter = require("./router/userRouter");
// const chatRouter = require("./router/chatRouter");
// const friendShipsRouter = require("./router/friendShipRouter");
// const phoneRouter = require("./router/phoneRouter");
// const authRouter = require("./router/authRouter");
// const genderRouter = require("./router/genderRouter");
// const birthDateRouter = require("./router/birthDateRouter");
// const messageRouter = require("./router/messageRouter");



// const app = express();
// const server = require("http").createServer(app);

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
// app.use("/api", chatRouter);
// app.use("/api/friendships", friendShipsRouter);
// app.use("/api", phoneRouter);
// app.use("/api", genderRouter);
// app.use("/api", birthDateRouter);
// app.use("/api/message", messageRouter)

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
//   res.status(200).json({ status: "OK", timestamp: new Date() });
// });

// // =======================
// // Error Handling
// // =======================
// app.use((req, res, next) => {
//   next(createError(404, "Route not found"));
// });

// app.use((err, req, res, next) => {
//   logger.error(`API Error: ${err.message}`, { stack: err.stack }); // <-- Enhanced logging
//   errorResponse(res, {
//     statusCode: err.status || 500,
//     message: err.message || "Internal Server Error",
//   });
// });

// module.exports = { app, server };






















