package com.connectly.connectly.model;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_participant_status")
public class ChatParticipantStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long Id;
}
