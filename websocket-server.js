const WebSocket = require("ws");
const db = require("./database");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
	logger.info("Client connected");

	ws.on("message", (message) => {
		logger.info("Received message:", message);
	});

	ws.on("close", () => {
		logger.info("Client disconnected");
	});

	// Send a message to the client every 5 seconds
	const intervalId = setInterval(() => {
		const query = "SELECT * FROM Users ORDER BY createdAt DESC ";

		db.all(query, (err, rows) => {
			query;
			if (err) {
				logger.error("Error fetching users:", err);
				return;
			}

			const users = rows.map((row) => ({
				id: row.id,
				firstName: row.firstName,
				successedSignInCount: row.successedSignInCount,
			}));

			const data = {
				message: "Hello from the server!",
				timestamp: new Date(),
				users,
			};

			wss.clients.forEach((ws) => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify(data));
				}
			});
		});
	}, 5000);

	ws.on("close", () => {
		clearInterval(intervalId);
	});
});

logger.info("WebSocket server is running on port 8080");
