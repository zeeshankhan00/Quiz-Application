package com.zymshan.quizApp.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AdminAccessPolicy {
    private final Set<String> adminEmails;
    public AdminAccessPolicy(@Value("${app.admin.emails:}") String emails) {
        adminEmails = Arrays.stream(emails.split(","))
                .map(email -> email.trim().toLowerCase(Locale.ROOT))
                .filter(email -> !email.isEmpty()).collect(Collectors.toUnmodifiableSet());
    }
    // Only call with an identity established by Google or a verified application JWT.
    public AppRole roleForEmail(String email) {
        return email != null && adminEmails.contains(email.trim().toLowerCase(Locale.ROOT))
                ? AppRole.ADMIN : AppRole.USER;
    }
}