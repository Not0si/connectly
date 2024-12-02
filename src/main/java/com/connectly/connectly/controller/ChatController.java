package com.connectly.connectly.controller;

import com.connectly.connectly.config.exception.BaseApiException;
import com.connectly.connectly.config.exception.ResourceNotFoundException;
import com.connectly.connectly.dto.ChatDTO;
import com.connectly.connectly.dto.CreateChatRequestDTO;
import com.connectly.connectly.model.database.Chat;
import com.connectly.connectly.model.redis.SessionProfile;
import com.connectly.connectly.service.database.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public List<ChatDTO> getUserChats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof SessionProfile)) {
            throw new ResourceNotFoundException("User not authenticated");
        }

        SessionProfile profile = (SessionProfile) authentication.getPrincipal();
        String username = profile.getUserName();

        return chatService.getUserChats(username);
    }

    @PostMapping
    public ResponseEntity<ChatDTO> createChat(@RequestBody CreateChatRequestDTO data) {
        try {
            ChatDTO result = chatService.ensureChat(data);

            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } catch (BaseApiException e) {
            throw new BaseApiException(e);
        }

    }

}
