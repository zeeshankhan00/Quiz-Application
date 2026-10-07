package com.zymshan.quizApp.Service;

import com.zymshan.quizApp.Model.Questions;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Component
public class QuestionValidator {
    private static final List<String> CATEGORIES = List.of("Java", "Advance Java", "Spring Boot",
            "Spring Security", "Spring JDBC", "SQL", "AWS", "Docker");
    private static final List<String> DIFFICULTIES = List.of("Easy", "Medium", "Hard");

    public void validateAndNormalize(Questions q){
        if (q == null) badRequest("Question body is required.");
        q.setCategory(choice(q.getCategory(), CATEGORIES, "topic"));
        q.setDifficulty(choice(q.getDifficulty(), DIFFICULTIES, "difficulty"));
        q.setQuestion(text(q.getQuestion(), "Question", 10000));
        q.setOption1(text(q.getOption1(), "Option 1", 255));
        q.setOption2(text(q.getOption2(), "Option 2", 255));
        q.setOption3(text(q.getOption3(), "Option 3", 255));
        q.setOption4(text(q.getOption4(), "Option 4", 255));
        q.setRightAnswer(text(q.getRightAnswer(), "Correct answer", 255));
        List<String> options = List.of(q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4());
        if (options.stream().distinct().count() != 4) badRequest("The four options must be distinct.");
        if (!options.contains(q.getRightAnswer())) badRequest("Correct answer must match an option exactly.");
    }

    private String text(String value, String label, int maxLength) {
        if (value == null || value.isBlank()) badRequest(label + " is required.");
        String trimmed = value.trim();
        if (trimmed.length() > maxLength) badRequest(label + " is too long.");
        return trimmed;
    }
    private String choice(String value, List<String> choices, String label) {
        if (value != null) {
            for (String choice : choices) if (choice.equalsIgnoreCase(value.trim())) return choice;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported " + label + ".");
    }
    private void badRequest(String message) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

}
