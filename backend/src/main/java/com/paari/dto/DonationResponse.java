package com.paari.dto;

import com.paari.entity.DonationStatus;
import com.paari.entity.FoodDonation;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DonationResponse {
    private Long id;
    private Long donorId;
    private String donorName;
    private String foodType;
    private BigDecimal quantity;
    private String description;
    private String pickupAddress;
    private LocalDateTime pickupTime;
    private LocalDateTime expiryTime;
    private DonationStatus status;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;

    public DonationResponse(FoodDonation donation) {
        this.id = donation.getId();
        this.donorId = donation.getDonor().getId();
        this.donorName = donation.getDonor().getOrganizationName();
        this.foodType = donation.getFoodType();
        this.quantity = donation.getQuantity();
        this.description = donation.getDescription();
        this.pickupAddress = donation.getPickupAddress();
        this.pickupTime = donation.getPickupTime();
        this.expiryTime = donation.getExpiryTime();
        this.status = donation.getStatus();
        this.latitude = donation.getLatitude();
        this.longitude = donation.getLongitude();
        this.createdAt = donation.getCreatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDonorId() { return donorId; }
    public void setDonorId(Long donorId) { this.donorId = donorId; }
    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }
    public String getFoodType() { return foodType; }
    public void setFoodType(String foodType) { this.foodType = foodType; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
    public LocalDateTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalDateTime pickupTime) { this.pickupTime = pickupTime; }
    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }
    public DonationStatus getStatus() { return status; }
    public void setStatus(DonationStatus status) { this.status = status; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
