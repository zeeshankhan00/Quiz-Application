package com.zymshan.quizApp.Model;

import java.util.List;

public class quizResultResponse {

    private Integer score;
    private List<questionResult> questionResults;

    public quizResultResponse(Integer score, List<questionResult> questionResults) {
        this.score = score;
        this.questionResults = questionResults;
    }

    public Integer getScore() {
        return score;
    }

    public List<questionResult> getQuestionResults() {
        return questionResults;
    }
}
