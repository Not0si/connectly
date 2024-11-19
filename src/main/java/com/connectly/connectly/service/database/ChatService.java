package com.connectly.connectly.service.database;


import com.connectly.connectly.config.exception.RestException;
import com.connectly.connectly.dto.ChatDTO;
import com.connectly.connectly.model.database.*;
import com.connectly.connectly.repository.database.ChatRepository;
import com.connectly.connectly.repository.database.ChatTypeRepository;
import com.connectly.connectly.repository.database.ParticipantRoleRepository;
import com.connectly.connectly.repository.database.UserRepository;
import com.connectly.connectly.util.ObjectsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class ChatService {
    private ChatRepository chatRepository;
    private ChatTypeRepository chatTypeRepository;
    private UserRepository userRepository;
    private ParticipantRoleRepository participantRoleRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository, ChatTypeRepository chatTypeRepository, UserRepository userRepository, ParticipantRoleRepository participantRoleRepository) {
        this.chatRepository = chatRepository;
        this.chatTypeRepository = chatTypeRepository;
        this.userRepository = userRepository;
        this.participantRoleRepository = participantRoleRepository;
    }

    public List<Chat> getUserChats(String userName) {
        return chatRepository.findChatsByUserName(userName.trim());
    }

    private ChatParticipant createChatParticipant(User createdBy, User user, ParticipantRole participantRole, Chat chat) {
        ChatParticipant chatParticipant = new ChatParticipant();
        ChatParticipantStatus chatParticipantStatus = new ChatParticipantStatus();

        chatParticipant.setParticipant(user);
        chatParticipant.setParticipantRole(participantRole);
        chatParticipant.setChat(chat);
        chatParticipant.setCreatedBy(createdBy);
        chatParticipant.setChatParticipantStatus(chatParticipantStatus);

        chatParticipantStatus.setChatParticipant(chatParticipant);

        return chatParticipant;
    }

    public ChatDTO newOneToOneChat(String senderName, String receiverName) throws RestException {
        ChatType chatType = chatTypeRepository.findByName("one-to-one");
        ParticipantRole participantRole = participantRoleRepository.findByName("member");
        User sender = userRepository.findByUserName(senderName);
        User receiver = userRepository.findByUserName(receiverName);

        validateNonNull(sender, "Sender user '%s' not found".formatted(senderName));
        validateNonNull(receiver, "Receiver user '%s' not found".formatted(receiverName));
        validateNonNull(participantRole, "Role 'member' not found in the database");
        validateNonNull(chatType, "Chat type 'one-to-one' not found in the database");


        Chat chat = new Chat();
        chat.setType(chatType);
        chat.setCreatedBy(sender);
        chat.setChatParticipants(List.of(createChatParticipant(sender, sender, participantRole, chat), createChatParticipant(sender, receiver, participantRole, chat)));

        return ObjectsMapper.mapToChatDTO(chatRepository.save(chat));
    }

    private void validateNonNull(Object obj, String errorMessage) {
        if (obj == null) {
            throw new RestException(errorMessage);
        }
    }

    public Chat newGroupChat() throws Exception {
        ChatType chatType = chatTypeRepository.findByName("group");

        if (chatType == null) {
            throw new Exception();
        }

        Chat chat = new Chat();
        chat.setType(chatType);

        return chat;
    }
}
