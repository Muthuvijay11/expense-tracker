package com.spendwise.expensetracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spendwise.expensetracker.dto.auth.RegisterRequest;
import com.spendwise.expensetracker.dto.budget.BudgetRequest;
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
public class BudgetAlertTest {

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

        RegisterRequest user = new RegisterRequest("budgetuser", "budget@example.com", "pass1234", "Budget User");
        MvcResult res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated())
                .andReturn();
        userToken = objectMapper.readTree(res.getResponse().getContentAsString())
                .path("data").path("token").asText();
    }

    @Test
    void testBudgetAlertThresholds() throws Exception {
        // Set food budget of $200.00
        BudgetRequest budget = new BudgetRequest("food", new BigDecimal("200.00"));
        mockMvc.perform(post("/api/budgets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(budget)))
                .andExpect(status().isOk());

        // Under 75% -> status should be NORMAL
        TransactionRequest tx1 = new TransactionRequest("EXPENSE", "food", "Snacks", new BigDecimal("50.00"), LocalDate.now(), "");
        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tx1)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/budgets")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status", is("NORMAL")))
                .andExpect(jsonPath("$.data[0].overBudget", is(false)));

        // Add expense bringing total to $160 (80%) -> status should be WARNING
        TransactionRequest tx2 = new TransactionRequest("EXPENSE", "food", "Dinner", new BigDecimal("110.00"), LocalDate.now(), "");
        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tx2)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/budgets")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status", is("WARNING")))
                .andExpect(jsonPath("$.data[0].overBudget", is(false)));

        // Add expense bringing total to $250 (125%) -> status should be EXCEEDED and overBudget = true
        TransactionRequest tx3 = new TransactionRequest("EXPENSE", "food", "Steak", new BigDecimal("90.00"), LocalDate.now(), "");
        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tx3)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/budgets")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status", is("EXCEEDED")))
                .andExpect(jsonPath("$.data[0].overBudget", is(true)))
                .andExpect(jsonPath("$.data[0].spent", is(250.00)));
    }
}
