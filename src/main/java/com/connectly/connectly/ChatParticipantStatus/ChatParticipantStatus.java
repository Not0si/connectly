package com.connectly.connectly.ChatParticipantStatus;

import com.connectly.connectly.ChatParticipant.ChatParticipant;
import com.connectly.connectly.Message.Message;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_participant_status")
public class ChatParticipantStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "last_seen_message_id", referencedColumnName = "id", nullable = true)
    private Message lastSeenMessage;

    @OneToOne(mappedBy = "chatParticipantStatus")
    private ChatParticipant chatParticipant;

    @Column(name = "updated_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    // Getters, and Setters


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Message getLastSeenMessage() {
        return lastSeenMessage;
    }

    public void setLastSeenMessage(Message lastSeenMessage) {
        this.lastSeenMessage = lastSeenMessage;
    }

    public ChatParticipant getChatParticipant() {
        return chatParticipant;
    }

    public void setChatParticipant(ChatParticipant chatParticipant) {
        this.chatParticipant = chatParticipant;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
