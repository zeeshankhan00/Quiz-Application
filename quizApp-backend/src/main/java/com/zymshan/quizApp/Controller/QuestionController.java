package com.zymshan.quizApp.Controller;

import com.zymshan.quizApp.Model.Questions;
import com.zymshan.quizApp.Service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("question")
@CrossOrigin(origins = "http://localhost:3000/")
public class QuestionController {

    @Autowired
    QuestionService qService;

     @GetMapping("/allquestions")
    public ResponseEntity<List<Questions>> getAllQuestions(){

         try {
             return qService.getAllQuestions();
         } catch (Exception e) {
             e.printStackTrace();
         }
         return new ResponseEntity<>(new ArrayList<>(), HttpStatus.BAD_REQUEST);
     }

     @GetMapping("/difficulty/{level}")
    public ResponseEntity<List<Questions>> getQuestionsByDifficulty(@PathVariable String level){

         try {
             return qService.getQuestionsByDifficulty(level);
         } catch (Exception e) {
             e.printStackTrace();
         }

         return new ResponseEntity<>(new ArrayList<>(),HttpStatus.OK);

     }

     @PostMapping("/addquestion")
    public ResponseEntity<String> createQuestion(@RequestBody Questions q1){

         try {
             return qService.createQuestion(q1);
         } catch (Exception e) {
             e.printStackTrace();
         }

         return new ResponseEntity<>("Failed",HttpStatus.BAD_GATEWAY);
     }

     @PostMapping("/addmultiplequestions")
    public ResponseEntity<String> createMultipleQuestions(@RequestBody List<Questions> listQues){
         try{
             return qService.createMultipleQuestions(listQues);
         } catch (Exception e) {
             e.printStackTrace();
         }
        return new ResponseEntity<>("Failed",HttpStatus.BAD_GATEWAY);
    }


}
