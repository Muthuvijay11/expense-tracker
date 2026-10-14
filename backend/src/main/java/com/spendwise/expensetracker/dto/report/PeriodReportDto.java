package com.spendwise.expensetracker.dto.report;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PeriodReportDto {
    private String periodType; // DAILY, WEEKLY, MONTHLY, YEARLY
    private List<String> labels = new ArrayList<>();
    private List<BigDecimal> incomeData = new ArrayList<>();
    private List<BigDecimal> expenseData = new ArrayList<>();

    public PeriodReportDto() {}

    public PeriodReportDto(String periodType) {
        this.periodType = periodType;
    }

    public String getPeriodType() { return periodType; }
    public void setPeriodType(String periodType) { this.periodType = periodType; }

    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }

    public List<BigDecimal> getIncomeData() { return incomeData; }
    public void setIncomeData(List<BigDecimal> incomeData) { this.incomeData = incomeData; }

    public List<BigDecimal> getExpenseData() { return expenseData; }
    public void setExpenseData(List<BigDecimal> expenseData) { this.expenseData = expenseData; }
}
