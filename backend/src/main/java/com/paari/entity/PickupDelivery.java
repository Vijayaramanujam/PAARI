package com.paari.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "pickup_deliveries")
public class PickupDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "request_id", nullable = false)
    private FoodRequest foodRequest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "volunteer_id")
    private Volunteer volunteer;

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Column(name = "delivery_time")
    private LocalDateTime deliveryTime;

    @Column(name = "pickup_location")
    private String pickupLocation;

    @Column(name = "delivery_location")
    private String deliveryLocation;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.ASSIGNED;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "route_data", columnDefinition = "TEXT")
    private String routeData;

    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Column(name = "current_bearing")
    private Double currentBearing;

    @Column(name = "last_location_update")
    private LocalDateTime lastLocationUpdate;

    // Constructors
    public PickupDelivery() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public FoodRequest getFoodRequest() { return foodRequest; }
    public void setFoodRequest(FoodRequest foodRequest) { this.foodRequest = foodRequest; }
    public Volunteer getVolunteer() { return volunteer; }
    public void setVolunteer(Volunteer volunteer) { this.volunteer = volunteer; }
    public LocalDateTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalDateTime pickupTime) { this.pickupTime = pickupTime; }
    public LocalDateTime getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(LocalDateTime deliveryTime) { this.deliveryTime = deliveryTime; }
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    public String getDeliveryLocation() { return deliveryLocation; }
    public void setDeliveryLocation(String deliveryLocation) { this.deliveryLocation = deliveryLocation; }
    public DeliveryStatus getStatus() { return status; }
    public void setStatus(DeliveryStatus status) { this.status = status; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public String getRouteData() { return routeData; }
    public void setRouteData(String routeData) { this.routeData = routeData; }
    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }
    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }
    public Double getCurrentBearing() { return currentBearing; }
    public void setCurrentBearing(Double currentBearing) { this.currentBearing = currentBearing; }
    public LocalDateTime getLastLocationUpdate() { return lastLocationUpdate; }
    public void setLastLocationUpdate(LocalDateTime lastLocationUpdate) { this.lastLocationUpdate = lastLocationUpdate; }
}
