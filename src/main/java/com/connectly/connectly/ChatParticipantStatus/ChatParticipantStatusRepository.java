package com.connectly.connectly.ChatParticipantStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatParticipantStatusRepository extends JpaRepository<ChatParticipantStatus, Long> {
}
