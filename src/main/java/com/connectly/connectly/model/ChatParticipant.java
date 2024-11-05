package com.connectly.connectly.model;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_participant")
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long Id;
}
