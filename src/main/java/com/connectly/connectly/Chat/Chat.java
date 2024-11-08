package com.connectly.connectly.Chat;

import com.connectly.connectly.ChatType.ChatType;
import com.connectly.connectly.User.User;
import jakarta.persistence.*;

@Entity
@Table(name = "chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @ManyToOne
    @JoinColumn(name = "created_by_id", referencedColumnName = "id")
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "updated_by_id", referencedColumnName = "id")
    private User updatedBy;

    @ManyToOne
    @JoinColumn(name = "chat_type_id", referencedColumnName = "id")
    private ChatType type;

}
