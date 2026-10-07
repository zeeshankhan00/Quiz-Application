# Admin feature integration — Quiz Application

Prepared against repository commit `1971a33` (`1971a335caedc8f8d1ebad074b69fc4aca1f2c1c`).

This bundle contains complete replacement files for changed files, complete new files, and an optional Git patch. Your update and delete endpoint implementations are intentionally left to you. The frontend already calls their contract, but their controls are disabled until you enable the flag below.

## 1. Apply the files

Create a branch or back up your current work. Merge the `quiz-app` and `quizApp-backend` folders into the matching folders in your repository, replacing the matching files. Copy only feature source/configuration/test files; this bundle does not include dependencies, build output, real credentials, or a full repository.

Alternatively, from an unchanged checkout at the base commit:

```bash
git apply --check /path/to/ADMIN_FEATURE.patch
git apply /path/to/ADMIN_FEATURE.patch
```

If you have already changed the same files, compare/merge them manually rather than overwriting your changes. In particular, keep any update/delete work you have added.

## 2. Configure backend admin access

Keep your existing database, Google client and JWT configuration in the ignored `quizApp-backend/src/main/resources/application.properties`. Add:

```properties
app.admin.emails=your-verified-google-email@gmail.com
app.frontend.url=http://localhost:3000
spring.security.oauth2.client.registration.google.scope=openid,email,profile
```

For multiple admins, use comma-separated Google emails. These are backend values, never `VITE_` values. Blank `app.admin.emails` grants nobody admin access. Matching trims whitespace and ignores email casing. Only verified Google accounts can receive a token.

For environment-based configuration, copy `application.properties.example` to `application.properties` and supply `DB_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, and `ADMIN_EMAILS`. Optional values include `DB_URL`, `DB_USERNAME`, and `FRONTEND_URL`. Use a strong random JWT signing secret of at least 32 bytes. Never commit real secrets.

`app.frontend.url` must be the frontend origin, without a path (for example `http://localhost:3000`). Google must allow the backend callback URI `http://localhost:8080/login/oauth2/code/google` for local development.

Restart the backend after editing its allowlist. Existing admin JWTs are checked against the current allowlist on each request, so removing an email takes effect after the new configuration is loaded. Newly added admins must sign in again to receive an admin-role JWT.

This change adds a JWT issuer and role claim. Sign out and sign back in after installing it; tokens issued by the previous version are rejected.

## 3. Configure and run React

Copy `quiz-app/.env.example` to `quiz-app/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_ADMIN_MUTATIONS_ENABLED=false
```

Keep the flag false until your update/delete APIs exist. Creation and listing work immediately; editing/deletion controls remain visibly disabled. After implementing both endpoints, set the flag to `true` and restart Vite (or rebuild for deployment).

From the frontend folder, install fresh dependencies for your OS rather than reusing the repository's committed Windows `node_modules`:

```bash
npm ci
npm run dev
```

Node 20+ is recommended for the included Node test runner. Vite uses port 3000 in this project. Production hosting must serve `index.html` for `/oauth2/redirect` so the callback can load React.

## 4. Login and role flow

Both login buttons use the same Google OAuth endpoint. The browser remembers which dashboard the user requested in `sessionStorage`; that preference does not assign a role.

1. Google establishes the user's identity and verified email.
2. `OAuth2LoginSuccessHandler` determines `ADMIN` or `USER` from `AdminAccessPolicy`.
3. `JwtUtil` signs a JWT containing issuer `quiz-app`, email subject, name, expiry, and role.
4. The backend redirects to `/oauth2/redirect#token=...`. The fragment avoids placing the bearer token in the frontend server's HTTP query string.
5. `main.jsx` calls `consumeOAuthRedirect()` once before React renders, saves the JWT and clears the callback URL. The former `OAuth2Redirect.jsx` component is no longer imported or needed.
6. React verifies the session via `GET /auth/me` before choosing a dashboard. JWT decoding in React supplies display data and expiry only.
7. `JWTAuthFilter` verifies signed claims and constructs `ROLE_ADMIN` or `ROLE_USER`. It also rechecks allowlist membership for admin tokens.
8. `SecurityConfig` enforces admin authorization on `/admin/**` AND legacy `/question/**`. Regular users continue to use `/quiz/**`.

An ordinary user clicking “Sign in as Admin” sees an access-denied screen and can continue to quizzes or use a different account. Admins can switch between quizzes and question management.

API failures distinguish `401` (invalid/expired session; clear token and return to login) from `403` (logged in without permission). A frontend button, local role field, or navigation change never authorizes a backend request.

## 5. API contract for your update and delete endpoints

Add the methods to `AdminQuestionController` (base mapping `/admin/questions`). The class currently supplies GET and POST only. All of these routes inherit backend admin protection:

| Method | Route | Request | Successful response |
|---|---|---|---|
| GET | `/auth/me` | Bearer token | `200 {"email":"...","role":"ADMIN"}` or USER |
| GET | `/admin/questions?category=Java` | Bearer token | `200` JSON array of existing question entities, including `id` and `rightAnswer` |
| POST | `/admin/questions` | Question JSON below | `201` JSON saved question, including generated `id` |
| PUT — yours | `/admin/questions/{id}` | Same question JSON below | `200` saved question or `204` empty response |
| DELETE — yours | `/admin/questions/{id}` | No request body | `204` empty response or another successful 2xx |

Every API request carries `Authorization: Bearer <jwt>`. The ID for update/delete belongs in the path. Creation uses `QuestionRequest`, which has no ID field; a client-supplied ID cannot overwrite a record.

Example create/update payload:

