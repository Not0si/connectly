package com.connectly.connectly.model;

import jakarta.persistence.*;

@Entity
@Table(name = "participant_role")
public class ParticipantRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer Id;

    @Column(name = "name", length = 10)
    private String Name;

    public String getName() {
        return Name;
    }

    public void setName(String name) {
        Name = name;
    }
}
