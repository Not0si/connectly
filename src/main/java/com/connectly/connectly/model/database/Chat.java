package com.connectly.connectly.model.database;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "chat")
public class Chat extends BaseEntity {

    @OneToOne(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    private ChatDetail chatDetail;

    @ManyToOne
    @JoinColumn(name = "created_by_id", referencedColumnName = "id", updatable = false)
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "updated_by_id", referencedColumnName = "id", insertable = false)
    private User updatedBy;

    @ManyToOne
    @JoinColumn(name = "chat_type_id", referencedColumnName = "id", nullable = false, updatable = false)
    private ChatType type;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ChatParticipant> chatParticipants;

    // Getters and Setters
    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }

    public ChatType getType() {
        return type;
    }

    public void setType(ChatType type) {
        this.type = type;
    }

    public ChatDetail getChatDetail() {
        return chatDetail;
    }

    public void setChatDetail(ChatDetail chatDetail) {
        this.chatDetail = chatDetail;
    }

    public List<ChatParticipant> getChatParticipants() {
        return chatParticipants;
    }

    public void setChatParticipants(List<ChatParticipant> chatParticipants) {
        this.chatParticipants = chatParticipants;
    }

    // Builder Inner Class
    public static class Builder {
        private ChatDetail chatDetail;
        private User createdBy;
        private User updatedBy;
        private ChatType type;
        private List<ChatParticipant> chatParticipants;

        public Builder setChatDetail(ChatDetail chatDetail) {
            this.chatDetail = chatDetail;
            return this;
        }

        public Builder setCreatedBy(User createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public Builder setUpdatedBy(User updatedBy) {
            this.updatedBy = updatedBy;
            return this;
        }

        public Builder setType(ChatType type) {
            this.type = type;
            return this;
        }

        public Builder setChatParticipants(List<ChatParticipant> chatParticipants) {
            this.chatParticipants = chatParticipants;
            return this;
        }

        public Chat build() {
            Chat chat = new Chat();
            chat.setChatDetail(this.chatDetail);
            chat.setCreatedBy(this.createdBy);
            chat.setUpdatedBy(this.updatedBy);
            chat.setType(this.type);
            chat.setChatParticipants(this.chatParticipants);
            return chat;
        }
    }

    // Factory method to create a builder
    public static Builder builder() {
        return new Builder();
    }
}