```json
{
  "category": "Java",
  "difficulty": "Easy",
  "question": "Which keyword is used to inherit a class?",
  "option1": "implements",
  "option2": "extends",
  "option3": "inherits",
  "option4": "super",
  "rightAnswer": "extends"
}
```

Use the existing `questions` model, `questionRepo`, and `QuestionValidator.validateAndNormalize()` in your update implementation. Update an existing entity loaded by the path ID rather than accepting a body ID. Return `404` for a missing question, `400` for validation errors, and optionally `409` for questions that cannot be deleted because a quiz references them. `ResponseStatusException` is converted by `ApiExceptionHandler` to `{"message":"..."}` with the corresponding status.

Supported categories: Java, Advance Java, Spring Boot, Spring Security, Spring JDBC, SQL, AWS, Docker. Supported difficulties: Easy, Medium, Hard. Validation trims text, canonicalizes topic/difficulty casing, requires four distinct nonblank options, limits option/answer length to 255 characters, and checks that the correct answer matches one option exactly. The form remembers the correct option by index so changing its text updates the answer too.

### Deleting referenced questions

Existing quizzes reference question entities using `@ManyToMany`. A plain hard delete of a referenced question can violate foreign keys. Until you implement soft deletion, return `409` for referenced questions. If you choose soft deletion, add an active/inactive field and ensure quiz creation excludes inactive questions. This bundle does not add that schema change or implement delete behavior.

## 6. File map

### Backend

- `Config/AdminAccessPolicy.java`: backend email allowlist.
- `Config/AppRole.java`: USER/ADMIN enum.
- `Config/JwtUtil.java`: token creation and signature/issuer/expiry verification.
- `Config/JWTAuthFilter.java`: verified claims to Spring authorities, plus allowlist recheck.
- `Config/OAuth2LoginSuccessHandler.java`: verified Google identity to role and JWT.
- `Config/SecurityConfig.java`: API authorization, configurable CORS, JSON 401/403, single filter registration.
- `Controller/AuthController.java`: trusted current-user endpoint.
- `Controller/AdminQuestionController.java`: topic listing and creation; add your update/delete here.
- `Controller/ApiExceptionHandler.java`: useful validation and malformed-JSON errors.
- `Model/QuestionRequest.java`: create request DTO without an ID.
- `Service/QuestionValidator.java`: reusable question validation.
- `pom.xml`: adds Spring Security test support; existing Boot and Java versions are retained.
- `src/main/resources/application.properties.example`: environment-based example, no real secrets.
- Three new backend test classes: allowlist/login, API authorization/JWT failures, and validation.

### Frontend

- `src/App.jsx`: login buttons, server-confirmed role, admin navigation and session handling.
- `src/auth.js`: base64url/Unicode display decoding, expiry check, callback consumption and login intent.
- `src/api.js`: quiz/admin adapters, bearer headers, and correct 401/403 handling.
- `src/components/AdminDashboard.jsx`: topic-filtered listing, creation, edit/delete UI integration.
- `src/components/QuestionForm.jsx`: controlled question form and correct-option selector.
- `src/questionForm.js`: form validation and request construction.
- `src/topics.js`: shared topic/difficulty lists.
- `src/components/TopicSelect.jsx`: uses the shared topics and removes the unsupported fixed-size promise.
- `src/main.jsx`: consumes callback before React StrictMode mounts.
- `src/App.css`: responsive admin styles using existing light/dark theme variables.
- `.env.example`: API base URL and optional mutation feature flag.
- `test/admin.test.js` and `package.json`: executable Node tests without extra frontend test dependencies.

## 7. Verification

From `quiz-app`:

```bash
npm test
npm run build
```

From `quizApp-backend`, with the project's Java 25 development environment:

```bash
./mvnw -Dtest=AdminSecurityTests,AdminLoginTests,QuestionValidatorTests test
```

On Windows, use `mvnw.cmd` instead. These targeted tests use mocked repositories and do not need MySQL or real Google credentials. The pre-existing `contextLoads` test still requires complete application configuration and a usable database.

Completed checks:

- Frontend production build passed after a clean `npm ci` in an isolated copy.
- 10 frontend Node tests passed: form validation, JWT display decoding, callback cleanup, API contracts, 401/403 behavior and existing quiz compatibility.
- 6 isolated React/jsdom UI flow checks passed: login buttons, non-admin denial/fallback, expired sessions, admin list/create/edit/delete wiring/topic filtering, mutation-session expiry, and the regular-user quiz flow. Backend responses were mocked for these UI checks. This is not a full browser visual test.
- 21 backend JUnit/MockMvc tests passed using the actual Spring Security filter chain and mocked repositories: role restrictions on both new and legacy endpoints, signed/tampered/expired JWTs, allowlist enforcement, verified-email login, CORS and question validation.
- Backend source and tests compiled and ran with a Java 17 target override in this environment. The project's Java 25 POM setting is unchanged; a native Java 25 build was not validated here.
- `git diff --check` passed.

The targeted backend tests use the Mockito subclass mock maker (a test-only resource) to avoid JVM self-attachment. It supports the repository interface mocks used here; final-class/static mocking would require a different mock-maker setup.

## 8. Scope and remaining limitations

Your update/delete backend methods are intentionally absent. Existing quiz selection/scoring/history behavior remains unchanged, including the scoring integrity issues from the earlier review. No GitHub push or deployment was performed.

The app retains the project's existing localStorage bearer-token design. Tokens remain readable by same-origin JavaScript; a production deployment should use HTTPS, short token lifetimes and XSS defenses, and evaluate a secure cookie or one-time exchange design separately. The default OAuth2 authorization handshake may use a transient HTTP session even though JWT API authentication is stateless. Neither live Google login nor a real MySQL integration has been tested here.
