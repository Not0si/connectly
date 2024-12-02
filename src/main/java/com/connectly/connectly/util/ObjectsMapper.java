package com.connectly.connectly.util;

import com.connectly.connectly.dto.ChatDTO;
import com.connectly.connectly.dto.ChatDTOType;
import com.connectly.connectly.dto.ChatDTOUser;
import com.connectly.connectly.dto.UserDTO;
import com.connectly.connectly.model.database.Chat;
import com.connectly.connectly.model.database.ParticipantRole;
import com.connectly.connectly.model.database.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ObjectsMapper {
    public static ChatDTO mapToChatDTO(Chat chat) {
        if (chat == null) return null;

        ChatDTOType type = new ChatDTOType(chat.getType().getId(), chat.getType().getName());

        UserDTO createdBy = mapUserToUserDTO(chat.getCreatedBy());

        List<ChatDTOUser> memberDTOs = chat.getChatParticipants().stream()
                .map((chatParticipant -> mapUserToChatDTOUser(chatParticipant.getParticipant(), chatParticipant.getParticipantRole())))
                .collect(Collectors.toList());


        return new ChatDTO(
                chat.getId(),
                chat.getName(),
                chat.getDescription(),
                createdBy,
                type,
                memberDTOs
        );
    }


    private static ChatDTOUser mapUserToChatDTOUser(User user, ParticipantRole role) {
        return new ChatDTOUser(user.getId(), user.getUserName(), user.getAvatarUrl(), role);
    }

    public static UserDTO mapUserToUserDTO(User user) {
        if (user == null) return null;

        return new UserDTO(user.getId(), user.getUserName(), user.getAvatarUrl(), user.getCreatedAt());
    }
}
