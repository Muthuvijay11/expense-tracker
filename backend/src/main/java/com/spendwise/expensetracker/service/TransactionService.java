package com.spendwise.expensetracker.service;

import com.spendwise.expensetracker.dto.common.PageResponse;
import com.spendwise.expensetracker.dto.transaction.TransactionRequest;
import com.spendwise.expensetracker.dto.transaction.TransactionResponse;
import com.spendwise.expensetracker.entity.Transaction;
import com.spendwise.expensetracker.entity.TransactionType;
import com.spendwise.expensetracker.entity.User;
import com.spendwise.expensetracker.exception.BadRequestException;
import com.spendwise.expensetracker.exception.ResourceNotFoundException;
import com.spendwise.expensetracker.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    public TransactionService(TransactionRepository transactionRepository, AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.authService = authService;
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = authService.getAuthenticatedUser();
        validateAmount(request.getAmount());

        TransactionType type = TransactionType.fromString(request.getType());
        BigDecimal normalizedAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);

        Transaction transaction = new Transaction(
                user,
                type,
                request.getCategoryId().trim().toLowerCase(),
                request.getDescription().trim(),
                normalizedAmount,
                request.getTransactionDate(),
                request.getNotes() != null ? request.getNotes().trim() : null
        );

        Transaction saved = transactionRepository.save(transaction);
        return new TransactionResponse(saved);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        User user = authService.getAuthenticatedUser();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return new TransactionResponse(transaction);
    }

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getTransactions(
            String typeStr,
            String categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            int page,
            int size) {

        User user = authService.getAuthenticatedUser();

        TransactionType type = null;
        if (typeStr != null && !typeStr.trim().isEmpty() && !typeStr.equalsIgnoreCase("ALL")) {
            type = TransactionType.fromString(typeStr);
        }

        String searchKeyword = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cat = (categoryId != null && !categoryId.trim().isEmpty() && !categoryId.equalsIgnoreCase("ALL"))
                ? categoryId.trim().toLowerCase() : null;

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(size, 100), Sort.by(Sort.Direction.DESC, "transactionDate"));
        Page<Transaction> pageResult = transactionRepository.findFilteredTransactions(
                user.getId(), type, cat, startDate, endDate, searchKeyword, pageable
        );

        Page<TransactionResponse> dtoPage = pageResult.map(TransactionResponse::new);
        return new PageResponse<>(dtoPage);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        User user = authService.getAuthenticatedUser();
        return transactionRepository.findAllByUserIdOrderByTransactionDateDescCreatedAtDesc(user.getId())
                .stream()
                .map(TransactionResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        User user = authService.getAuthenticatedUser();
        validateAmount(request.getAmount());

        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        transaction.setType(TransactionType.fromString(request.getType()));
        transaction.setCategoryId(request.getCategoryId().trim().toLowerCase());
        transaction.setDescription(request.getDescription().trim());
        transaction.setAmount(request.getAmount().setScale(2, RoundingMode.HALF_UP));
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Transaction updated = transactionRepository.save(transaction);
        return new TransactionResponse(updated);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        User user = authService.getAuthenticatedUser();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        transactionRepository.delete(transaction);
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null) {
            throw new BadRequestException("Amount is required");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be strictly greater than zero");
        }
    }
}
