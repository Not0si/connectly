package com.connectly.connectly.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long Id;

    @Column(name = "user_name")
    private String UserName;

    @Column(name = "password")
    private String Password;

    @Column(name = "avatar_url")
    private String AvatarURL;

    @Column(name = "joined_at")
    private LocalDateTime JoinedAt;

    @OneToMany(mappedBy = "CreatedBy")
    private List<Chat> createdChats;

    @OneToMany(mappedBy = "UpdatedBy")
    private List<Chat> updatedChats;

    @ManyToOne
    @JoinColumn(name = "role_id", referencedColumnName = "id")
    private Role Role;

}
