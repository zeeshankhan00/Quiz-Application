package com.zymshan.quizApp.Config;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final AdminAccessPolicy adminAccessPolicy;
    public JWTAuthFilter(JwtUtil jwtUtil, AdminAccessPolicy adminAccessPolicy) {
        this.jwtUtil = jwtUtil;
        this.adminAccessPolicy = adminAccessPolicy;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                var claims = jwtUtil.parseClaims(header.substring(7));
                String email = claims.getSubject();
                String roleClaim = claims.get("role", String.class);
                if (email == null || email.isBlank() || roleClaim == null)
                    throw new IllegalArgumentException("Missing identity or role");
                AppRole tokenRole = AppRole.valueOf(roleClaim);
                // Removing an email from configuration revokes admin privileges on old JWTs too.
                AppRole role = tokenRole == AppRole.ADMIN
                        && adminAccessPolicy.roleForEmail(email) == AppRole.ADMIN ? AppRole.ADMIN : AppRole.USER;
                var auth = new UsernamePasswordAuthenticationToken(email, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.name())));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException | IllegalArgumentException ex) {
                SecurityContextHolder.clearContext();
                response.setStatus(401);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Session expired or invalid. Please sign in again.\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
