package com.connectly.connectly.model.redis;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDateTime;

@RedisHash
public class SocketProfile {

    @Id
    private String userName;

    private boolean isOnline;

    private String channelFrequency;

    private LocalDateTime lastTimeOnline;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public boolean isOnline() {
        return isOnline;
    }

    public void setOnline(boolean online) {
        isOnline = online;
    }

    public String getChannelFrequency() {
        return channelFrequency;
    }

    public void setChannelFrequency(String channelFrequency) {
        this.channelFrequency = channelFrequency;
    }

    public LocalDateTime getLastTimeOnline() {
        return lastTimeOnline;
    }

    public void setLastTimeOnline(LocalDateTime lastTimeOnline) {
        this.lastTimeOnline = lastTimeOnline;
    }
}
