package com.connectly.connectly.ChatParticipant;


import com.connectly.connectly.ChatParticipantStatus.ChatParticipantStatus;
import com.connectly.connectly.ParticipantRole.ParticipantRole;
import com.connectly.connectly.User.User;
import jakarta.persistence.*;


import java.time.LocalDateTime;

@Entity
@Table(name = "chat_participant")
public class ChatParticipant {

    @EmbeddedId
    private ChatParticipantId chatParticipantId;

    @Column(name = "id", columnDefinition = "BIGSERIAL", unique = true, updatable = false, nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "participant_role", referencedColumnName = "id", nullable = false)
    private ParticipantRole participantRole;

    @ManyToOne
    @JoinColumn(name = "created_by_id", referencedColumnName = "id", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "chat_participant_status_id", referencedColumnName = "id")
    private ChatParticipantStatus chatParticipantStatus;

    // Getters, and Setters


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatParticipantId getChatParticipantId() {
        return chatParticipantId;
    }

    public void setChatParticipantId(ChatParticipantId chatParticipantId) {
        this.chatParticipantId = chatParticipantId;
    }


    public ParticipantRole getParticipantRole() {
        return participantRole;
    }

    public void setParticipantRole(ParticipantRole participantRole) {
        this.participantRole = participantRole;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ChatParticipantStatus getChatParticipantStatus() {
        return chatParticipantStatus;
    }

    public void setChatParticipantStatus(ChatParticipantStatus chatParticipantStatus) {
        this.chatParticipantStatus = chatParticipantStatus;
    }
}
