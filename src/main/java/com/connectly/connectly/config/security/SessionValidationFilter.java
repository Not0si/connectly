package com.connectly.connectly.config.security;

import com.connectly.connectly.service.redis.SessionProfileService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SessionValidationFilter extends OncePerRequestFilter {
    private final SessionProfileService sessionProfileService;

    @Autowired
    public SessionValidationFilter(SessionProfileService sessionProfileService) {
        this.sessionProfileService = sessionProfileService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        sessionProfileService.validateSessionInformation(request, response);
        filterChain.doFilter(request, response);
    }
}
