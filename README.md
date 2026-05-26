# nodejs# Node.js Assignment: User Authentication API with JWT & MySQL

**Level:** Beginner
**Estimated time:** 6–10 hours
**Topics covered:** Express.js, MySQL, password hashing (bcrypt), JWT authentication, middleware, REST API design

---

## 1. Objective

Build a small REST API that lets users **register**, **log in**, and access a **protected profile route** using JSON Web Tokens (JWT). User data is stored in a MySQL database, and passwords are hashed before being saved.

By the end of this assignment you should understand:

- How to set up an Express server with routes
- How to connect Node.js to a MySQL database
- Why we hash passwords (and how `bcrypt` does it)
- What a JWT is, how it is signed, and how to verify it
- How middleware protects private routes

---

## 2. Tools & Packages

Install these in your project:

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `mysql2` | MySQL driver (supports promises) |
| `bcryptjs` | Hash and compare passwords |
| `jsonwebtoken` | Create and verify JWTs |
| `dotenv` | Load environment variables from a `.env` file |
| `nodemon` (dev) | Auto-restart the server on file changes |

```bash
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken dotenv
npm install --save-dev nodemon
```

You will also need **MySQL** installed locally (or use XAMPP / MySQL Workbench / Docker).

---

## 3. Database Setup

Create a database and a `users` table. Save this as `schema.sql` in your project and run it in MySQL. 

```sql
CREATE DATABASE IF NOT EXISTS auth_demo;
USE auth_demo;

CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Note: the `password` column stores the **hashed** password — never the plain text.

---

## 4. Project Structure

Set up your files like this:

```
auth-api/
├── .env
├── .gitignore
├── package.json
├── server.js
├── db.js
├── middleware/
│   └── auth.js
└── routes/
    └── userRoutes.js
```

Your `.env` file (do **not** commit this to Git):

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=auth_demo
JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=1h
```

Your `.gitignore`:

```
node_modules
.env
```

---

## 5. Required API Endpoints

Implement these three routes. All request and response bodies are JSON.

### 5.1 `POST /api/register`

Register a new user.

**Request body:**
```json
{
  "name": "Asha Verma",
  "email": "asha@example.com",
  "password": "secret123"
}
```

**Behavior:**
- Validate that `name`, `email`, and `password` are present.
- Reject if a user with that email already exists (return `409 Conflict`).
- Hash the password using `bcrypt` (salt rounds = 10).
- Insert the new user into the `users` table.
- Respond with `201 Created` and the new user's id, name, and email (**never** return the password).

### 5.2 `POST /api/login`

Log an existing user in.

**Request body:**
```json
{
  "email": "asha@example.com",
  "password": "secret123"
}
```

**Behavior:**
- Look up the user by email.
- If the user doesn't exist or the password doesn't match, return `401 Unauthorized` with a generic message like `"Invalid credentials"` (don't reveal which part was wrong).
- If valid, sign a JWT containing at least `{ id, email }` using your `JWT_SECRET`, expiring in `JWT_EXPIRES_IN`.
- Respond with `200 OK` and the token:
  ```json
  { "token": "eyJhbGciOi..." }
  ```

### 5.3 `GET /api/profile` *(protected)*

Return the logged-in user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Behavior:**
- A middleware called `verifyToken` must run before this route.
- The middleware reads the `Authorization` header, verifies the JWT, and attaches the decoded payload to `req.user`.
- If the token is missing or invalid, return `401 Unauthorized`.
- The route handler then fetches the user by `req.user.id` from MySQL and returns `{ id, name, email, created_at }`.

---

## 6. Hints & Starter Snippets

### 6.1 Connecting to MySQL (`db.js`)

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
```

Then run a query with:
```javascript
const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
```

### 6.2 Hashing & comparing passwords

```javascript
const bcrypt = require('bcryptjs');

// when registering
const hashed = await bcrypt.hash(plainPassword, 10);

// when logging in
const isMatch = await bcrypt.compare(plainPassword, hashedFromDB);
```

### 6.3 Creating & verifying a JWT

```javascript
const jwt = require('jsonwebtoken');

// create
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

// verify (inside middleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded -> { id, email, iat, exp }
```

### 6.4 The auth middleware (`middleware/auth.js`) — skeleton

```javascript
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  // TODO: check that header exists and starts with "Bearer "
  // TODO: extract the token
  // TODO: verify it with jwt.verify(...)
  // TODO: on success, set req.user = decoded and call next()
  // TODO: on failure, return res.status(401).json({ message: '...' })
}

module.exports = verifyToken;
```

---

## 7. Testing Your API

Use **Postman**, **Thunder Client** (VS Code extension), or `curl`. Suggested test flow:

1. `POST /api/register` with a new email → expect `201` and user info (no password field).
2. `POST /api/register` with the **same** email again → expect `409`.
3. `POST /api/login` with correct credentials → expect `200` and a token. Copy it.
4. `POST /api/login` with wrong password → expect `401`.
5. `GET /api/profile` **without** a token → expect `401`.
6. `GET /api/profile` with `Authorization: Bearer <your-token>` → expect `200` and your profile.
7. Tamper with the token (change one character) and retry → expect `401`.

---

## 8. Submission Requirements

Submit a Git repository (or zip) containing:

1. All source files listed in section 4.
2. A `README.md` with:
   - How to install dependencies and run the server
   - How to set up the database (point to `schema.sql`)
   - Example requests for each endpoint
3. A `.env.example` file showing the required variables (with empty values).
4. **Do not commit `node_modules/` or your real `.env`.**

---

## 9. Grading Rubric (100 points)

| Criteria | Points |
|---|---|
| Project structure and clean code | 10 |
| MySQL connection working with `.env` config | 10 |
| `/register` endpoint with validation and duplicate check | 15 |
| Passwords hashed with bcrypt (never stored plain) | 15 |
| `/login` endpoint returns a valid JWT | 15 |
| `verifyToken` middleware works correctly | 15 |
| `/profile` returns the correct user and is protected | 10 |
| README and submission completeness | 10 |

---

## 10. Bonus Challenges (Optional)

If you finish early and want to push further, try any of these:

- Add input validation using `express-validator` or `joi`.
- Add a `PUT /api/profile` route to update the logged-in user's name.
- Add a `roles` column (`user` / `admin`) and a second middleware that only lets admins access a `/api/admin/users` route which lists all users.
- Add **refresh tokens** alongside access tokens.
- Add basic **rate limiting** on `/login` using `express-rate-limit` to mitigate brute-force attempts.
- Write a few automated tests with **Jest** + **supertest**.

---

## 11. Key Concepts to Reflect On

After finishing, make sure you can answer these in your own words:

1. Why do we hash passwords instead of storing them as plain text?
2. What is the difference between hashing (bcrypt) and encryption?
3. What are the three parts of a JWT, and what does the signature actually prove?
4. Where should the JWT be stored on the client side, and what are the trade-offs?
5. What happens if `JWT_SECRET` is leaked? How would you rotate it?
6. Why do we use parameterized queries (`?` placeholders) with MySQL instead of string concatenation?

Good luck — and remember: when something doesn't work, read the error message carefully before searching for it. That's half the skill.
