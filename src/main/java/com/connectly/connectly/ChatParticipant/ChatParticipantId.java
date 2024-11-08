package com.connectly.connectly.ChatParticipant;

import java.io.Serializable;
import java.util.Objects;

import com.connectly.connectly.Chat.Chat;
import com.connectly.connectly.User.User;
import jakarta.persistence.*;

@Embeddable
public class ChatParticipantId implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Chat chat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User participant;

    // Getters, and Setters


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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ChatParticipantId that = (ChatParticipantId) o;
        return Objects.equals(getChat(), that.getChat()) && Objects.equals(getParticipant(), that.getParticipant());
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(getChat());
        result = 31 * result + Objects.hashCode(getParticipant());
        return result;
    }
}
