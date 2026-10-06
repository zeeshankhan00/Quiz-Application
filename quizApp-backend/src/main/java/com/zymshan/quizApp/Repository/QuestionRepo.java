package com.zymshan.quizApp.Repository;

import com.zymshan.quizApp.Model.Questions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepo extends JpaRepository<Questions,Integer> {

    List<Questions> findByDifficulty(String difficulty);
    List<Questions> findByCategory(String category);
}
