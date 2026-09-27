package com.zymshan.quizApp.Service;

import com.zymshan.quizApp.Model.*;
import com.zymshan.quizApp.Repository.questionRepo;
import com.zymshan.quizApp.Repository.quizRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service

public class quizService {

    @Autowired
    quizRepo quizRepo;

    @Autowired
    questionRepo questionRepo;

    public ResponseEntity<Integer> createQuiz(String title, String category){

        List<questions> questions = questionRepo.findByCategory(category);

        quiz quiz = new quiz();

        quiz.setTitle(title);
        quiz.setQuestionsList(questions);
        quiz createdQUiz = quizRepo.save(quiz);

        Integer quizId = createdQUiz.getId();

        return new ResponseEntity<>(quizId, HttpStatus.CREATED);

    }

    public ResponseEntity<List<questionWrapper>> getQuizQuestions(String id) {

        Optional<quiz> quiz = quizRepo.findById(Integer.valueOf(id));
        List<questions> questionsFromDB = quiz.get().getQuestionsList();

        List<questionWrapper> questionForUsers = new ArrayList<>();

        for(questions q : questionsFromDB){
            questionWrapper qw = new questionWrapper(q.getId(), q.getQuestion(),q.getOption1(),q.getOption2(), q.getOption3(), q.getOption4());
            questionForUsers.add(qw);
        }

        return new ResponseEntity<>(questionForUsers,HttpStatus.OK);
    }

    public ResponseEntity<quizResultResponse> calculateResponse(String quizId, List<quizResponse> respones) {
        Integer result = 0;

        Optional<quiz> quiz = quizRepo.findById(Integer.valueOf(quizId));
        List<questions> questionsFromDB = quiz.get().getQuestionsList();

        Map<Integer,questions> questionAnwerMap = new HashMap<>();

        for(questions q : questionsFromDB){
            questionAnwerMap.put(q.getId(),q);
        }

        List<questionResult> questionResults = new ArrayList<>();

        for(quizResponse quizResponse : respones){
            Integer questionId  = quizResponse.getId();

            if(questionAnwerMap.containsKey(questionId)){
                questions q = questionAnwerMap.get(questionId);

                boolean isCorrect = q.getRightAnswer().equalsIgnoreCase(quizResponse.getUserResponse());

                if(isCorrect) result +=1;
                else result -=1;

                questionResults.add(new questionResult(q.getId(),q.getQuestion(),q.getOption1(),
                        q.getOption2(),q.getOption3(),q.getOption4(),quizResponse.getUserResponse(),
                        q.getRightAnswer(),isCorrect));

            }
        }

        return new ResponseEntity<>(new quizResultResponse(result,questionResults),HttpStatus.OK);
    }
}
