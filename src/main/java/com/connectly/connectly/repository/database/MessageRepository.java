package com.connectly.connectly.repository.database;

import com.connectly.connectly.model.database.ChatParticipant;
import com.connectly.connectly.model.database.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    Message findByChatParticipant(ChatParticipant chatParticipant);
}
