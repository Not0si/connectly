package com.connectly.connectly.model;

import jakarta.persistence.*;

@Entity
@Table(name = "chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long Id;

    @Column(name = "name")
    private String Name;

    @ManyToOne
    @JoinColumn(name = "created_by_id", referencedColumnName = "id")
    private User CreatedBy;

    @ManyToOne
    @JoinColumn(name = "updated_by_id", referencedColumnName = "id")
    private User UpdatedBy;

    @ManyToOne
    @JoinColumn(name = "chat_type_id", referencedColumnName = "id")
    private ChatType Type;

}
