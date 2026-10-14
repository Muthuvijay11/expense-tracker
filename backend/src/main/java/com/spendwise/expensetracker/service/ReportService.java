package com.spendwise.expensetracker.service;

import com.spendwise.expensetracker.dto.budget.BudgetStatusDto;
import com.spendwise.expensetracker.dto.report.CategoryBreakdownDto;
import com.spendwise.expensetracker.dto.report.DashboardSummaryDto;
import com.spendwise.expensetracker.dto.report.PeriodReportDto;
import com.spendwise.expensetracker.entity.Transaction;
import com.spendwise.expensetracker.entity.TransactionType;
import com.spendwise.expensetracker.entity.User;
import com.spendwise.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final BudgetService budgetService;
    private final AuthService authService;

    public ReportService(TransactionRepository transactionRepository,
                         BudgetService budgetService,
                         AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.budgetService = budgetService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        User user = authService.getAuthenticatedUser();
        LocalDate now = LocalDate.now();

        LocalDate thisMonthStart = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate thisMonthEnd = now.with(TemporalAdjusters.lastDayOfMonth());

        YearMonth lastYearMonth = YearMonth.from(now).minusMonths(1);
        LocalDate lastMonthStart = lastYearMonth.atDay(1);
        LocalDate lastMonthEnd = lastYearMonth.atEndOfMonth();

        BigDecimal thisInc = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), TransactionType.INCOME, thisMonthStart, thisMonthEnd);
        BigDecimal thisExp = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), TransactionType.EXPENSE, thisMonthStart, thisMonthEnd);

        BigDecimal lastInc = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), TransactionType.INCOME, lastMonthStart, lastMonthEnd);
        BigDecimal lastExp = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), TransactionType.EXPENSE, lastMonthStart, lastMonthEnd);

        BigDecimal balance = thisInc.subtract(thisExp);

        double savingsRate = 0.0;
        if (thisInc.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = balance.divide(thisInc, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        Double incChangePct = null;
        if (lastInc.compareTo(BigDecimal.ZERO) > 0) {
            incChangePct = thisInc.subtract(lastInc)
                    .divide(lastInc, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        Double expChangePct = null;
        if (lastExp.compareTo(BigDecimal.ZERO) > 0) {
            expChangePct = thisExp.subtract(lastExp)
                    .divide(lastExp, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        List<Transaction> thisMonthTxs = transactionRepository.findByUserIdAndTransactionDateBetween(
                user.getId(), thisMonthStart, thisMonthEnd);

        List<BudgetStatusDto> budgetStatuses = budgetService.getBudgetStatuses();
        long overBudgetCount = budgetStatuses.stream().filter(BudgetStatusDto::isOverBudget).count();

        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setThisMonthIncome(thisInc);
        summary.setThisMonthExpense(thisExp);
        summary.setNetBalance(balance);
        summary.setSavingsRate(savingsRate);
        summary.setLastMonthIncome(lastInc);
        summary.setLastMonthExpense(lastExp);
        summary.setIncomeChangePercentage(incChangePct);
        summary.setExpenseChangePercentage(expChangePct);
        summary.setTransactionCount(thisMonthTxs.size());
        summary.setOverBudgetCount((int) overBudgetCount);

        return summary;
    }

    @Transactional(readOnly = true)
    public PeriodReportDto getPeriodReport(String periodType) {
        User user = authService.getAuthenticatedUser();
        String type = (periodType != null) ? periodType.toUpperCase() : "WEEKLY";
        LocalDate now = LocalDate.now();

        PeriodReportDto report = new PeriodReportDto(type);

        if ("WEEKLY".equals(type)) {
            // Monday to Sunday of the current week
            LocalDate monday = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE");

            for (int i = 0; i < 7; i++) {
                LocalDate day = monday.plusDays(i);
                report.getLabels().add(day.format(formatter));

                BigDecimal inc = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                        user.getId(), TransactionType.INCOME, day, day);
                BigDecimal exp = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                        user.getId(), TransactionType.EXPENSE, day, day);

                report.getIncomeData().add(inc);
                report.getExpenseData().add(exp);
            }
        } else if ("MONTHLY".equals(type)) {
            // Last 6 months
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
            for (int i = 5; i >= 0; i--) {
                YearMonth ym = YearMonth.from(now).minusMonths(i);
                LocalDate start = ym.atDay(1);
                LocalDate end = ym.atEndOfMonth();

                report.getLabels().add(start.format(formatter));
                BigDecimal inc = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                        user.getId(), TransactionType.INCOME, start, end);
                BigDecimal exp = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                        user.getId(), TransactionType.EXPENSE, start, end);

                report.getIncomeData().add(inc);
                report.getExpenseData().add(exp);
            }
        } else if ("YEARLY".equals(type)) {
            // All 12 months of current year
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
            int year = now.getYear();
            for (int m = 1; m <= 12; m++) {
                YearMonth ym = YearMonth.of(year, m);
                LocalDate start = ym.atDay(1);
                LocalDate end = ym.atEndOfMonth();

                report.getLabels().add(start.format(formatter));
                BigDecimal inc = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                        user.getId(), TransactionType.INCOME, start, end);
                BigDecimal exp = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                        user.getId(), TransactionType.EXPENSE, start, end);

                report.getIncomeData().add(inc);
                report.getExpenseData().add(exp);
            }
        } else if ("DAILY".equals(type)) {
            // Last 30 days
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd");
            for (int i = 29; i >= 0; i--) {
                LocalDate day = now.minusDays(i);
                report.getLabels().add(day.format(formatter));

                BigDecimal inc = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                        user.getId(), TransactionType.INCOME, day, day);
                BigDecimal exp = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                        user.getId(), TransactionType.EXPENSE, day, day);

                report.getIncomeData().add(inc);
                report.getExpenseData().add(exp);
            }
        }

        return report;
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownDto> getCategoryBreakdown() {
        User user = authService.getAuthenticatedUser();
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        List<Object[]> rows = transactionRepository.sumExpenseByCategoryAndDateBetween(
                user.getId(), startOfMonth, endOfMonth);

        BigDecimal totalExpense = BigDecimal.ZERO;
        for (Object[] r : rows) {
            BigDecimal amt = (BigDecimal) r[1];
            if (amt != null) totalExpense = totalExpense.add(amt);
        }

        List<CategoryBreakdownDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            String cat = (String) r[0];
            BigDecimal amt = (BigDecimal) r[1];
            double pct = 0.0;
            if (totalExpense.compareTo(BigDecimal.ZERO) > 0 && amt != null) {
                pct = amt.divide(totalExpense, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP)
                        .doubleValue();
            }
            list.add(new CategoryBreakdownDto(cat, amt, pct));
        }

        // Sort by amount descending
        list.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
        return list;
    }
}
