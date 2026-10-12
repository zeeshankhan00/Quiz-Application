package com.zymshan.quizApp.Model;

import java.util.List;

public class QuizResultResponse {

    private Integer score;
    private int maxScore;
    private int totalQuestions;
    private int correctCount;
    private int incorrectCount;
    private int unansweredCount;
    private double percentage;
    private double accuracy;
    private List<QuestionResult> questionResults;

    public QuizResultResponse(Integer score, int maxScore, int correctCount, int incorrectCount,
                              int unansweredCount, List<QuestionResult> questionResults) {
        this.score = score;
        this.maxScore = maxScore;
        this.totalQuestions = questionResults.size();
        this.correctCount = correctCount;
        this.incorrectCount = incorrectCount;
        this.unansweredCount = unansweredCount;
        this.percentage = percent(score, maxScore);
        this.accuracy = percent(correctCount, totalQuestions);
        this.questionResults = questionResults;
    }

    private static double percent(int value, int total) {
        return total == 0 ? 0 : Math.round(value * 10000.0 / total) / 100.0;
    }

    public int getMaxScore() { return maxScore; }
    public int getTotalQuestions() { return totalQuestions; }
    public int getCorrectCount() { return correctCount; }
    public int getIncorrectCount() { return incorrectCount; }
    public int getUnansweredCount() { return unansweredCount; }
    public double getPercentage() { return percentage; }
    public double getAccuracy() { return accuracy; }

    public Integer getScore() {
        return score;
    }

    public List<QuestionResult> getQuestionResults() {
        return questionResults;
    }
}
