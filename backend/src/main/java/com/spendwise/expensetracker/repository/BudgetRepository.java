package com.spendwise.expensetracker.repository;

import com.spendwise.expensetracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findAllByUserId(Long userId);
    Optional<Budget> findByUserIdAndCategoryId(Long userId, String categoryId);
    void deleteByUserIdAndCategoryId(Long userId, String categoryId);
}
