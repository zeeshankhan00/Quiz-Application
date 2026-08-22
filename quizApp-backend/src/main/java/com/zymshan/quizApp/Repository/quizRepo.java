package com.zymshan.quizApp.Repository;

import com.zymshan.quizApp.Model.quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface quizRepo extends JpaRepository<quiz,Integer> {
}
