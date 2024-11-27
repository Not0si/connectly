package com.connectly.connectly.dto;


import java.util.List;

public record ChatDTO(Long id,
                      String name,
                      String description,
                      UserDTO createdBy,
                      ChatDTOType type,
                      List<ChatDTOUser> members

) {


}
