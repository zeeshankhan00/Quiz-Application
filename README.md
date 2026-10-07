# 🧠 Quiz Application

A full-stack quiz platform built with **Spring Boot, React, and MySQL**. Users sign in with Google, take quizzes across technology topics, and review their answers. Approved admins manage the question bank from a dedicated dashboard.

## ✨ Features

### Quiz experience

- **Google sign-in** with JWT authentication for API requests.
- **Topic-based quizzes** covering Core Java, Advance Java, Spring Boot, Spring Security, Spring JDBC, SQL, AWS, and Docker.
- **Easy, Medium, and Hard** question labels.
- **Per-question countdown**, automatic progression when time expires, and a confirmation flow for giving up.
- **Backend scoring** and a detailed review of submitted answers and correct answers.
- **Light and dark themes**, with the selected theme remembered across visits.

### Admin question management

- **Sign in as Admin** from the login page using an approved Google account.
- **Backend email allowlist** assigns `ADMIN` or `USER`; selecting the admin login button does not grant permissions.
- **Dedicated dashboard** to filter questions by topic, create questions, and use edit/delete controls.
- **Question validation** checks required text, supported categories and difficulties, four distinct options, and an answer that matches an option exactly.
- **Bulk question import** accepts a JSON array through the existing `addmultiplequestions` API.
- **Protected question-bank APIs** restrict both `/admin/**` and `/question/**` to admins.
- **Session handling** distinguishes an expired or invalid token (`401`) from insufficient permissions (`403`).

> Edit/delete controls require the corresponding backend `PUT` and `DELETE` endpoints and `VITE_ADMIN_MUTATIONS_ENABLED=true`. The initial admin integration supplies listing and creation; update/delete service implementations are added separately.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, JavaScript, CSS |
| Backend | Java 25, Spring Boot 4.1.0, Spring MVC |
| Persistence | Spring Data JPA, Hibernate, MySQL |
| Authentication | Spring Security, Google OAuth2/OIDC, JWT through JJWT |
| Testing | JUnit, Spring Security Test, MockMvc, Node.js test runner, Postman |

The backend versions above match the current `pom.xml`.

## 🏗️ Application Flow

1. The user selects regular or admin sign-in. Google verifies the account's identity and email.
2. The backend checks the admin email allowlist and issues a signed JWT with the user's role.
3. The frontend consumes the OAuth redirect and checks `GET /auth/me` before choosing the appropriate dashboard.
4. Regular users select a topic, answer quiz questions, submit their answers, and review the result.
5. Admins can also open question management and maintain the bank for each topic.
6. Every protected API request carries a bearer token. Spring Security verifies the token and enforces authorization on the backend.

JWT API authentication is stateless. The Google OAuth2 authorization handshake may still use a temporary session.

## 📁 Project Structure

| Path | Purpose |
|---|---|
| `quiz-app/` | React frontend |
| `quiz-app/src/components/` | Quiz screens, admin dashboard, and question form |
| `quiz-app/src/api.js` | Quiz/admin API calls and error handling |
| `quiz-app/src/auth.js` | Login intent, OAuth callback, and session utilities |
| `quiz-app/src/topics.js` | Frontend topics and difficulty labels |
| `quizApp-backend/src/main/java/com/zymshan/quizApp/` | Controllers, services, repositories, entities, and security configuration |
| `quizApp-backend/src/main/resources/application.properties.example` | Backend configuration template |
| [ADMIN_SETUP.md](ADMIN_SETUP.md) | Original admin integration guide and file map |

## ⚙️ Local Setup

### Prerequisites

- **JDK 25** for the configured backend build.
- **Node.js and npm**; Node 20 or later is recommended for the included frontend tests.
- A running **MySQL** instance and an existing application database.
- A **Google OAuth web client** with a client ID and secret.

Clone the repository:

```bash
git clone https://github.com/zeeshankhan00/Quiz-Application.git
cd Quiz-Application
```

### Backend

Copy `quizApp-backend/src/main/resources/application.properties.example` to `application.properties` in the same directory. The template reads these environment variables:

| Variable | Purpose |
|---|---|
| `DB_URL` | JDBC URL; defaults to `jdbc:mysql://localhost:3306/quiz_app`. Set this to your existing database if its name differs. |
| `DB_USERNAME` | Database username; defaults to `root` |
| `DB_PASSWORD` | Database password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `JWT_SECRET` | Strong random JWT signing secret of at least 32 bytes |
| `ADMIN_EMAILS` | Comma-separated verified Google email addresses approved as admins |
| `FRONTEND_URL` | Frontend origin; defaults to `http://localhost:3000` |

You can alternatively configure these values directly in your ignored local `application.properties`. Admin access uses:

```properties
app.admin.emails=admin@example.com,another-admin@example.com
app.frontend.url=http://localhost:3000
spring.security.oauth2.client.registration.google.scope=openid,email,profile
```

An empty admin allowlist grants nobody admin access. Email matching ignores casing and surrounding whitespace. Restart the backend after changing the allowlist; newly added admins must sign in again to receive an admin token.

Configure this authorized redirect URI in your Google OAuth client:

```text
http://localhost:8080/login/oauth2/code/google
```

Start the backend from the repository root:

```powershell
cd quizApp-backend
.\mvnw.cmd spring-boot:run
```

