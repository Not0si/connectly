package com.connectly.connectly.config.exception;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @ExceptionHandler(RestException.class)
    public ResponseEntity<Object> handleRestException(RestException exception) {
        if ("dev".equalsIgnoreCase(activeProfile)) {
            ResponseError responseError = new ResponseError(
                    exception.getCause().getMessage(),
                    HttpStatus.BAD_REQUEST,
                    exception
            );

            return new ResponseEntity<>(responseError, HttpStatus.BAD_REQUEST);
        }

        MiniResponseError miniResponseError = new MiniResponseError(
                exception.getCause().getMessage(),
                HttpStatus.BAD_REQUEST
        );
        return new ResponseEntity<>(miniResponseError, HttpStatus.BAD_REQUEST);
    }
}

class MiniResponseError {
    private String message;
    private HttpStatus status;
    private final LocalDateTime localDateTime = LocalDateTime.now();

    public MiniResponseError(String message, HttpStatus status) {
        this.message = message;
        this.status = status;
    }

    // Getters (optional, for serialization)
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

class ResponseError extends MiniResponseError {
    private Throwable throwable;

    public ResponseError(String message, HttpStatus status, Throwable throwable) {
        super(message, status);
        this.throwable = throwable;
    }

    // Getter (optional, for serialization)
    public Throwable getThrowable() {
        return throwable;
    }
}
