# Job Application Form

A lightweight full-stack project for collecting and screening job applications.

- **Frontend:** Plain HTML/CSS/JS form (name, email, age, experience level, message)
- **Backend:** Express.js API that validates submissions, scores applicants based on
  experience level, and returns an eligibility status (`Eligible` / `Needs Review`)
- **Storage:** In-memory (resets on server restart)

## Live Link
https://application-form-ra86.onrender.com/

## Project structure

```
application-form/
|-- public/
│   |-- index.html      # Form UI
│   |-- style.css       # Styling
│   |-- script.js       # Submits the form via fetch() and renders the result
|-- server.js            # Express server + API routes
|-- package.json
|-- .gitignore
```

## Getting started

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## API

### `GET /api`

Health check.

**Response**

```json
{ "success": true, "message": "Backend API is working" }
```

### `POST /api/applications`

Submits a new application.

**Request body**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 25,
  "experience": "Intermediate",
  "message": "I'd love to join this team because..."
}
```

`experience` must be one of: `Beginner`, `Intermediate`, `Advanced` (case-insensitive).

**Success response** — `201 Created`

```json
{
  "success": true,
  "message": "Application processed successfully.",
  "application": {
    "id": "APP-12345",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "age": 25,
    "experience": "intermediate",
    "message": "I'd love to join this team because...",
    "status": "Eligible",
    "score": 80,
    "submittedAt": "2026-08-21T12:00:00.000Z"
  }
}
```

**Error response** — `400 Bad Request`

```json
{ "success": false, "message": "All fields are required." }
```

### `GET /api/applications`

Lists all applications submitted so far (in-memory).

**Response**

```json
{
  "success": true,
  "count": 1,
  "applications": [
    /* application objects */
  ]
}
```

## Scoring logic

| Experience level | Score | Status       |
| ---------------- | ----- | ------------ |
| Beginner         | 60    | Needs Review |
| Intermediate     | 80    | Eligible     |
| Advanced         | 95    | Eligible     |

A score of 70 or higher is marked `Eligible`; anything lower is `Needs Review`.

## Notes

- Data is stored in memory and will be lost on server restart —
- Before deploying, make sure `server.js` binds to `process.env.PORT` (already done)
  so hosts like Render or Railway can assign their own port.

## License

ISC
