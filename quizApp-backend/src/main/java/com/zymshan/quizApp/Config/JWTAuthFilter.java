package com.zymshan.quizApp.Config;

import com.nimbusds.openid.connect.sdk.federation.utils.JWTUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JWTAuthFilter(JwtUtil jwtUtil){
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
         String header = request.getHeader("Authorization");

         if(header!= null && header.startsWith("Bearer ")){
             String token = header.substring(7);
             if(jwtUtil.isValid(token)){
                 String email = jwtUtil.getEmail(token);
                 var auth = new UsernamePasswordAuthenticationToken(email, null, List.of());
                 SecurityContextHolder.getContext().setAuthentication(auth);
             }
         }

         filterChain.doFilter(request,response);
    }


}
