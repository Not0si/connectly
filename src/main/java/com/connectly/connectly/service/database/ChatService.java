package com.connectly.connectly.service.database;


import com.connectly.connectly.model.database.Chat;
import com.connectly.connectly.model.database.ChatType;
import com.connectly.connectly.repository.database.ChatRepository;
import com.connectly.connectly.repository.database.ChatTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class ChatService {
    private ChatRepository chatRepository;
    private ChatTypeRepository chatTypeRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository,ChatTypeRepository chatTypeRepository) {
        this.chatRepository = chatRepository;
        this.chatTypeRepository = chatTypeRepository;
    }

    public List<Chat> getUserChats(String userName){
       return chatRepository.findChatsByUserName(userName.trim());
    }

    public Chat newOneToOneChat() throws Exception{
       ChatType chatType =  chatTypeRepository.findByName("one-to-one");

       if(chatType == null) {
           throw new Exception();
       }

       Chat chat = new Chat();
       chat.setType(chatType);

       return chat;
    }

    public Chat newGroupChat() throws Exception{
        ChatType chatType =  chatTypeRepository.findByName("group");

        if(chatType == null) {
            throw new Exception();
        }

        Chat chat = new Chat();
        chat.setType(chatType);

        return chat;
    }
}
