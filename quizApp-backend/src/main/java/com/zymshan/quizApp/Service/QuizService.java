package com.zymshan.quizApp.Service;

import com.zymshan.quizApp.Model.*;
import com.zymshan.quizApp.Repository.QuestionRepo;
import com.zymshan.quizApp.Repository.QuizRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service

public class QuizService {

    @Autowired
    QuizRepo quizRepo;

    @Autowired
    QuestionRepo questionRepo;

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

    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(String id) {

        try {
            Optional<Quiz> quiz = quizRepo.findById(Integer.valueOf(id));
            List<Questions> questionsFromDB = quiz.get().getQuestionsList();

            List<QuestionWrapper> questionForUsers = new ArrayList<>();

            for (Questions q : questionsFromDB) {
                QuestionWrapper qw = new QuestionWrapper(q.getId(), q.getQuestion(), q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4());
                questionForUsers.add(qw);
            }

            return new ResponseEntity<>(questionForUsers, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public ResponseEntity<QuizResultResponse> calculateResponse(String quizId, List<QuizResponse> respones) {
        Integer result = 0;

        try {

            Optional<Quiz> quiz = quizRepo.findById(Integer.valueOf(quizId));
            List<Questions> questionsFromDB = quiz.get().getQuestionsList();

            Map<Integer, Questions> questionAnwerMap = new HashMap<>();

            for (Questions q : questionsFromDB) {
                questionAnwerMap.put(q.getId(), q);
            }

            List<QuestionResult> questionResults = new ArrayList<>();

            for (QuizResponse quizResponse : respones) {
                Integer questionId = quizResponse.getId();

                if (questionAnwerMap.containsKey(questionId)) {
                    Questions q = questionAnwerMap.get(questionId);

                    boolean isCorrect = q.getRightAnswer().equalsIgnoreCase(quizResponse.getUserResponse());

                    if (isCorrect) result += 1;
                    else result -= 1;

                    questionResults.add(new QuestionResult(q.getId(), q.getQuestion(), q.getOption1(),
                            q.getOption2(), q.getOption3(), q.getOption4(), quizResponse.getUserResponse(),
                            q.getRightAnswer(), isCorrect));

                }
            }

            return new ResponseEntity<>(new QuizResultResponse(result, questionResults), HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
