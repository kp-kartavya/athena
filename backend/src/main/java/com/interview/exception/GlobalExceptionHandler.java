package com.interview.exception;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(Map.of("success", false, "message", exception.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
		String message = exception.getBindingResult().getFieldErrors().stream().findFirst()
				.map(error -> error.getDefaultMessage()).orElse("Invalid request.");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", message));
	}

	@ExceptionHandler(HandlerMethodValidationException.class)
	public ResponseEntity<Map<String, Object>> handleMethodValidation(HandlerMethodValidationException exception) {
		String message = exception.getAllErrors().stream().findFirst().map(error -> error.getDefaultMessage())
				.orElse("Invalid request.");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", message));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleException(Exception exception) {
		log.error("Unhandled exception while processing request.", exception);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("success", false, "message", "An unexpected error occurred."));
	}
}