package com.connectly.connectly.config.security;

import com.connectly.connectly.service.redis.SessionProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;


@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final SessionProfileService sessionProfileService;
    private final SessionValidationFilter sessionValidationFilter;

    @Autowired
    public SecurityConfig(SessionProfileService sessionProfileService, SessionValidationFilter sessionValidationFilter) {
        this.sessionProfileService = sessionProfileService;
        this.sessionValidationFilter = sessionValidationFilter;
    }


    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    @Profile("!dev")
    public SecurityFilterChain productionSecurityFilterChain(HttpSecurity http) throws Exception {
        HttpSecurityConfig(http);

        return http.build();
    }

    @Bean
    @Profile("dev")
    public SecurityFilterChain developementSecurityFilterChain(HttpSecurity http) throws Exception {
        HttpSecurityConfig(http);

        http.csrf(csrfConfig -> csrfConfig.disable());
        http.cors(corsConfig -> corsConfig
                .configurationSource(devCorsConfigurationSource()));


        return http.build();
    }

    @Bean
    CorsConfigurationSource devCorsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:8080", "http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    public HttpSecurity HttpSecurityConfig(HttpSecurity http) throws Exception {
        http.sessionManagement(sessionConfig -> sessionConfig
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        http.addFilterBefore(sessionValidationFilter, UsernamePasswordAuthenticationFilter.class);


        http.authorizeHttpRequests(httpRequest -> httpRequest
                .requestMatchers("/css/**", "/js/**", "/favicon/**", "/images/**").permitAll()
                .requestMatchers("/login**").permitAll()
                .requestMatchers("/api/v1/auth/login").anonymous()
                .anyRequest().authenticated()
        );

        http.logout(logoutConfigurer -> logoutConfigurer.disable());
        http.formLogin(formLoginConfigurer -> formLoginConfigurer.disable());
        http.httpBasic(httpBasicConfigurer -> httpBasicConfigurer.disable());

        return http;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

}
