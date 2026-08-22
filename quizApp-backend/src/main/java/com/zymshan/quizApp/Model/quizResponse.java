package com.zymshan.quizApp.Model;

public class quizResponse {

    private Integer id;
    private String userResponse;

    public quizResponse(Integer id, String userResponse) {
        this.id = id;
        this.userResponse = userResponse;
    }

    public quizResponse() {
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
