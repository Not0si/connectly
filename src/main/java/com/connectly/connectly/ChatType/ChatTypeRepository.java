package com.connectly.connectly.ChatType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatTypeRepository extends JpaRepository<ChatType, Integer> {
    ChatType findByName(String name);
}
