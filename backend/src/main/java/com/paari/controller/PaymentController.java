package com.paari.controller;

import com.paari.entity.FoodDonation;
import com.paari.entity.Payment;
import com.paari.repository.FoodDonationRepository;
import com.paari.repository.PaymentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private FoodDonationRepository donationRepository;

    @PostMapping
    public ResponseEntity<?> makePayment(
            @RequestParam(required = false) Long donationId,
            @RequestParam BigDecimal amount,
            @RequestParam String paymentMethod) {

        FoodDonation donation = null;
        if (donationId != null) {
            donation = donationRepository.findById(donationId).orElse(null);
        }

        // Mock payment gateway success
        Payment payment = new Payment();
        payment.setFoodDonation(donation);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase());
        payment.setStatus("SUCCESS");

        payment = paymentRepository.save(payment);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/donation/{donationId}")
    public ResponseEntity<?> getPaymentDetailsByDonation(@PathVariable Long donationId) {
        return ResponseEntity.ok(paymentRepository.findByFoodDonationId(donationId));
    }
}
