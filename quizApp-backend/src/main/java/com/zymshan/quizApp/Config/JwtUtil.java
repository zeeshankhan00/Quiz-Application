package com.zymshan.quizApp.Config;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getSigninKey(){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    //Generates a Token with email as the Subject and Name as a custom claim
    public String generateToken(String email, String name){
        Date now = new Date();
        Date expiry = new Date(now.getTime()+expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("name", name)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigninKey())
                .compact();
    }

    // Extracts a Email from a valid Token
    public String getEmail(String token){
        return parseClaims(token).getSubject();
    }

    // Extracts the name claim from valid Token
    public String getName(String token){
        return parseClaims(token).get("name", String.class);
    }

    // Returns true if the token is well-formed, signed correctly, and not expired
    public boolean isValid(String token){

        try{
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigninKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
