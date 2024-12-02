package com.connectly.connectly.repository.database;

import com.connectly.connectly.model.database.Chat;
import com.connectly.connectly.model.database.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c WHERE c.name IN :names")
    List<Chat> findByNameIn(@Param("names") List<String> names);

    @Query("SELECT c FROM Chat c " +
            "JOIN c.chatParticipants cp " +
            "WHERE cp.participant.id = :userId")
    List<Chat> findChatsByUserId(@Param("userId") Long userId);
}
