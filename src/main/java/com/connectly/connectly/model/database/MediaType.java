package com.connectly.connectly.model.database;

import jakarta.persistence.*;

@Entity
@Table(name = "media_type")
public class MediaType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false,unique = true,updatable = false)
    private Integer id;

    @Column(name = "name", length = 10, nullable = false)
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
