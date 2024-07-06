import "./loadEnvironment.mjs";
import express from "express";
import cors from "cors";
import "express-async-errors";
import router from "./routes/routes.mjs";
import debugModule from "debug";
import compression from "compression";
import helmet from "helmet";
// import rateLimit from "express-rate-limit";
import ErrorHandler from "./errorhandling/errorhandler.js";

const debug = debugModule('app:server');
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(compression({
    level: 6,
    threshold: 100 * 1000,
}));
app.use(helmet());
/*
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20
});
app.use(limiter);
*/

app.set('trust proxy', false);

app.use("/api", router);

app.use(ErrorHandler);

app.listen(PORT, () => {
    debug(`Server is running`);
});

export default app;