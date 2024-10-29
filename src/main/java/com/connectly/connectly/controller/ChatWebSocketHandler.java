package com.connectly.connectly.controller;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketHandler {

    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ChatWebSocketHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;

    }

    public String getNowIsoString() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        String utcDateTimeString = now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        return utcDateTimeString;
    }

    public void manageMessages() {
        messagingTemplate.convertAndSend("", "Hello");
    }

}
