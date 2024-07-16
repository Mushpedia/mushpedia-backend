# Mushpedia Backend
Welcome to the Mushpedia backend repository. This project is a Node.js + Express.js server designed to handle the backend functionalities of the Mushpedia application.

### Features
* RESTful API: Provides endpoints to manage and retrieve mushroom-related data.
* Database Integration: Connects to a MongoDB database for data storage.
* Error Handling: Robust error handling for reliable performance.

### Technologies Used
* Node.js: JavaScript runtime environment.
* Express.js: Web framework for Node.js.
* MongoDB: NoSQL database for data storage.
* dotenv: Environment variable management.

## Getting Started
### Prerequisites
Make sure you have the following installed:

* Node.js (version 14.x or higher)
* MongoDB (local or cloud instance)

#### Installation
1. Clone the repository:
```sh
git clone https://github.com/Mushpedia/mushpedia-backend.git
```

3. Install dependencies:
```sh
npm install
```
5. Set up environment variables:
```env
PORT=3000
DB_URI=your_mongodb_uri
DEBUG=http,app:server,app:error-handler
```

####  Running the Server
1. Start the server:
```sh
npm start
```
