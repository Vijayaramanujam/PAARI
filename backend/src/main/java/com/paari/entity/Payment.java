package com.paari.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donation_id")
    private FoodDonation foodDonation;

    @NotNull
    @Column(nullable = false)
    private BigDecimal amount;

    @NotBlank
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @NotBlank
    @Column(name = "transaction_id", nullable = false)
    private String transactionId;

    @Column(name = "payment_time", updatable = false)
    private LocalDateTime paymentTime;

    @NotBlank
    @Column(nullable = false)
    private String status = "SUCCESS";

    @PrePersist
    protected void onCreate() {
        paymentTime = LocalDateTime.now();
    }

    // Default Constructor
    public Payment() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public FoodDonation getFoodDonation() { return foodDonation; }
    public void setFoodDonation(FoodDonation foodDonation) { this.foodDonation = foodDonation; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public LocalDateTime getPaymentTime() { return paymentTime; }
    public void setPaymentTime(LocalDateTime paymentTime) { this.paymentTime = paymentTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
