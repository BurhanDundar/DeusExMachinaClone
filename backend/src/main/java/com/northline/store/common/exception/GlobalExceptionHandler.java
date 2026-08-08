package com.northline.store.common.exception;

import com.northline.store.common.response.ApiError;
import java.time.Instant;
import java.util.LinkedHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ApiException.class)
  ResponseEntity<ApiError> handleApi(ApiException exception) {
    return ResponseEntity.status(exception.getStatus()).body(
      ApiError.of(exception.getCode(), exception.getMessage())
    );
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
    var fields = new LinkedHashMap<String, String>();
    exception
      .getBindingResult()
      .getFieldErrors()
      .forEach(error -> fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
    return ResponseEntity.badRequest().body(
      new ApiError("VALIDATION_ERROR", "One or more fields are invalid", fields, Instant.now())
    );
  }

  @ExceptionHandler(AuthenticationException.class)
  ResponseEntity<ApiError> handleAuthentication(AuthenticationException exception) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
      ApiError.of("INVALID_CREDENTIALS", "Email or password is incorrect")
    );
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiError> handleUnexpected(Exception exception) {
    log.error("Unhandled API error", exception);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
      ApiError.of("INTERNAL_ERROR", "An unexpected error occurred")
    );
  }
}
