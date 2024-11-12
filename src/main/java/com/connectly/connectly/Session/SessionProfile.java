package com.connectly.connectly.Session;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;
import java.util.List;

@RedisHash
public class SessionProfile {

    @Id
    private String opaqueToken;

    private String userName;

    private List<GrantedAuthority> authorities;

    private LocalDateTime createdAt;

    public String getOpaqueToken() {
        return opaqueToken;
    }

    public void setOpaqueToken(String opaqueToken) {
        this.opaqueToken = opaqueToken;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(List<GrantedAuthority> authorities) {
        this.authorities = authorities;
    }
}
