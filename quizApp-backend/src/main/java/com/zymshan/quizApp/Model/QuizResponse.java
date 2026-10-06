package com.zymshan.quizApp.Model;

public class QuizResponse {

    private Integer id;
    private String userResponse;

    public QuizResponse(Integer id, String userResponse) {
        this.id = id;
        this.userResponse = userResponse;
    }

    public QuizResponse() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUserResponse() {
        return userResponse;
    }

    public void setUserResponse(String userResponse) {
        this.userResponse = userResponse;
    }
}
