package com.connectly.connectly.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@Configuration
@Profile("dev")
public class DevSecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());

        http.authorizeHttpRequests(request -> request
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll() // Permit static resources
                .requestMatchers("/login").not().authenticated()
                .anyRequest().authenticated() // Require authentication for other requests
        );

        http.formLogin(form -> form
                .usernameParameter("user-id")
                .passwordParameter("password")
                .loginPage("/login")
                .failureForwardUrl("/login")
                .successForwardUrl("/chat")
                .permitAll()
        );


        return http.build();
    }
}
