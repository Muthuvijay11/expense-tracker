package com.spendwise.expensetracker.dto.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BudgetRequest {

    @NotBlank(message = "Category ID is required")
    private String categoryId;

    @NotNull(message = "Monthly limit is required")
    @DecimalMin(value = "0.00", message = "Budget limit must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Monthly limit can have up to 10 integer digits and 2 decimals")
    private BigDecimal monthlyLimit;

    public BudgetRequest() {}

    public BudgetRequest(String categoryId, BigDecimal monthlyLimit) {
        this.categoryId = categoryId;
        this.monthlyLimit = monthlyLimit;
    }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public BigDecimal getMonthlyLimit() { return monthlyLimit; }
    public void setMonthlyLimit(BigDecimal monthlyLimit) { this.monthlyLimit = monthlyLimit; }
}
