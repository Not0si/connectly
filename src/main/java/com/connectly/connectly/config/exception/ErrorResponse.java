package com.connectly.connectly.config.exception;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

class ErrorResponse {
    private String message;
    private HttpStatus status;
    private final LocalDateTime localDateTime = LocalDateTime.now();

    public ErrorResponse(String message, HttpStatus status) {
        this.message = message;
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public LocalDateTime getLocalDateTime() {
        return localDateTime;
    }
}
