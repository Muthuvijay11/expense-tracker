package com.spendwise.expensetracker.dto.transaction;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionRequest {

    @NotBlank(message = "Transaction type is required (INCOME or EXPENSE)")
    @Pattern(regexp = "(?i)^(INCOME|EXPENSE)$", message = "Type must be either INCOME or EXPENSE")
    private String type;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category ID must not exceed 50 characters")
    private String categoryId;

    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters")
    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than or equal to 0.01")
    @Digits(integer = 10, fraction = 2, message = "Amount can have up to 10 integer digits and 2 decimal places")
    private BigDecimal amount;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    public TransactionRequest() {}

    public TransactionRequest(String type, String categoryId, String description,
                              BigDecimal amount, LocalDate transactionDate, String notes) {
        this.type = type;
        this.categoryId = categoryId;
        this.description = description;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.notes = notes;
    }

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
}
