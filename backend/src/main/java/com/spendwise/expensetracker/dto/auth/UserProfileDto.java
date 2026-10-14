package com.spendwise.expensetracker.dto.auth;

import java.time.LocalDateTime;

public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String currency;
    private LocalDateTime createdAt;

    public UserProfileDto() {}

    public UserProfileDto(Long id, String username, String email, String fullName, String currency, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.currency = currency;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
