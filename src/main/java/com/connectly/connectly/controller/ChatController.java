package com.connectly.connectly.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ChatController {

  @GetMapping("/")
  public String homePage() {

    return "index";
  }
}
