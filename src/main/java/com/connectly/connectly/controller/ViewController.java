package com.connectly.connectly.controller;


import com.connectly.connectly.service.redis.SessionProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
public class ViewController {
    private final SessionProfileService sessionProfileService;

    public ViewController(SessionProfileService sessionProfileService) {
        this.sessionProfileService = sessionProfileService;
    }

    @GetMapping("/login")
    public String homePage() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return "login";
        }

        return "redirect:/chat";

    }

    @RequestMapping("/chat")
    public String submitForm() {
        return "index";
    }

    @RequestMapping("/logout")
    public String logOut(HttpServletRequest request, HttpServletResponse response) {
        sessionProfileService.removeSessionInformation(request, response);

        return "redirect:/login";
    }

    @RequestMapping("/")
    public String home() {
        return "redirect:/login";
    }
}
