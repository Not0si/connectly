package com.connectly.connectly.dto;

import java.util.List;

public record CreateGroupChat(String groupName, String ownerName, List<String> members) {
}
