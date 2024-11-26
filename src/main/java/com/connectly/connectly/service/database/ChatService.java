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

    public List<Chat> getUserChats(String userName) {
        return chatRepository.findChatsByUserName(userName.trim());
    }


    public ChatDTO createChat(CreateChatRequestDTO requestDTO) throws BaseApiException {
        Chat chat = new Chat();

        //
        Optional<ParticipantRole> optionalMemberRole = participantRoleRepository.findByName("member");
        Optional<ParticipantRole> optionalAdminRole = participantRoleRepository.findByName("admin");

        if (optionalMemberRole.isEmpty() || optionalAdminRole.isEmpty()) {
            throw new BaseApiException("Participant roles not found");
        }

        ParticipantRole memberRole = optionalMemberRole.get();
        ParticipantRole adminRole = optionalAdminRole.get();

        //
        Optional<User> optionalChatOwner = userRepository.findByUserName(requestDTO.owner());

        if (optionalChatOwner.isEmpty()) {
            throw new BaseApiException("User %s not found".formatted(requestDTO.owner()));
        }

        User chatOwner = optionalChatOwner.get();

        //
        List<ChatParticipant> chatParticipants = requestDTO.members()
                .stream()
                .map(name -> {
                    Optional<User> optionalUser = userRepository.findByUserName(name);

                    if (optionalUser.isEmpty()) {
                        throw new BaseApiException("User with name %s not found.".formatted(name));
                    }

                    User user = optionalUser.get();
                    ChatParticipant chatParticipant = ChatParticipant.builder()
                            .setParticipant(user)
                            .setParticipantRole(memberRole)
                            .setChat(chat)
                            .build();

                    return chatParticipant;
                }).toList();

        if (requestDTO.type().equalsIgnoreCase("direct")) {
            Optional<ChatType> optionalDirectChat = chatTypeRepository.findByName("direct");

            if (optionalDirectChat.isEmpty()) {
                throw new BaseApiException("Chat type direct not found.");
            }

            ChatType directChat = optionalDirectChat.get();
            ChatParticipant ownerParticipant = ChatParticipant.builder()
                    .setParticipant(chatOwner)
                    .setParticipantRole(memberRole)
                    .setChat(chat)
                    .build();

            chatParticipants.add(ownerParticipant);

            chat.setType(directChat);
            chat.setChatParticipants(chatParticipants);

            return ObjectsMapper.mapToChatDTO(chatRepository.save(chat));
        } else {
            Optional<ChatType> optionalGroupChat = chatTypeRepository.findByName("group");

            if (optionalGroupChat.isEmpty()) {
                throw new BaseApiException("Chat type group not found.");
            }

            ChatType groupChat = optionalGroupChat.get();

            ChatParticipant ownerParticipant = ChatParticipant.builder()
                    .setParticipant(chatOwner)
                    .setParticipantRole(adminRole)
                    .setChat(chat)
                    .build();

            chatParticipants.add(ownerParticipant);

            chat.setName(requestDTO.name());
            chat.setType(groupChat);
            chat.setChatParticipants(chatParticipants);

            return ObjectsMapper.mapToChatDTO(chatRepository.save(chat));
        }


    }


}
