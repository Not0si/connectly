package com.connectly.connectly.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@Profile("!dev")
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(request -> request
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll() // Permit static resources
                .requestMatchers("/login").not().authenticated()
                .anyRequest().authenticated() // Require authentication for other requests
        );

        http.requiresChannel(channel -> channel.anyRequest().requiresSecure());

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
