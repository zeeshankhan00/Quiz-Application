package com.zymshan.quizApp.Repository;

import com.zymshan.quizApp.Model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepo extends JpaRepository<Quiz,Integer> {
}
