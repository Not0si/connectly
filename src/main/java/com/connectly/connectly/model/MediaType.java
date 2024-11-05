package com.connectly.connectly.model;

import jakarta.persistence.*;

@Entity
@Table(name = "media_type")
public class MediaType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer Id;

    @Column(name = "name")
    private String Name;

}
