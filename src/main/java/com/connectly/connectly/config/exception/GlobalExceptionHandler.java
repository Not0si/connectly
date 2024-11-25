package com.connectly.connectly.config.exception;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @ExceptionHandler({BaseApiException.class, ResourceNotFoundException.class, UnauthorizedException.class})
    public ResponseEntity<Object> handleException(RuntimeException exception) {
        HttpStatus status = determineHttpStatus(exception);
        return responseEntityConstructer(exception, status);
    }

    private HttpStatus determineHttpStatus(RuntimeException exception) {
        if (exception instanceof ResourceNotFoundException) return HttpStatus.NOT_FOUND;
        if (exception instanceof UnauthorizedException) return HttpStatus.UNAUTHORIZED;
        return HttpStatus.BAD_REQUEST;
    }

    private ResponseEntity<Object> responseEntityConstructer(RuntimeException exception, HttpStatus status) {
        String message = exception.getCause() != null
                ? exception.getCause().getMessage()
                : exception.getMessage();

        if ("dev".equalsIgnoreCase(activeProfile)) {
            DevErrorResponse responseError = new DevErrorResponse(message, status, exception);
            return new ResponseEntity<>(responseError, status);
        }

        ErrorResponse miniResponseError = new ErrorResponse(message, status);
        return new ResponseEntity<>(miniResponseError, status);
    }
}

