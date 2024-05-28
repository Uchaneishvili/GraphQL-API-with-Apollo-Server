# GraphQL-API-with-Apollo-Server

GraphQL-API-with-Apollo-Server is a project that combines an Apollo GraphQL server with a WebSocket server. It provides a backend infrastructure for building real-time applications.

## Features

- **GraphQL API**: The project includes an Apollo GraphQL server, allowing you to create and interact with a GraphQL API.
- **WebSocket Server**: A WebSocket server is implemented using the `ws` package, enabling real-time communication between clients and the server.
- **Authentication**: JSON Web Tokens (JWT) are used for authentication, ensuring secure communication between clients and the server.
- **Database Integration**: PulsarAI utilizes SQLite3 as the database solution, providing a lightweight and efficient way to store and retrieve data.

## Prerequisites

Before running the project, ensure that you have the following installed:

- Node.js (version >= 14.x)
- npm (Node Package Manager)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/Uchaneishvili/GraphQL-API-with-Apollo-Server.git
```

2. Navigate to the project directory:

```bash
cd GraphQL-API-with-Apollo-Server
```

3. Install the dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

This command will concurrently start the GraphQL server (`nodemon index.js`) and the WebSocket server (`node websocket-server.js`).

## Usage

The GraphQL API can be accessed at `http://localhost:5000/graphql`. You can use tools like GraphQL Playground or Postman to interact with the API.

The WebSocket server listens for connections on `ws://localhost:8080`. You can use a WebSocket client or library to establish a connection and send/receive real-time data.

## Configuration

You can configure various settings for the project, such as the server ports, database connection details, and JWT secret key, by modifying the appropriate configuration files or environment variables.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [WebSocket](https://github.com/websockets/ws)
- [JSON Web Tokens](https://jwt.io/)
- [SQLite3](https://github.com/mapbox/node-sqlite3)
