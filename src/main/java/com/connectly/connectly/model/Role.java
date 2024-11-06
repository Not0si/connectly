package com.connectly.connectly.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "role")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer Id;

    @Column(name = "name", length = 10)
    private String Name;

    @OneToMany(mappedBy = "Role")
    private List<User> Users;

    public String getName() {
        return Name;
    }

    public void setName(String name) {
        Name = name;
    }
}
