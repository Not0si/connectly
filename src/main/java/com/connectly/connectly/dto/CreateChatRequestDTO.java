package com.connectly.connectly.dto;

import java.util.List;


public record CreateChatRequestDTO(String type, String owner, String name, String description, List<String> members) {

}
