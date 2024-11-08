package com.connectly.connectly.Message;

import com.connectly.connectly.ChatParticipant.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    Message findByChatParticipant(ChatParticipant chatParticipant);
}
