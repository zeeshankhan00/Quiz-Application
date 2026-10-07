package com.zymshan.quizApp.Config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey signingKey;
    private final long expirationMs;
    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                   @Value("${app.jwt.expiration-ms}") long expirationMs) {
        signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        if (expirationMs <= 0) throw new IllegalArgumentException("JWT lifetime must be positive");
        this.expirationMs = expirationMs;
    }
    public String generateToken(String email, String name, AppRole role) {
        Date now = new Date();
        return Jwts.builder().issuer("quiz-app").subject(email).claim("name", name)
                .claim("role", role.name()).issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(signingKey).compact();
    }
    // Signature, issuer and expiry are checked before claims are used.
    public Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(signingKey).requireIssuer("quiz-app")
                .build().parseSignedClaims(token).getPayload();
    }
}
