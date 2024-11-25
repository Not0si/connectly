package com.connectly.connectly.config.exception;

public class BaseApiException extends RuntimeException {

    public BaseApiException(String message) {
        super(message);
    }

    public BaseApiException(Throwable cause) {
        super(cause);
    }

    public BaseApiException(String message, Throwable cause) {
        super(message, cause);
    }

}
