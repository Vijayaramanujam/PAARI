package com.paari.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paari.dto.LoginRequest;
import com.paari.dto.RegisterRequest;
import com.paari.entity.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testRegisterAndLoginFlow() throws Exception {
        // 1. Register a new Donor
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setName("Test Bakery");
        registerReq.setEmail("testdonor@paari.org");
        registerReq.setPhone("9876543210");
        registerReq.setPassword("donor123");
        registerReq.setRole(Role.DONOR);
        registerReq.setOrganizationName("Test Organisation");
        registerReq.setAddress("Test Street 1");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        // 2. Try to register same email again (should fail)
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email is already in use!"));

        // 3. Login with credentials
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("testdonor@paari.org");
        loginReq.setPassword("donor123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("testdonor@paari.org"))
                .andExpect(jsonPath("$.role").value("DONOR"));
    }
}
