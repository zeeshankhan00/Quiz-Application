# Quiz App (React + Spring Boot)

A single-page quiz app: pick a topic (Java, Spring Boot, Python, SQL, AWS) → answers are timed
per-question (30s) → submit → see your score.

## Setup

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000 and expects your Spring Boot backend at http://localhost:8080.

## Backend requirements

- `POST /quiz/create?title=...&category=...` → returns the new quiz's id as a raw integer, or `-1` on failure.
- `GET /quiz/get/{id}` → returns an array of questions: `{ id, question, option1, option2, option3, option4 }`.
- `POST /quiz/submit/{id}` with body `[{ id, userResponse }]` → returns a raw integer (count of correct answers).

## CORS

Your Spring Boot backend must allow requests from `http://localhost:3000`. Add this to your controller(s)
or globally:

```java
@CrossOrigin(origins = "http://localhost:3000")
```

Or a global config:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

## Topic → category mapping

| Button label | category value sent to backend |
|---|---|
| Core Java   | `Java` |
| Spring Boot | `SpringBoot` |
| Python      | `Python` |
| SQL         | `SQL` |
| AWS         | `AWS` |

Edit `src/components/TopicSelect.jsx` to change these.

## Adjusting to backend changes

All API request/response assumptions are centralized in `src/api.js`, with comments explaining each one.
If a field name or response shape on the backend changes, that's the only file you should need to touch.
