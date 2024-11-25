package com.connectly.connectly.config.exception;

import org.springframework.http.HttpStatus;

public class DevErrorResponse extends ErrorResponse {
    private Throwable throwable;

    public DevErrorResponse(String message, HttpStatus status, Throwable throwable) {
        super(message, status);
        this.throwable = throwable;
    }

    public Throwable getThrowable() {
        return throwable;
    }
}
