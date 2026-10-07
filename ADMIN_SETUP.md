# Admin feature integration — Quiz Application


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

## API contract for your update and delete endpoints

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


Supported categories: Java, Advance Java, Spring Boot, Spring Security, Spring JDBC, SQL, AWS, Docker. Supported difficulties: Easy, Medium, Hard. Validation trims text, canonicalizes topic/difficulty casing, requires four distinct nonblank options, limits option/answer length to 255 characters, and checks that the correct answer matches one option exactly. The form remembers the correct option by index so changing its text updates the answer too.

### Deleting referenced questions

Existing quizzes reference question entities using `@ManyToMany`. A plain hard delete of a referenced question can violate foreign keys. Until you implement soft deletion, return `409` for referenced questions. If you choose soft deletion, add an active/inactive field and ensure quiz creation excludes inactive questions. This bundle does not add that schema change or implement delete behavior.


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
