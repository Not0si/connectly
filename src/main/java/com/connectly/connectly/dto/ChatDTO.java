package com.connectly.connectly.dto;


import java.util.List;

public record ChatDTO(Long id,
                      String name,
                      UserDTO createdBy,
                      ChatDTOType type,
                      List<ChatDTOUser> members

) {


}
