package com.spendwise.expensetracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spendwise.expensetracker.dto.auth.RegisterRequest;
import com.spendwise.expensetracker.dto.transaction.TransactionRequest;
import com.spendwise.expensetracker.repository.BudgetRepository;
import com.spendwise.expensetracker.repository.TransactionRepository;
import com.spendwise.expensetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        budgetRepository.deleteAll();
        transactionRepository.deleteAll();
        userRepository.deleteAll();

        RegisterRequest user = new RegisterRequest("reportuser", "report@example.com", "pass1234", "Report User");
        MvcResult res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated())
                .andReturn();
        userToken = objectMapper.readTree(res.getResponse().getContentAsString())
                .path("data").path("token").asText();

        // Add 1 income and 1 expense
        TransactionRequest inc = new TransactionRequest("INCOME", "salary", "Salary", new BigDecimal("5000.00"), LocalDate.now(), "");
        TransactionRequest exp = new TransactionRequest("EXPENSE", "food", "Lunch", new BigDecimal("50.00"), LocalDate.now(), "");

        mockMvc.perform(post("/api/transactions")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inc)));

        mockMvc.perform(post("/api/transactions")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(exp)));
    }

    @Test
    void testDashboardSummary() throws Exception {
        mockMvc.perform(get("/api/reports/dashboard")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.thisMonthIncome", is(5000.00)))
                .andExpect(jsonPath("$.data.thisMonthExpense", is(50.00)))
                .andExpect(jsonPath("$.data.netBalance", is(4950.00)))
                .andExpect(jsonPath("$.data.savingsRate", is(99.0)))
                .andExpect(jsonPath("$.data.transactionCount", is(2)));
    }

    @Test
    void testPeriodReport() throws Exception {
        mockMvc.perform(get("/api/reports/period?type=WEEKLY")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.periodType", is("WEEKLY")))
                .andExpect(jsonPath("$.data.labels", hasSize(7)));
    }

    @Test
    void testCategoryBreakdown() throws Exception {
        mockMvc.perform(get("/api/reports/category-breakdown")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].categoryId", is("food")))
                .andExpect(jsonPath("$.data[0].amount", is(50.00)))
                .andExpect(jsonPath("$.data[0].percentage", is(100.0)));
    }

    @Test
    void testCsvExport() throws Exception {
        mockMvc.perform(get("/api/transactions/export/csv")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(header().string("Content-Disposition", containsString("spendwise-transactions-")))
                .andExpect(content().string(containsString("Date,Type,Category,Description,Amount,Currency,Notes")))
                .andExpect(content().string(containsString("INCOME,salary,Salary,5000.00,USD")))
                .andExpect(content().string(containsString("EXPENSE,food,Lunch,50.00,USD")));
    }
}
