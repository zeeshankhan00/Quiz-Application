package com.zymshan.quizApp.Controller;

import com.zymshan.quizApp.Model.Questions;
import com.zymshan.quizApp.Repository.QuestionRepo;
import com.zymshan.quizApp.Service.QuestionService;
import com.zymshan.quizApp.Service.QuestionValidator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("admin/questions")
public class AdminQuestionController {

    private final QuestionRepo repository;
    private final QuestionValidator validator;
    private final QuestionService service;

    public AdminQuestionController(QuestionRepo repository, QuestionValidator validator, QuestionService service){
        this.repository = repository;
        this.validator = validator;
        this.service = service;
    }

    @GetMapping
    public List<Questions> list(@RequestParam(required = false) String category){
          return category == null || category.isBlank() ? repository.findAll() : repository.findByCategory(category.trim());
    }

    @PostMapping
    public ResponseEntity<Questions> create(@RequestBody Questions questions){
         validator.validateAndNormalize(questions);
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(questions));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable String id, @RequestBody Questions questions){
        validator.validateAndNormalize(questions);
        return service.updateQuestion(id,questions);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable String id){
        return service.deleteQuestion(id);
    }


}
