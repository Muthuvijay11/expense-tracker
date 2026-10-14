package com.spendwise.expensetracker.dto.transaction;

import com.spendwise.expensetracker.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TransactionResponse {
    private Long id;
    private String type;
    private String categoryId;
    private String description;
    private BigDecimal amount;
    private LocalDate transactionDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TransactionResponse() {}

    public TransactionResponse(Transaction tx) {
        this.id = tx.getId();
        this.type = tx.getType().name();
        this.categoryId = tx.getCategoryId();
        this.description = tx.getDescription();
        this.amount = tx.getAmount();
        this.transactionDate = tx.getTransactionDate();
        this.notes = tx.getNotes();
        this.createdAt = tx.getCreatedAt();
        this.updatedAt = tx.getUpdatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
