package com.zymshan.quizApp.Config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final JwtUtil jwtUtil;
    private final AdminAccessPolicy adminAccessPolicy;
    private final String frontendUrl;
    public OAuth2LoginSuccessHandler(JwtUtil jwtUtil, AdminAccessPolicy adminAccessPolicy,
                                     @Value("${app.frontend.url}") String frontendUrl) {
        this.jwtUtil = jwtUtil;
        this.adminAccessPolicy = adminAccessPolicy;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User user = (OAuth2User) authentication.getPrincipal();
        String email = user.getAttribute("email");
        boolean verified = Boolean.TRUE.equals(user.getAttribute("email_verified"))
                || Boolean.TRUE.equals(user.getAttribute("verified_email"));
        boolean google = authentication instanceof OAuth2AuthenticationToken oauth
                && "google".equals(oauth.getAuthorizedClientRegistrationId());
        if (!google || !verified || email == null || email.isBlank()) {
            response.sendRedirect(frontendUrl + "/oauth2/redirect?error=unverified_email");
            return;
        }
        String token = jwtUtil.generateToken(email, user.getAttribute("name"),
                adminAccessPolicy.roleForEmail(email));
        // Fragment avoids sending the token to the frontend server in its HTTP query string.
        String url = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .fragment("token=" + token).build().toUriString();
        response.setHeader("Cache-Control", "no-store");
        response.sendRedirect(url);
    }
}
