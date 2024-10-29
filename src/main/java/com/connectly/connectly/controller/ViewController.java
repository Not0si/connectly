package com.connectly.connectly.controller;

import com.connectly.connectly.model.UserForm;
import com.connectly.connectly.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.connectly.connectly.model.User;

import jakarta.validation.Valid;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
public class ViewController {
    private UserService userService;

    @Autowired
    public ViewController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    public String homePage(Model model) {
        model.addAttribute("user", new UserForm());
        return "index";
    }

    @PostMapping("/chat")
    public String submitForm(@Valid @ModelAttribute("user") UserForm user, BindingResult result, Model model, RedirectAttributes redirectAttributes) {

        if (result.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.user", result);
            redirectAttributes.addFlashAttribute("user", user);


            return "redirect:/";
        }

        User me = userService.registerUser(user);

        if (me != null) {

            model.addAttribute("me", me);
            System.out.println(me);
            return "chat";
        }

        return "redirect:/";
    }

}
