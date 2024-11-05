package com.connectly.connectly.model;

import jakarta.persistence.*;

@Entity
@Table(name = "chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long Id;


    @ManyToOne(cascade = {CascadeType.PERSIST})
    @JoinColumn(name = "chat_type_id", referencedColumnName = "id")
    private ChatType ChatType;

}
