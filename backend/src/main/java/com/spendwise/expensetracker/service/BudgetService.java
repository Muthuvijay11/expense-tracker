package com.spendwise.expensetracker.service;

import com.spendwise.expensetracker.dto.budget.BudgetRequest;
import com.spendwise.expensetracker.dto.budget.BudgetResponse;
import com.spendwise.expensetracker.dto.budget.BudgetStatusDto;
import com.spendwise.expensetracker.entity.Budget;
import com.spendwise.expensetracker.entity.User;
import com.spendwise.expensetracker.exception.BadRequestException;
import com.spendwise.expensetracker.repository.BudgetRepository;
import com.spendwise.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    public BudgetService(BudgetRepository budgetRepository,
                         TransactionRepository transactionRepository,
                         AuthService authService) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.authService = authService;
    }

    @Transactional
    public BudgetResponse setBudget(BudgetRequest request) {
        User user = authService.getAuthenticatedUser();
        String categoryId = request.getCategoryId().trim().toLowerCase();
        BigDecimal limit = request.getMonthlyLimit().setScale(2, RoundingMode.HALF_UP);

        Budget budget = budgetRepository.findByUserIdAndCategoryId(user.getId(), categoryId)
                .orElse(new Budget(user, categoryId, limit));

        budget.setMonthlyLimit(limit);
        Budget saved = budgetRepository.save(budget);
        return new BudgetResponse(saved);
    }

    @Transactional
    public List<BudgetResponse> setBatchBudgets(Map<String, BigDecimal> budgetMap) {
        User user = authService.getAuthenticatedUser();
        List<BudgetResponse> responses = new ArrayList<>();

        for (Map.Entry<String, BigDecimal> entry : budgetMap.entrySet()) {
            String categoryId = entry.getKey().trim().toLowerCase();
            BigDecimal limit = entry.getValue() != null ? entry.getValue().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

            Budget budget = budgetRepository.findByUserIdAndCategoryId(user.getId(), categoryId)
                    .orElse(new Budget(user, categoryId, limit));

            budget.setMonthlyLimit(limit);
            responses.add(new BudgetResponse(budgetRepository.save(budget)));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets() {
        User user = authService.getAuthenticatedUser();
        return budgetRepository.findAllByUserId(user.getId())
                .stream()
                .map(BudgetResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BudgetStatusDto> getBudgetStatuses() {
        User user = authService.getAuthenticatedUser();
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        List<Budget> userBudgets = budgetRepository.findAllByUserId(user.getId());
        List<Object[]> categoryExpenses = transactionRepository.sumExpenseByCategoryAndDateBetween(
                user.getId(), startOfMonth, endOfMonth
        );

        Map<String, BigDecimal> spentMap = new HashMap<>();
        for (Object[] row : categoryExpenses) {
            String cat = (String) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            spentMap.put(cat, sum);
        }

        List<BudgetStatusDto> statuses = new ArrayList<>();
        for (Budget budget : userBudgets) {
            BigDecimal spent = spentMap.getOrDefault(budget.getCategoryId(), BigDecimal.ZERO);
            statuses.add(new BudgetStatusDto(budget.getCategoryId(), budget.getMonthlyLimit(), spent));
        }

        return statuses;
    }

    @Transactional
    public void deleteBudget(String categoryId) {
        User user = authService.getAuthenticatedUser();
        budgetRepository.deleteByUserIdAndCategoryId(user.getId(), categoryId.trim().toLowerCase());
    }
}
