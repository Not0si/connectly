package com.connectly.connectly.service.database;


import com.connectly.connectly.config.exception.BaseApiException;
import com.connectly.connectly.dto.ChatDTO;
import com.connectly.connectly.dto.CreateChatRequestDTO;
import com.connectly.connectly.model.database.*;
import com.connectly.connectly.repository.database.ChatRepository;
import com.connectly.connectly.repository.database.ChatTypeRepository;
import com.connectly.connectly.repository.database.ParticipantRoleRepository;
import com.connectly.connectly.repository.database.UserRepository;
import com.connectly.connectly.util.ObjectsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;


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

    public List<ChatDTO> getUserChats(String userName) {
        Optional<User> optionalUser = userRepository.findByUserName(userName);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            List<Chat> chats = chatRepository.findChatsByUserId(user.getId());

            return chats.stream().map(ObjectsMapper::mapToChatDTO).toList();
        }

        return Collections.emptyList();
    }

    public ChatDTO ensureChat(CreateChatRequestDTO requestDTO) throws BaseApiException {
        if (requestDTO.type().equalsIgnoreCase("direct")) {

            User sender = findUserByUsername(requestDTO.owner());
            User receiver = findUserByUsername(requestDTO.members().get(0));

            String chatNameA = sender.getId() + "-" + receiver.getId();
            String chatNameB = receiver.getId() + "-" + sender.getId();

            List<Chat> chats = chatRepository.findByNameIn(List.of(chatNameA, chatNameB));

            if (chats.size() > 0) {
                Chat chat = new ArrayList<>(chats).get(0);
                return ObjectsMapper.mapToChatDTO(chat);
            }

        }

        return createChat(requestDTO);
    }

    public ChatDTO createChat(CreateChatRequestDTO requestDTO) throws BaseApiException {
        Chat chat = new Chat();

        // Retrieve required roles
        ParticipantRole memberRole = findParticipantRoleByName("member");
        ParticipantRole adminRole = findParticipantRoleByName("admin");

        // Retrieve chat owner
        User chatOwner = findUserByUsername(requestDTO.owner());

        // Initialize chat participants list
        ArrayList<ChatParticipant> chatParticipants = new ArrayList<>(requestDTO.members().stream()
                .map(memberName -> {
                    User user = findUserByUsername(memberName);

                    ChatParticipantStatus chatParticipantStatus = new ChatParticipantStatus();


                    ChatParticipant chatParticipant = ChatParticipant.builder()
                            .setParticipant(user)
                            .setParticipantRole(memberRole)
                            .setCreatedBy(chatOwner)
                            .setChat(chat)
                            .setChatParticipantStatus(chatParticipantStatus)
                            .build();


                    chatParticipantStatus.setChatParticipant(chatParticipant);

                    return chatParticipant;
                })
                .toList());

        // Add owner as a participant
        ChatType chatType;
        ChatParticipantStatus ownerChatStatus = new ChatParticipantStatus();

        if (requestDTO.type().equalsIgnoreCase("direct")) {
            chatType = findChatTypeByName("direct");
            ChatParticipant owner = ChatParticipant.builder()
                    .setParticipant(chatOwner)
                    .setParticipantRole(memberRole)
                    .setCreatedBy(chatOwner)
                    .setChatParticipantStatus(ownerChatStatus)
                    .setChat(chat)
                    .build();

            ownerChatStatus.setChatParticipant(owner);
            chatParticipants.add(owner);

            chat.setName(chatOwner.getId() + "-" + chatParticipants.get(0).getParticipant().getId());
        } else {
            chatType = findChatTypeByName("group");
            ChatParticipant owner = ChatParticipant.builder()
                    .setParticipant(chatOwner)
                    .setParticipantRole(adminRole)
                    .setCreatedBy(chatOwner)
                    .setChat(chat)
                    .setChatParticipantStatus(ownerChatStatus)
                    .build();

            ownerChatStatus.setChatParticipant(owner);
            chatParticipants.add(owner);


            chat.setName(requestDTO.name());
            chat.setDescription(requestDTO.description());
        }

        // Set chat properties
        chat.setType(chatType);
        chat.setChatParticipants(chatParticipants);

        // Save and map to DTO
        return ObjectsMapper.mapToChatDTO(chatRepository.save(chat));
    }

    private ParticipantRole findParticipantRoleByName(String roleName) throws BaseApiException {
        return participantRoleRepository.findByName(roleName)
                .orElseThrow(() -> new BaseApiException("Participant role '%s' not found.".formatted(roleName)));
    }

    private User findUserByUsername(String username) throws BaseApiException {
        return userRepository.findByUserName(username)
                .orElseThrow(() -> new BaseApiException("User '%s' not found.".formatted(username)));
    }

    private ChatType findChatTypeByName(String typeName) throws BaseApiException {
        return chatTypeRepository.findByName(typeName)
                .orElseThrow(() -> new BaseApiException("Chat type '%s' not found.".formatted(typeName)));
    }
}
