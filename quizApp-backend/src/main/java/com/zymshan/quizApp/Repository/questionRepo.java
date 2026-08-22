package com.zymshan.quizApp.Repository;

import com.zymshan.quizApp.Model.questions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface questionRepo extends JpaRepository<questions,Integer> {

    List<questions> findByDifficulty(String difficulty);
    List<questions> findByCategory(String category);
}
