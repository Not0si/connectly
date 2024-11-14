package com.connectly.connectly.config.security;

import com.connectly.connectly.service.redis.SessionProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
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


@Profile("dev")
@Configuration
@EnableWebSecurity
public class SecurityConfigDev {
    private final SessionProfileService sessionProfileService;
    private final SessionValidationFilter sessionValidationFilter;

    @Autowired
    public SecurityConfigDev(SessionProfileService sessionProfileService, SessionValidationFilter sessionValidationFilter) {
        this.sessionProfileService = sessionProfileService;
        this.sessionValidationFilter = sessionValidationFilter;
    }


    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrfConfig -> csrfConfig.disable());

        http.sessionManagement(sessionConfig -> sessionConfig
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        http.addFilterBefore(sessionValidationFilter, UsernamePasswordAuthenticationFilter.class);


        http.authorizeHttpRequests(httpRequest -> httpRequest
                .requestMatchers("/css/**", "/js/**", "/images/**", "logout").permitAll()
                .requestMatchers("/login**").not().authenticated()
                .anyRequest().authenticated()
        );

        http.logout(logoutConfig -> logoutConfig
                .logoutUrl("/logout")
                .deleteCookies(sessionProfileService.getCookieKey())
                .permitAll()
        );

        http.formLogin(loginFormConfig -> loginFormConfig
                .usernameParameter("user-id")
                .passwordParameter("password")
                .loginPage("/login")
                .successHandler((HttpServletRequest request,
                                 HttpServletResponse response,
                                 Authentication authentication) -> {

                    Object principal = authentication.getPrincipal();
                    sessionProfileService.registerNewSession(response, principal);

                    response.sendRedirect("/chat");
                }).failureHandler((HttpServletRequest request,
                                   HttpServletResponse response,
                                   AuthenticationException exception) -> {

                    String errorMessage = exception.getMessage();

                    switch (errorMessage) {
                        case "Username must be more than 3 characters":
                            response.sendRedirect("/login?error=usernamelength");
                            break;

                        case "Password must be more than 8 characters":
                            response.sendRedirect("/login?error=passwordlength");
                            break;

                        default:
                            response.sendRedirect("/login?error=true");
                            break;
                    }

                })
                .permitAll()
        );


        return http.build();
    }
}
