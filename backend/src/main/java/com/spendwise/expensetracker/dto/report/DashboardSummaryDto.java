package com.spendwise.expensetracker.dto.report;

import java.math.BigDecimal;

public class DashboardSummaryDto {
    private BigDecimal thisMonthIncome;
    private BigDecimal thisMonthExpense;
    private BigDecimal netBalance;
    private double savingsRate;
    private BigDecimal lastMonthIncome;
    private BigDecimal lastMonthExpense;
    private Double incomeChangePercentage;
    private Double expenseChangePercentage;
    private long transactionCount;
    private int overBudgetCount;

    public DashboardSummaryDto() {}

    public BigDecimal getThisMonthIncome() { return thisMonthIncome; }
    public void setThisMonthIncome(BigDecimal thisMonthIncome) { this.thisMonthIncome = thisMonthIncome; }

    public BigDecimal getThisMonthExpense() { return thisMonthExpense; }
    public void setThisMonthExpense(BigDecimal thisMonthExpense) { this.thisMonthExpense = thisMonthExpense; }

    public BigDecimal getNetBalance() { return netBalance; }
    public void setNetBalance(BigDecimal netBalance) { this.netBalance = netBalance; }

    public double getSavingsRate() { return savingsRate; }
    public void setSavingsRate(double savingsRate) { this.savingsRate = savingsRate; }

    public BigDecimal getLastMonthIncome() { return lastMonthIncome; }
    public void setLastMonthIncome(BigDecimal lastMonthIncome) { this.lastMonthIncome = lastMonthIncome; }

    public BigDecimal getLastMonthExpense() { return lastMonthExpense; }
    public void setLastMonthExpense(BigDecimal lastMonthExpense) { this.lastMonthExpense = lastMonthExpense; }

    public Double getIncomeChangePercentage() { return incomeChangePercentage; }
    public void setIncomeChangePercentage(Double incomeChangePercentage) { this.incomeChangePercentage = incomeChangePercentage; }

    public Double getExpenseChangePercentage() { return expenseChangePercentage; }
    public void setExpenseChangePercentage(Double expenseChangePercentage) { this.expenseChangePercentage = expenseChangePercentage; }

    public long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(long transactionCount) { this.transactionCount = transactionCount; }

    public int getOverBudgetCount() { return overBudgetCount; }
    public void setOverBudgetCount(int overBudgetCount) { this.overBudgetCount = overBudgetCount; }
}
