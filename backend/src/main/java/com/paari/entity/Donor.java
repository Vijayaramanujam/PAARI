package com.paari.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "donors")
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotBlank
    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @NotBlank
    @Column(nullable = false)
    private String address;

    @Column(name = "food_type_offered")
    private String foodTypeOffered;

    private Float rating = 0.0f;

    private Double latitude;
    private Double longitude;

    // Constructors
    public Donor() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getFoodTypeOffered() { return foodTypeOffered; }
    public void setFoodTypeOffered(String foodTypeOffered) { this.foodTypeOffered = foodTypeOffered; }
    public Float getRating() { return rating; }
    public void setRating(Float rating) { this.rating = rating; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
