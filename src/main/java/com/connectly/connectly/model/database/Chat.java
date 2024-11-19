package com.connectly.connectly.model.database;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "chat")
public class Chat extends BaseEntity {

    @Column(name = "name")
    private String name;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<ChatParticipant> getChatParticipants() {
        return chatParticipants;
    }

    public void setChatParticipants(List<ChatParticipant> chatParticipants) {
        this.chatParticipants = chatParticipants;
    }
}
