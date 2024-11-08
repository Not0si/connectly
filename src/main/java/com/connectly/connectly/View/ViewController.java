package com.connectly.connectly.View;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
public class ViewController {

    @GetMapping("/login")
    public String homePage() {
        return "index";
    }

    @RequestMapping("/chat")
    public String submitForm() {
        return "chat";
    }

}
