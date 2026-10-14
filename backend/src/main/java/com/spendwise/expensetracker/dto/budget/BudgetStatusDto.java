package com.spendwise.expensetracker.dto.budget;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class BudgetStatusDto {
    private String categoryId;
    private BigDecimal monthlyLimit;
    private BigDecimal spent;
    private BigDecimal remaining;
    private double percentageUsed;
    private String status; // NORMAL, WARNING, EXCEEDED
    private boolean overBudget;

    public BudgetStatusDto() {}

    public BudgetStatusDto(String categoryId, BigDecimal monthlyLimit, BigDecimal spent) {
        this.categoryId = categoryId;
        this.monthlyLimit = monthlyLimit != null ? monthlyLimit : BigDecimal.ZERO;
        this.spent = spent != null ? spent : BigDecimal.ZERO;
        this.remaining = this.monthlyLimit.subtract(this.spent);
        this.overBudget = this.remaining.compareTo(BigDecimal.ZERO) < 0;

        if (this.monthlyLimit.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ratio = this.spent.divide(this.monthlyLimit, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            this.percentageUsed = ratio.setScale(1, RoundingMode.HALF_UP).doubleValue();
        } else {
            this.percentageUsed = this.spent.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        if (this.percentageUsed >= 100.0) {
            this.status = "EXCEEDED";
        } else if (this.percentageUsed >= 75.0) {
            this.status = "WARNING";
        } else {
            this.status = "NORMAL";
        }
    }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public BigDecimal getMonthlyLimit() { return monthlyLimit; }
    public void setMonthlyLimit(BigDecimal monthlyLimit) { this.monthlyLimit = monthlyLimit; }

    public BigDecimal getSpent() { return spent; }
    public void setSpent(BigDecimal spent) { this.spent = spent; }

    public BigDecimal getRemaining() { return remaining; }
    public void setRemaining(BigDecimal remaining) { this.remaining = remaining; }

    public double getPercentageUsed() { return percentageUsed; }
    public void setPercentageUsed(double percentageUsed) { this.percentageUsed = percentageUsed; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isOverBudget() { return overBudget; }
    public void setOverBudget(boolean overBudget) { this.overBudget = overBudget; }
}
