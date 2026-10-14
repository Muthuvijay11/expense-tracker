package com.spendwise.expensetracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spendwise.expensetracker.dto.auth.AuthResponse;
import com.spendwise.expensetracker.dto.auth.RegisterRequest;
import com.spendwise.expensetracker.dto.common.ApiResponse;
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
public class TransactionSecurityTest {

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

    private String userAToken;
    private String userBToken;

    @BeforeEach
    void setUp() throws Exception {
        budgetRepository.deleteAll();
        transactionRepository.deleteAll();
        userRepository.deleteAll();

        // Register User A
        RegisterRequest userA = new RegisterRequest("usera", "usera@example.com", "pass1234", "User A");
        MvcResult resA = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userA)))
                .andExpect(status().isCreated())
                .andReturn();
        String jsonA = resA.getResponse().getContentAsString();
        userAToken = objectMapper.readTree(jsonA).path("data").path("token").asText();

        // Register User B
        RegisterRequest userB = new RegisterRequest("userb", "userb@example.com", "pass1234", "User B");
        MvcResult resB = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userB)))
                .andExpect(status().isCreated())
                .andReturn();
        String jsonB = resB.getResponse().getContentAsString();
        userBToken = objectMapper.readTree(jsonB).path("data").path("token").asText();
    }

    @Test
    void testUserDataIsolation() throws Exception {
        // User A creates a transaction
        TransactionRequest txA = new TransactionRequest(
                "EXPENSE", "food", "Groceries", new BigDecimal("125.50"), LocalDate.now(), "Weekly veggies"
        );

        MvcResult createResult = mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txA)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.amount", is(125.50)))
                .andReturn();

        long txId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // User A can access it
        mockMvc.perform(get("/api/transactions/" + txId)
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.description", is("Groceries")));

        // User B CANNOT access User A's transaction (must return 404 Not Found to prevent ID discovery)
        mockMvc.perform(get("/api/transactions/" + txId)
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isNotFound());

        // User B cannot delete User A's transaction
        mockMvc.perform(delete("/api/transactions/" + txId)
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isNotFound());

        // User B's transaction list should be empty
        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));

        // User A's transaction list should have 1
        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)));
    }

    @Test
    void testNegativeOrZeroAmountRejected() throws Exception {
        TransactionRequest badTx = new TransactionRequest(
                "EXPENSE", "food", "Bad", new BigDecimal("-10.00"), LocalDate.now(), ""
        );

        mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badTx)))
                .andExpect(status().isBadRequest());
    }
}
