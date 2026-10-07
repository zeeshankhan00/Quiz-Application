package com.zymshan.quizApp.Controller;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/me")
    public CurrentUser currentUser(Authentication authentication){
        boolean admin =authentication.getAuthorities().stream()
                .anyMatch(a->"ROLE_ADMIN".equals(a.getAuthority()));
        return new CurrentUser(authentication.getName(), admin? "ADMIN" : "USER");
    }

    public record CurrentUser(String email, String role){}
}
