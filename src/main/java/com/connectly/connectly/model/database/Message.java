package com.connectly.connectly.model.database;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true,updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reply_to_message_id", referencedColumnName = "id", nullable = true)
    private Message replyToMessage;

    @Column(name = "is_forwarded", nullable = false)
    private Boolean isForwarded = false;

    @Column(name = "sent_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp sentAt;

    @Column(name = "content", nullable = false, length = 500)
    private String content;

    @ManyToOne
    @JoinColumn(name = "chat_id", referencedColumnName = "id", nullable = false)
    private Chat chat;

    @ManyToOne
    @JoinColumn(name = "chat_participant_id", referencedColumnName = "id", nullable = false)
    private ChatParticipant chatParticipant;

    @ManyToOne
    @JoinColumn(name = "media_type_id", referencedColumnName = "id", nullable = true)
    private MediaType mediaType;

    // Getters, and Setters


    public Long getId() {
        return id;
    }


    public Message getReplyToMessage() {
        return replyToMessage;
    }

    public void setReplyToMessage(Message replyToMessage) {
        this.replyToMessage = replyToMessage;
    }

    public Boolean getIsForwarded() {
        return isForwarded;
    }

    public void setIsForwarded(Boolean isForwarded) {
        this.isForwarded = isForwarded;
    }

    public Timestamp getSentAt() {
        return sentAt;
    }

    public void setSentAt(Timestamp sentAt) {
        this.sentAt = sentAt;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Chat getChat() {
        return chat;
    }

    public void setChat(Chat chat) {
        this.chat = chat;
    }

    public ChatParticipant getChatParticipant() {
        return chatParticipant;
    }

    public void setChatParticipant(ChatParticipant chatParticipant) {
        this.chatParticipant = chatParticipant;
    }

    public MediaType getMediaType() {
        return mediaType;
    }

    public void setMediaType(MediaType mediaType) {
        this.mediaType = mediaType;
    }
}
