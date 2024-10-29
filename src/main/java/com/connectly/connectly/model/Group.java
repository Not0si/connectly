package com.connectly.connectly.model;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Reference;
import org.springframework.data.redis.core.RedisHash;

import java.util.HashSet;
import java.util.Set;

@RedisHash("Group")
public class Group {
    @Id
    @NotNull
    @NotEmpty
    private String name;

    public @NotNull @NotEmpty String getName() {
        return name;
    }

    public void setName(@NotNull @NotEmpty String name) {
        this.name = name;
    }

    @Reference
    private Set<User> members = new HashSet<User>();

    public void addRole(User member) {
        members.add(member);
    }
}
