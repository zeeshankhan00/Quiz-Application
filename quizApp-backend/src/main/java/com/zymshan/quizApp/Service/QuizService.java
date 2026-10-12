package com.zymshan.quizApp.Service;

import com.zymshan.quizApp.Model.*;
import com.zymshan.quizApp.Repository.QuestionRepo;
import com.zymshan.quizApp.Repository.QuizRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service

public class QuizService {

    private final QuizRepo quizRepo;
    private final QuestionRepo questionRepo;

    public QuizService(QuizRepo quizRepo, QuestionRepo questionRepo) {
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
    }

    public ResponseEntity<Integer> createQuiz(String title, String category){

        try {
            List<Questions> questions = questionRepo.findByCategory(category);

            Quiz quiz = new Quiz();

            quiz.setTitle(title);
            quiz.setQuestionsList(questions);
            Quiz createdQUiz = quizRepo.save(quiz);

            Integer quizId = createdQUiz.getId();

            return new ResponseEntity<>(quizId, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(String id) {
        List<QuestionWrapper> questionForUsers = new ArrayList<>();
        for (Questions q : findQuiz(id).getQuestionsList()) {
            QuestionDifficulty difficulty = difficultyOf(q);
            questionForUsers.add(new QuestionWrapper(q.getId(), q.getQuestion(), q.getOption1(),
                    q.getOption2(), q.getOption3(), q.getOption4(), difficulty.getLabel(), difficulty.getPoints()));
        }
        return ResponseEntity.ok(questionForUsers);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<QuizResultResponse> calculateResponse(String quizId, List<QuizResponse> responses) {
        List<Questions> questions = findQuiz(quizId).getQuestionsList();
        if (responses == null) badRequest("An array of answers is required.");

        Set<Integer> questionIds = new HashSet<>();
        for (Questions q : questions) questionIds.add(q.getId());

        Map<Integer, String> answers = new HashMap<>();
        for (QuizResponse response : responses) {
            if (response == null || response.getId() == null) badRequest("Each answer needs a question ID.");
            Integer id = response.getId();
            if (!questionIds.contains(id)) badRequest("Question " + id + " does not belong to this quiz.");
            if (answers.containsKey(id)) badRequest("Question " + id + " was submitted more than once.");
            answers.put(id, response.getUserResponse() == null ? "" : response.getUserResponse().strip());
        }

        int score = 0;
        int maxScore = 0;
        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;
        List<QuestionResult> questionResults = new ArrayList<>();

        // Evaluate the stored quiz, so omitted answers cannot shrink its maximum score.
        for (Questions q : questions) {
            QuestionDifficulty difficulty = difficultyOf(q);
            String userResponse = answers.getOrDefault(q.getId(), "");
            boolean answered = !userResponse.isBlank();
            boolean correct = answered && q.getRightAnswer() != null
                    && q.getRightAnswer().strip().equals(userResponse);
            int pointsAwarded = correct ? difficulty.getPoints() : 0;

            score += pointsAwarded;
            maxScore += difficulty.getPoints();
            if (correct) correctCount++;
            else if (answered) incorrectCount++;
            else unansweredCount++;

            questionResults.add(new QuestionResult(q.getId(), q.getQuestion(), q.getOption1(),
                    q.getOption2(), q.getOption3(), q.getOption4(), userResponse, q.getRightAnswer(),
                    correct, difficulty.getLabel(), difficulty.getPoints(), pointsAwarded, answered));
        }

        return ResponseEntity.ok(new QuizResultResponse(score, maxScore, correctCount,
                incorrectCount, unansweredCount, questionResults));
    }

    private Quiz findQuiz(String id) {
        int quizId;
        try {
            quizId = Integer.parseInt(id);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid quiz ID is required.");
        }
        if (quizId <= 0) badRequest("A valid quiz ID is required.");
        return quizRepo.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found."));
    }

    private QuestionDifficulty difficultyOf(Questions question) {
        try {
            return QuestionDifficulty.from(question.getDifficulty());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Question " + question.getId() + " needs a valid difficulty before this quiz can be scored.");
        }
    }

    private void badRequest(String message) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