On macOS/Linux, use `./mvnw spring-boot:run`. The backend runs at `http://localhost:8080`.

### Frontend

Open another terminal and copy `quiz-app/.env.example` to `quiz-app/.env.local`. Use:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_ADMIN_MUTATIONS_ENABLED=true
```

Use `false` for the mutation flag until both admin update/delete endpoints are installed. Restart Vite after changing these values. Only public frontend configuration belongs in `VITE_` variables; keep database credentials, OAuth client secrets, JWT signing keys, and the admin allowlist on the backend.

From the repository root:

```bash
cd quiz-app
npm ci
npm run dev
```

Open `http://localhost:3000`. Install dependencies locally rather than reusing a copied `node_modules` directory. Run `npm run build` for a production frontend build. Hosting must serve the React entry page for `/oauth2/redirect`.

## 🔌 API Overview

Except for the Google login flow, the routes below require:

```http
Authorization: Bearer <your-jwt>
```

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/oauth2/authorization/google` | Public | Begin Google sign-in |
| GET | `/auth/me` | Signed-in user | Read the backend-confirmed email and role |
| POST | `/quiz/create?title=Java%20Quiz&category=Java` | Signed-in user | Create a quiz for a category |
| GET | `/quiz/get/{id}` | Signed-in user | Fetch quiz questions without correct answers |
| POST | `/quiz/submit/{id}` | Signed-in user | Submit answers and receive results |
| GET | `/admin/questions?category=Java` | Admin | List questions, optionally filtered by category |
| POST | `/admin/questions` | Admin | Create a question |
| PUT | `/admin/questions/{id}` | Admin | Update a question through the separately added endpoint |
| DELETE | `/admin/questions/{id}` | Admin | Delete a question through the separately added endpoint |
| POST | `/question/addmultiplequestions` | Admin | Import a JSON array of questions |

The React API adapter accepts successful update/delete responses as JSON, plain text, or an empty body. A `200 OK` response containing `Successfully Updated the Question` or `Successfully Deleted the Question` is compatible.

### Question JSON

The UI label **Core Java** maps to backend category **`Java`**. Supported categories are `Java`, `Advance Java`, `Spring Boot`, `Spring Security`, `Spring JDBC`, `SQL`, `AWS`, and `Docker`. Supported difficulties are `Easy`, `Medium`, and `Hard`.

For a single question, send the object below. For bulk import, send an array of question objects as raw JSON with `Content-Type: application/json`:

```json
[
  {
    "category": "Java",
    "difficulty": "Easy",
    "question": "Which keyword is used to inherit a class in Java?",
    "option1": "implements",
    "option2": "extends",
    "option3": "inherits",
    "option4": "super",
    "rightAnswer": "extends"
  }
]
```

`rightAnswer` contains the exact correct option text, rather than an option number or letter. Omit `id` when creating questions. The update ID belongs in the URL. Bulk requests should reuse `QuestionValidator` for every item before saving the batch; the original bulk endpoint does not call that validator automatically.

Difficulty labels describe the stored questions. The current category query does not enforce a fixed quiz size or a fixed Easy/Medium/Hard distribution.

### Question Deletion and Existing Quizzes

Quizzes reference questions through the `quiz_questions_list` join table. Hard deletion of a referenced question fails unless its references are removed first. Removing those links also changes existing quizzes and can affect an attempt already in progress.

**Soft deletion is the recommended next improvement:** retain the question and its quiz links, set a backend-managed `deleted` flag, and exclude marked questions from admin listings and new quiz selection. Existing quiz loading and scoring must still include their original questions. This schema and query change must be implemented separately; the initial admin integration does not supply it.

Editing a shared question can also change an existing quiz's options or correct answer. Question versions or snapshots are a further improvement for preserving quiz contents.

## 🧪 Testing

Frontend checks, from `quiz-app`:

```bash
npm test
npm run build
```

The Node tests cover question-form validation, token/callback handling, API contracts, and session errors.

Targeted backend checks, from `quizApp-backend`:

```powershell
.\mvnw.cmd "-Dtest=AdminSecurityTests,AdminLoginTests,QuestionValidatorTests" test
```

On macOS/Linux, use `./mvnw` instead. These tests cover admin authorization, JWT verification, verified-email login, and question validation using mocked repositories. The original application context test requires working application configuration and database access.

## 📌 Roadmap

- [x] Google sign-in and JWT API authentication
- [x] Backend roles and admin email allowlist
- [x] Admin dashboard with topic filtering, question creation, and edit/delete API integration
- [x] Bulk question import endpoint
- [x] Frontend session-expiry handling and focused authentication/validation tests
- [ ] Soft deletion that preserves existing quizzes
- [ ] Question versions or snapshots for stable quiz content
- [ ] Per-user quiz attempts, history, and quiz ownership checks
- [ ] Fixed-size question selection with configurable difficulty distribution
- [ ] Stronger submission validation and scoring integrity checks
- [ ] Question pagination and search
- [ ] Token refresh, rate limiting, and broader integration tests
- [ ] Reproducible Docker Compose setup and CI pipeline

## 📄 Project Use

Built for learning and as a portfolio project. Keep real credentials and local configuration files out of version control. No explicit open-source license is included in this repository.
