package com.spendwise.expensetracker.dto.common;

import java.time.LocalDateTime;
import java.util.Map;

public class ErrorResponse {
    private boolean success = false;
    private String error;
    private int status;
    private LocalDateTime timestamp = LocalDateTime.now();
    private Map<String, String> fieldErrors;

    public ErrorResponse() {}

    public ErrorResponse(String error, int status) {
        this.error = error;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String error, int status, Map<String, String> fieldErrors) {
        this.error = error;
        this.status = status;
        this.fieldErrors = fieldErrors;
        this.timestamp = LocalDateTime.now();
    }

    public boolean isSuccess() { return success; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public Map<String, String> getFieldErrors() { return fieldErrors; }
    public void setFieldErrors(Map<String, String> fieldErrors) { this.fieldErrors = fieldErrors; }
}
