package com.connectly.connectly.dto;

import com.connectly.connectly.model.database.ParticipantRole;

public record ChatDTOUser(Long id, String name, String avatarUrl, ParticipantRole role) {
}
