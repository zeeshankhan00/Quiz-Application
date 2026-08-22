package com.zymshan.quizApp.Controller;

import com.zymshan.quizApp.Model.questionWrapper;
import com.zymshan.quizApp.Model.quiz;
import com.zymshan.quizApp.Model.quizResponse;
import com.zymshan.quizApp.Service.quizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("quiz")
@CrossOrigin(origins = "http://localhost:3000/")
public class quizController {

    @Autowired
    quizService quizService;

    @PostMapping("/create")
    public ResponseEntity<Integer> createQuiz(@RequestParam String title, @RequestParam String category){

        try{
            return quizService.createQuiz(title,category);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ResponseEntity<>(-1, HttpStatus.BAD_GATEWAY);
    }

    @GetMapping("get/{id}")
    public ResponseEntity<List<questionWrapper>> getQuizQuestions(@PathVariable String id){
        return quizService.getQuizQuestions(id);
    }

    @PostMapping("submit/{id}")
    public ResponseEntity<Integer> getQuizScore(@PathVariable String id, @RequestBody List<quizResponse> respones){
        return quizService.calculateResponse(id,respones);
    }
}
