package com.connectly.connectly.ChatType;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_type")
public class ChatType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "name", length = 15, nullable = false)
    private String name;

    // Getters, and Setters


    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
