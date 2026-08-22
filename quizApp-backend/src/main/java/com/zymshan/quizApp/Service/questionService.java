package com.zymshan.quizApp.Service;


import com.zymshan.quizApp.Model.questions;
import com.zymshan.quizApp.Repository.questionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class questionService {

    @Autowired
    public questionRepo qRepo;

    public ResponseEntity<List<questions>> getAllQuestions(){
        return new ResponseEntity<>(qRepo.findAll(),HttpStatus.OK);
    }

    public ResponseEntity<List<questions>> getQuestionsByDifficulty(String difficulty){
        return new ResponseEntity<>(qRepo.findByDifficulty(difficulty),HttpStatus.OK);
    }


    public ResponseEntity<String> createQuestion(questions q1) {
         qRepo.save(q1);
         return new ResponseEntity<>("Success",HttpStatus.CREATED);
    }
}
