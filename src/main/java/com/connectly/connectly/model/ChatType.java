package com.connectly.connectly.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "chat_type")
public class ChatType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer Id;

    @Column(name = "name", length = 10)
    private String Name;

    @OneToMany(mappedBy = "ChatType", cascade = {CascadeType.PERSIST})
    private List<Chat> Chats;
}
