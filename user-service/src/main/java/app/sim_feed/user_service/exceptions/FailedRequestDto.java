package app.sim_feed.user_service.exceptions;

public record FailedRequestDto(String message, int statusCode, String requestUri) {}