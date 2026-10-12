package com.zymshan.quizApp.Model;

public enum QuestionDifficulty {
    EASY("Easy", 1),
    MEDIUM("Medium", 2),
    HARD("Hard", 3);

    private final String label;
    private final int points;

    QuestionDifficulty(String label, int points) {
        this.label = label;
        this.points = points;
    }

    public String getLabel() { return label; }
    public int getPoints() { return points; }

    public static QuestionDifficulty from(String value) {
        if (value != null) {
            for (QuestionDifficulty difficulty : values()) {
                if (difficulty.label.equalsIgnoreCase(value.strip())) return difficulty;
            }
        }
        throw new IllegalArgumentException("Difficulty must be Easy, Medium, or Hard.");
    }
}
