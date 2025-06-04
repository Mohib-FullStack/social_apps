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
const realIp = require("./middleware/realIP");

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
app.use("/api/chat", chatRouter);
app.use("/api/friendships", friendShipsRouter);
app.use("/api/phone", phoneRouter);
app.use("/api/gender", genderRouter);
app.use("/api/birthdate", birthDateRouter);
app.use("/api/message", messageRouter);
app.use("/api/notifications",notificationRouter )

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



//! update version
// const express = require("express");
// const morgan = require("morgan");
// const createError = require("http-errors");
// const xssClean = require("xss-clean");
// const rateLimit = require("express-rate-limit");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const path = require("path");
// const helmet = require("helmet");
// const compression = require("compression");
// const hpp = require("hpp");
// const mongoSanitize = require("express-mongo-sanitize");
// const { errorResponse } = require("./controller/responseController");
// const logger = require("./config/logger");
// const realIp = require("./middleware/realIP");

// // Import routers
// const routers = [
//   require("./router/authRouter"),
//   require("./router/userRouter"),
//   require("./router/chatRouter"),
//   require("./router/friendShipRouter"),
//   require("./router/phoneRouter"),
//   require("./router/genderRouter"),
//   require("./router/birthDateRouter"),
//   require("./router/messageRouter"),
//   require("./router/notificationRouter")
// ];

// class App {
//   constructor() {
//     this.app = express();
//     this.server = require("http").createServer(this.app);
//     this.io = null;

//     this.initializeMiddlewares();
//     this.initializeSecurity();
//     this.initializeRoutes();
//     this.initializeErrorHandling();
//   }

//   initializeMiddlewares() {
//     // Trust proxy for rate limiting and real IP
//     this.app.set("trust proxy", 1);

//     // Request logging
//     this.app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined", {
//       stream: { write: (message) => logger.info(message.trim()) }
//     }));

//     // Body parsers
//     this.app.use(express.json({ limit: "10kb" }));
//     this.app.use(express.urlencoded({ extended: true, limit: "10kb" }));
//     this.app.use(cookieParser());

//     // Compression
//     this.app.use(compression());
//   }

//   initializeSecurity() {
//     // Security headers
//     this.app.use(helmet({
//       contentSecurityPolicy: {
//         directives: {
//           defaultSrc: ["'self'"],
//           scriptSrc: ["'self'", "'unsafe-inline'", "cdn.example.com"],
//           styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
//           imgSrc: ["'self'", "data:", "blob:"],
//           connectSrc: ["'self'", "ws://localhost:3030"],
//           fontSrc: ["'self'", "fonts.gstatic.com"],
//           objectSrc: ["'none'"],
//           upgradeInsecureRequests: []
//         }
//       },
//       crossOriginResourcePolicy: { policy: "cross-origin" },
//       hsts: { maxAge: 63072000, includeSubDomains: true, preload: true }
//     }));

//     // Rate limiting
//     const apiLimiter = rateLimit({
//       windowMs: 15 * 60 * 1000, // 15 minutes
//       max: 1000,
//       message: "Too many requests from this IP, please try again later"
//     });

//     const authLimiter = rateLimit({
//       windowMs: 60 * 60 * 1000, // 1 hour
//       max: 20,
//       message: "Too many login attempts, please try again later"
//     });

//     this.app.use("/api/", apiLimiter);
//     this.app.use("/api/auth", authLimiter);

//     // Security middlewares
//     this.app.use(xssClean());
//     this.app.use(hpp());
//     this.app.use(mongoSanitize());
//     this.app.use(realIp);

//     // CORS configuration
//     const allowedOrigins = process.env.ALLOWED_ORIGINS
//       ? process.env.ALLOWED_ORIGINS.split(",")
//       : ["http://localhost:5173"];

//     this.app.use(cors({
//       origin: allowedOrigins,
//       credentials: true,
//       methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//       allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//       exposedHeaders: ["Content-Length", "X-Powered-By", "X-RateLimit-Limit", "X-RateLimit-Remaining"]
//     }));
//   }

//   initializeRoutes() {
//     // Health check endpoint
//     this.app.get("/health", (req, res) => {
//       res.status(200).json({
//         status: "OK",
//         timestamp: new Date(),
//         uptime: process.uptime(),
//         memoryUsage: process.memoryUsage()
//       });
//     });

//     // API routes
//     routers.forEach(router => {
//       this.app.use(`/api/${router.basePath || ''}`, router);
//     });

//     // Static files
//     this.app.use("/uploads", express.static(path.join(__dirname, "upload"), (req, res) => {
//       res.set("Cache-Control", "public, max-age=31536000");
//     });

//     // 404 handler
//     this.app.use((req, res, next) => {
//       next(createError(404, `Route ${req.method} ${req.path} not found`));
//     });
//   }

//   initializeErrorHandling() {
//     // Error logger
//     this.app.use((err, req, res, next) => {
//       logger.error(`API Error: ${err.message}`, {
//         stack: err.stack,
//         path: req.path,
//         method: req.method,
//         ip: req.ip
//       });
//       next(err);
//     });

//     // Error responder
//     this.app.use((err, req, res, next) => {
//       errorResponse(res, {
//         statusCode: err.status || 500,
//         message: err.message || "Internal Server Error",
//         errors: err.errors
//       });
//     });
//   }

//   attachSocketIO(io) {
//     this.io = io;
//     this.app.use((req, res, next) => {
//       req.io = io;
//       next();
//     });
//   }
// }

// module.exports = new App();






























