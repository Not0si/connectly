package com.connectly.connectly.repository.database;

import com.connectly.connectly.model.database.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c JOIN c.chatParticipants cp JOIN cp.participant p WHERE p.userName = :userName")
    List<Chat> findChatsByUserName(@Param("userName") String userName);
}
