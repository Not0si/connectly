package com.connectly.connectly.controller;

import com.connectly.connectly.config.exception.BaseApiException;
import com.connectly.connectly.dto.ChatDTO;
import com.connectly.connectly.dto.CreateOneToOneChat;
import com.connectly.connectly.model.database.Chat;
import com.connectly.connectly.service.database.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/chats")
public class ChatController {
    private ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public List<Chat> getUserChats(@RequestParam(required = true) String userName) {
        return chatService.getUserChats(userName);
    }

    @PostMapping("/one")
    public ResponseEntity<ChatDTO> createChat(@RequestBody CreateOneToOneChat data) {
        try {
            ChatDTO result = chatService.newOneToOneChat(data.senderName(), data.receiverName());

            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } catch (BaseApiException e) {
            throw new BaseApiException(e);
        }


    }

}
