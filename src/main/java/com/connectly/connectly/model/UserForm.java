package com.connectly.connectly.model;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserForm {

    @NotNull
    @NotEmpty(message = "Username is required")
    @Size(min = 4, max = 30, message = "Username must be between 4 and 30 characters")
    private String name;

    @NotEmpty(message = "Password is required")
    @Size(min = 10, message = "Password must be at least 10 characters")
    @NotNull
    private String password;

    public @NotNull @NotEmpty(message = "Username is required") @Size(min = 4, max = 30, message = "Username must be between 4 and 30 characters") String getName() {
        return name;
    }

    public void setName(@NotNull @NotEmpty(message = "Username is required") @Size(min = 4, max = 30, message = "Username must be between 4 and 30 characters") String name) {
        this.name = name;
    }

    public @NotEmpty(message = "Password is required") @Size(min = 10, message = "Password must be at least 10 characters") @NotNull String getPassword() {
        return password;
    }

    public void setPassword(@NotEmpty(message = "Password is required") @Size(min = 10, message = "Password must be at least 10 characters") @NotNull String password) {
        this.password = password;
    }
}
