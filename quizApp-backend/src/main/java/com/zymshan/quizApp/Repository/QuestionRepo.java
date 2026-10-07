package com.zymshan.quizApp.Repository;

import com.zymshan.quizApp.Model.Questions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;

public interface QuestionRepo extends JpaRepository<Questions,Integer> {

    List<Questions> findByDifficulty(String difficulty);
    List<Questions> findByCategory(String category);

    @Modifying
    @Query(
            value = """
            DELETE FROM quiz_questions_list
            WHERE questions_list_id = :questionId
            """,
            nativeQuery = true
    )
    int removeQuizReferences(@Param("questionId") Integer questionId);
}
