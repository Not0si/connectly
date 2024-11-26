package com.connectly.connectly.model.database;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_participant", uniqueConstraints = {@UniqueConstraint(columnNames = {"chat_id", "participant_id"})})
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", referencedColumnName = "id", updatable = false, nullable = false)
    private Chat chat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "participant_id", referencedColumnName = "id", updatable = false, nullable = false)
    private User participant;

    @ManyToOne
    @JoinColumn(name = "participant_role", referencedColumnName = "id", nullable = false)
    private ParticipantRole participantRole;

    @ManyToOne
    @JoinColumn(name = "created_by_id", referencedColumnName = "id", nullable = false, updatable = false)
    private User createdBy;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "chat_participant_status_id", referencedColumnName = "id")
    private ChatParticipantStatus chatParticipantStatus;

    // Private constructor for the builder
    private ChatParticipant() {
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Chat getChat() {
        return chat;
    }

    public User getParticipant() {
        return participant;
    }

    public ParticipantRole getParticipantRole() {
        return participantRole;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public ChatParticipantStatus getChatParticipantStatus() {
        return chatParticipantStatus;
    }

    // Builder class
    public static class Builder {
        private Chat chat;
        private User participant;
        private ParticipantRole participantRole;
        private User createdBy;
        private ChatParticipantStatus chatParticipantStatus;

        public Builder setChat(Chat chat) {
            this.chat = chat;
            return this;
        }

        public Builder setParticipant(User participant) {
            this.participant = participant;
            return this;
        }

        public Builder setParticipantRole(ParticipantRole participantRole) {
            this.participantRole = participantRole;
            return this;
        }

        public Builder setCreatedBy(User createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public Builder setChatParticipantStatus(ChatParticipantStatus chatParticipantStatus) {
            this.chatParticipantStatus = chatParticipantStatus;
            return this;
        }

        public ChatParticipant build() {
            ChatParticipant chatParticipant = new ChatParticipant();
            chatParticipant.chat = this.chat;
            chatParticipant.participant = this.participant;
            chatParticipant.participantRole = this.participantRole;
            chatParticipant.createdBy = this.createdBy;
            chatParticipant.chatParticipantStatus = this.chatParticipantStatus;
            return chatParticipant;
        }
    }

    // Factory method to initiate the builder
    public static Builder builder() {
        return new Builder();
    }
}
