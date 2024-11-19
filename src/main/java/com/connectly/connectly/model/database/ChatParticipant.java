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

    // Getters, and Setters


    public Long getId() {
        return id;
    }


    public Chat getChat() {
        return chat;
    }

    public void setChat(Chat chat) {
        this.chat = chat;
    }

    public User getParticipant() {
        return participant;
    }

    public void setParticipant(User participant) {
        this.participant = participant;
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

    public ChatParticipantStatus getChatParticipantStatus() {
        return chatParticipantStatus;
    }

    public void setChatParticipantStatus(ChatParticipantStatus chatParticipantStatus) {
        this.chatParticipantStatus = chatParticipantStatus;
    }
}
