package com.spendwise.expensetracker.dto.report;

import java.math.BigDecimal;

public class CategoryBreakdownDto {
    private String categoryId;
    private BigDecimal amount;
    private double percentage;

    public CategoryBreakdownDto() {}

    public CategoryBreakdownDto(String categoryId, BigDecimal amount, double percentage) {
        this.categoryId = categoryId;
        this.amount = amount;
        this.percentage = percentage;
    }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
}
