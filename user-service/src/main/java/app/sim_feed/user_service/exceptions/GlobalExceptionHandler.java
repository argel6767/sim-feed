package app.sim_feed.user_service.exceptions;

import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import io.github.resilience4j.ratelimiter.RequestNotPermitted;

import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.NoSuchElementException;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
@Log
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler{

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<FailedRequestDto> handleNoSuchElementException(NoSuchElementException nsee, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        return ResponseEntity.status(404).body(new FailedRequestDto(nsee.getMessage(), 404, requestUri));
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<FailedRequestDto> handleIllegalArgumentException(IllegalArgumentException iae, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        return ResponseEntity.status(400).body(new FailedRequestDto(iae.getMessage(), 400, requestUri));
    }
    
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<FailedRequestDto> handleResponseStatusException(ResponseStatusException rse, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        return ResponseEntity.status(rse.getStatusCode()).body(new FailedRequestDto(rse.getReason(), rse.getStatusCode().value(), requestUri));
    }
    
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<FailedRequestDto> handleIllegalStateException(IllegalStateException ise, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        return ResponseEntity.status(400).body(new FailedRequestDto(ise.getMessage(), 400, requestUri));
    }
    
    @ExceptionHandler(RequestNotPermitted.class)
    public ResponseEntity<FailedRequestDto> handleRequestNotPermitted(RequestNotPermitted rnp, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        return ResponseEntity.status(429).body(new FailedRequestDto("Rate limit exceeded. Please try again later.", 429, requestUri));
    }
     
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<FailedRequestDto> handleConstraintViolationException(ConstraintViolationException cve, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        return ResponseEntity.status(400).body(new FailedRequestDto(cve.getMessage(), 400, requestUri));
    }
    
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<FailedRequestDto> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException matme, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        return ResponseEntity.status(400).body(new FailedRequestDto(matme.getMessage(), 400, requestUri));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<FailedRequestDto> handleException(Exception e, HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        log.warning("Request: " + requestUri + " failed due to internal error: " + e.getMessage());
        return ResponseEntity.status(500).body(new FailedRequestDto(e.getMessage(), 500, requestUri));
    }
    
}