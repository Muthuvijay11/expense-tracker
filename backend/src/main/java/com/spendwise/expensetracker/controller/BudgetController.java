package com.spendwise.expensetracker.controller;

import com.spendwise.expensetracker.dto.budget.BudgetRequest;
import com.spendwise.expensetracker.dto.budget.BudgetResponse;
import com.spendwise.expensetracker.dto.budget.BudgetStatusDto;
import com.spendwise.expensetracker.dto.common.ApiResponse;
import com.spendwise.expensetracker.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetStatusDto>>> getBudgetStatuses() {
        List<BudgetStatusDto> statuses = budgetService.getBudgetStatuses();
        return ResponseEntity.ok(ApiResponse.ok(statuses));
    }

    @GetMapping("/raw")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getRawBudgets() {
        List<BudgetResponse> budgets = budgetService.getBudgets();
        return ResponseEntity.ok(ApiResponse.ok(budgets));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> setBudget(@Valid @RequestBody BudgetRequest request) {
        BudgetResponse response = budgetService.setBudget(request);
        return ResponseEntity.ok(ApiResponse.ok("Budget saved successfully", response));
    }

    @PutMapping("/batch")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> setBatchBudgets(
            @RequestBody Map<String, BigDecimal> budgetMap) {
        List<BudgetResponse> responses = budgetService.setBatchBudgets(budgetMap);
        return ResponseEntity.ok(ApiResponse.ok("Budgets updated successfully", responses));
    }

    @DeleteMapping("/{category}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(@PathVariable String category) {
        budgetService.deleteBudget(category);
        return ResponseEntity.ok(ApiResponse.ok("Budget deleted successfully", null));
    }
}
