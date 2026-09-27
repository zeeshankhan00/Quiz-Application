package com.zymshan.quizApp.Model;

public class questionResult {

    private Integer id;
    private String question;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String userResponse;
    private String rightAnswer;
    private boolean correct;

    public questionResult(Integer id, String question, String option1, String option2,
                          String option3, String option4, String userResponse,
                          String rightAnswer, boolean correct) {
        this.id = id;
        this.question = question;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.option4 = option4;
        this.userResponse = userResponse;
        this.rightAnswer = rightAnswer;
        this.correct = correct;
    }

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
