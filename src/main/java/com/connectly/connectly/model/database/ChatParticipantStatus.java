package com.connectly.connectly.model.database;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_participant_status")
public class ChatParticipantStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    private Long id;

    @ManyToOne(cascade = {CascadeType.ALL})
    @JoinColumn(name = "last_seen_message_id", referencedColumnName = "id")
    private Message lastSeenMessage;

    @OneToOne(mappedBy = "chatParticipantStatus")
    private ChatParticipant chatParticipant;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() {
        return id;
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

    // Builder pattern implementation
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Message lastSeenMessage;
        private ChatParticipant chatParticipant;
        private LocalDateTime updatedAt = LocalDateTime.now();

        private Builder() {
        }

        public Builder lastSeenMessage(Message lastSeenMessage) {
            this.lastSeenMessage = lastSeenMessage;
            return this;
        }

        public Builder chatParticipant(ChatParticipant chatParticipant) {
            this.chatParticipant = chatParticipant;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ChatParticipantStatus build() {
            ChatParticipantStatus chatParticipantStatus = new ChatParticipantStatus();
            chatParticipantStatus.setLastSeenMessage(this.lastSeenMessage);
            chatParticipantStatus.setChatParticipant(this.chatParticipant);
            chatParticipantStatus.setUpdatedAt(this.updatedAt);
            return chatParticipantStatus;
        }
    }
}
