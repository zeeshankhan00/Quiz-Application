package com.zymshan.quizApp.Model;

import java.util.List;

public class QuizResultResponse {

    private Integer score;
    private List<QuestionResult> questionResults;

    public QuizResultResponse(Integer score, List<QuestionResult> questionResults) {
        this.score = score;
        this.questionResults = questionResults;
    }

    public Integer getScore() {
        return score;
    }

    public List<QuestionResult> getQuestionResults() {
        return questionResults;
    }
}
