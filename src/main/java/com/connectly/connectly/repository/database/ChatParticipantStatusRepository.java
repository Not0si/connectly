package com.connectly.connectly.repository.database;

import com.connectly.connectly.model.database.ChatParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatParticipantStatusRepository extends JpaRepository<ChatParticipantStatus, Long> {
}
