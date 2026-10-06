package com.zymshan.quizApp.Service;


import com.zymshan.quizApp.Model.Questions;
import com.zymshan.quizApp.Repository.QuestionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    public QuestionRepo qRepo;

    public ResponseEntity<List<Questions>> getAllQuestions(){
        try{
            return new ResponseEntity<>(qRepo.findAll(),HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    public ResponseEntity<List<Questions>> getQuestionsByDifficulty(String difficulty){
        try {
            return new ResponseEntity<>(qRepo.findByDifficulty(difficulty), HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    public ResponseEntity<String> createQuestion(Questions q1) {

        try {
            qRepo.save(q1);
            return new ResponseEntity<>("Successfully created Single Question", HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public ResponseEntity<String> createMultipleQuestions(List<Questions> listQues) {

        try {
            qRepo.saveAll(listQues);
            return new ResponseEntity<>("Successfully created Multiple Questions", HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
