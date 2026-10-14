package com.spendwise.expensetracker.service;

import com.spendwise.expensetracker.entity.Transaction;
import com.spendwise.expensetracker.entity.TransactionType;
import com.spendwise.expensetracker.entity.User;
import com.spendwise.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
public class CsvExportService {

    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    public CsvExportService(TransactionRepository transactionRepository, AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public byte[] exportTransactionsToCsv(String typeStr, String categoryId, LocalDate startDate, LocalDate endDate) {
        User user = authService.getAuthenticatedUser();

        TransactionType type = null;
        if (typeStr != null && !typeStr.trim().isEmpty() && !typeStr.equalsIgnoreCase("ALL")) {
            type = TransactionType.fromString(typeStr);
        }

        String cat = (categoryId != null && !categoryId.trim().isEmpty() && !categoryId.equalsIgnoreCase("ALL"))
                ? categoryId.trim().toLowerCase() : null;

        List<Transaction> transactions = transactionRepository.findTransactionsForExport(
                user.getId(), type, cat, startDate, endDate
        );

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            // Write UTF-8 BOM so Excel opens it with proper character encoding
            out.write(0xEF);
            out.write(0xBB);
            out.write(0xBF);

            // CSV Header
            writer.println("Date,Type,Category,Description,Amount,Currency,Notes");

            for (Transaction tx : transactions) {
                writer.print(escapeSpecialCharacters(tx.getTransactionDate().toString()));
                writer.print(",");
                writer.print(escapeSpecialCharacters(tx.getType().name()));
                writer.print(",");
                writer.print(escapeSpecialCharacters(tx.getCategoryId()));
                writer.print(",");
                writer.print(escapeSpecialCharacters(tx.getDescription()));
                writer.print(",");
                writer.print(tx.getAmount().toPlainString());
                writer.print(",");
                writer.print(escapeSpecialCharacters(user.getCurrency()));
                writer.print(",");
                writer.print(escapeSpecialCharacters(tx.getNotes() != null ? tx.getNotes() : ""));
                writer.println();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV export", e);
        }

        return out.toByteArray();
    }

    private String escapeSpecialCharacters(String data) {
        if (data == null) {
            return "\"\"";
        }
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }
}
