package com.zymshan.quizApp.Service;


import com.zymshan.quizApp.Model.Questions;
import com.zymshan.quizApp.Repository.QuestionRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public ResponseEntity<String> updateQuestion(String id, Questions questions){

        try{
            Questions existingQuestion = qRepo.findById(Integer.valueOf(id))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Question not found."
                    ));
            questions.setId(existingQuestion.getId());
            qRepo.save(questions);
            return new ResponseEntity<>("Successfully Updated the Question", HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @Transactional
    public ResponseEntity<String> deleteQuestion(String id){

            Questions existingQuestion = qRepo.findById(Integer.valueOf(id))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Question not found."
                    ));
            // Remove the question's links to existing quizzes.
            qRepo.removeQuizReferences(Integer.valueOf(id));

            //Remove the Question Entirely
            qRepo.deleteById(Integer.valueOf(id));
            return new ResponseEntity<>("Successfully Deleted the Question", HttpStatus.OK);
    }
}
