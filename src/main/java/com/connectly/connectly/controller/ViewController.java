package com.connectly.connectly.controller;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;


@Controller
public class ViewController {
    Logger logger = LoggerFactory.getLogger(ViewController.class);


    @GetMapping("/login")
    public String homePage() {
        return "index";
    }

    @GetMapping("/chat")
    public String submitForm() {
        logger.info("We are here, Chat");

        return "chat";
    }

}
