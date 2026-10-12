package com.zymshan.quizApp.Model;

public class QuestionResult {

    private Integer id;
    private String question;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String userResponse;
    private String rightAnswer;
    private boolean correct;
    private String difficulty;
    private int maxPoints;
    private int pointsAwarded;
    private boolean answered;

    public QuestionResult(Integer id, String question, String option1, String option2,
                          String option3, String option4, String userResponse,
                          String rightAnswer, boolean correct, String difficulty,
                          int maxPoints, int pointsAwarded, boolean answered) {
        this.id = id;
        this.question = question;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.option4 = option4;
        this.userResponse = userResponse;
        this.rightAnswer = rightAnswer;
        this.correct = correct;
        this.difficulty = difficulty;
        this.maxPoints = maxPoints;
        this.pointsAwarded = pointsAwarded;
        this.answered = answered;
    }

    public String getDifficulty() { return difficulty; }
    public int getMaxPoints() { return maxPoints; }
    public int getPointsAwarded() { return pointsAwarded; }
    public boolean isAnswered() { return answered; }

    public Integer getId() {
        return id;
    }

    public String getQuestion() {
        return question;
    }

    public String getOption1() {
        return option1;
    }

    public String getOption2() {
        return option2;
    }

    public String getOption3() {
        return option3;
    }

    public String getOption4() {
        return option4;
    }

    public boolean isCorrect() {
        return correct;
    }

    public String getRightAnswer() {
        return rightAnswer;
    }

    public String getUserResponse() {
        return userResponse;
    }
}
