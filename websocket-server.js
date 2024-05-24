const WebSocket = require("ws");
const db = require("./database");

// Create a new WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Handle WebSocket connections
wss.on("connection", (ws) => {
	console.log("Client connected");

	// Handle incoming messages
	ws.on("message", (message) => {
		console.log("Received message:", message);
	});

	// Handle WebSocket close
	ws.on("close", () => {
		console.log("Client disconnected");
	});

	// Send a message to the client every 5 seconds
	const intervalId = setInterval(() => {
		const query = "SELECT * FROM Users ORDER BY createdAt DESC ";

		db.all(query, (err, rows) => {
			query;
			if (err) {
				console.error("Error fetching users:", err);
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

			// Send the data to all connected WebSocket clients
			wss.clients.forEach((ws) => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify(data));
				}
			});
		});
	}, 5000);

	// Clean up the interval when the WebSocket connection is closed
	ws.on("close", () => {
		clearInterval(intervalId);
	});
});

console.log("WebSocket server is running on port 8080");
