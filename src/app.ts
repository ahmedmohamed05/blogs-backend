import express from "express";
import errorHandler from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";
import router from "./routes";
import helmet from "helmet";
import morgan from "morgan";
const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(router);

app.use(errorHandler);

app.get("/check", (req, res) => {
	res.sendStatus(200);
});

export default app;
