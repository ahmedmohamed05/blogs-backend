import http from "http";
import app from "./app";
import env from "./config/env";

const server = http.createServer(app);
const { port } = env;

server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
