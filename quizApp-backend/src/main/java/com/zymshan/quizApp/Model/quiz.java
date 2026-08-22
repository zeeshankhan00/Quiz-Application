package com.zymshan.quizApp.Model;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String title;

    @ManyToMany
    private List<questions> questionsList;

    public quiz(){

    }

    public quiz(Integer id, String title, List<questions> questionsList) {
        this.id = id;
        this.title = title;
        this.questionsList = questionsList;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<questions> getQuestionsList() {
        return questionsList;
    }

    public void setQuestionsList(List<questions> questionsList) {
        this.questionsList = questionsList;
    }
}
