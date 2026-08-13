package com.paari.dto;

import com.paari.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RegisterRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    private String phone;

    @NotBlank
    private String password;

    @NotNull
    private Role role;

    // Optional Donor/Receiver fields
    private String organizationName;
    private String address;
    private String foodTypeOffered;
    private String areaServed;

    // Optional Volunteer fields
    private String vehicleType;
    private String vehicleNumber;

    // GPS coordinates
    private Double latitude;
    private Double longitude;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getFoodTypeOffered() { return foodTypeOffered; }
    public void setFoodTypeOffered(String foodTypeOffered) { this.foodTypeOffered = foodTypeOffered; }
    public String getAreaServed() { return areaServed; }
    public void setAreaServed(String areaServed) { this.areaServed = areaServed; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
