package com.spendwise.expensetracker.dto.budget;

import com.spendwise.expensetracker.entity.Budget;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BudgetResponse {
    private Long id;
    private String categoryId;
    private BigDecimal monthlyLimit;
    private LocalDateTime updatedAt;

    public BudgetResponse() {}

    public BudgetResponse(Budget b) {
        this.id = b.getId();
        this.categoryId = b.getCategoryId();
        this.monthlyLimit = b.getMonthlyLimit();
        this.updatedAt = b.getUpdatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public BigDecimal getMonthlyLimit() { return monthlyLimit; }
    public void setMonthlyLimit(BigDecimal monthlyLimit) { this.monthlyLimit = monthlyLimit; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
