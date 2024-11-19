package com.connectly.connectly.dto;

import java.time.LocalDateTime;

public record UserDTO(Long id, String name, String avatarUrl, LocalDateTime joinedAt) {
}
