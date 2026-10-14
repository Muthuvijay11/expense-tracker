package com.spendwise.expensetracker.entity;

public enum TransactionType {
    INCOME,
    EXPENSE;

    public static TransactionType fromString(String val) {
        if (val == null) {
            throw new IllegalArgumentException("Transaction type cannot be null");
        }
        return TransactionType.valueOf(val.trim().toUpperCase());
    }
}
