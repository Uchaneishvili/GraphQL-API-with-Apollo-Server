const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const logger = require("./utils/logger");
const db = new sqlite3.Database(
	path.join(__dirname, "database.sqlite"),
	(err) => {
		if (err) {
			logger.error("Error connecting to SQLite database:", err.message);
		} else {
			logger.info("SQLite database created successfully.");
			createUsersTable();
		}
	}
);

function createUsersTable() {
	const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      userName TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      signInCount INTEGER NOT NULL DEFAULT 0,
      successedSignInCount INTEGER NOT NULL DEFAULT 0
    )
  `;

	db.run(createTableQuery, (err) => {
		if (err) {
			logger.error("Error creating Users table:", err.message);
		} else {
			logger.info("Users table created successfully.");
		}
	});
}

module.exports = db;
