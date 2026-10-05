package com.paari.controller;

import com.paari.entity.*;
import com.paari.repository.*;
import com.paari.service.LogisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    @Autowired
    private LogisticsService logisticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PickupDeliveryRepository deliveryRepository;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<List<PickupDelivery>> getAvailableDeliveries() {
        // Return tasks that have NO assigned volunteer and status is ASSIGNED
        return ResponseEntity.ok(deliveryRepository.findUnassignedTasks());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<List<PickupDelivery>> getMyDeliveries() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(deliveryRepository.findByVolunteerUserId(user.getId()));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> acceptDeliveryTask(@RequestParam Long deliveryId) {
        User user = getAuthenticatedUser();
        try {
            PickupDelivery delivery = logisticsService.assignVolunteer(deliveryId, user.getId());
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam DeliveryStatus status) {
        User user = getAuthenticatedUser();
        try {
            PickupDelivery delivery = logisticsService.updateDeliveryStatus(id, user.getId(), status);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/{id}/location")
    public ResponseEntity<?> updateLiveLocation(
            @PathVariable Long id,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(required = false) Double bearing) {
        PickupDelivery delivery = deliveryRepository.findById(id).orElse(null);
        if (delivery == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Delivery record not found");
            return ResponseEntity.status(404).body(err);
        }

        delivery.setCurrentLatitude(latitude);
        delivery.setCurrentLongitude(longitude);
        if (bearing != null) {
            delivery.setCurrentBearing(bearing);
        }
        delivery.setLastLocationUpdate(java.time.LocalDateTime.now());
        deliveryRepository.save(delivery);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("deliveryId", id);
        res.put("latitude", latitude);
        res.put("longitude", longitude);
        res.put("bearing", delivery.getCurrentBearing());
        res.put("lastUpdate", delivery.getLastLocationUpdate());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<?> getLiveTracking(@PathVariable Long id) {
        PickupDelivery delivery = deliveryRepository.findById(id).orElse(null);
        if (delivery == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Delivery record not found");
            return ResponseEntity.status(404).body(err);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("deliveryId", delivery.getId());
        response.put("status", delivery.getStatus());
        response.put("distanceKm", delivery.getDistanceKm());
        response.put("routeData", delivery.getRouteData());

        // Origin details (Donor)
        response.put("pickupLocation", delivery.getPickupLocation());
        if (delivery.getFoodRequest() != null && delivery.getFoodRequest().getFoodDonation() != null) {
            FoodDonation donation = delivery.getFoodRequest().getFoodDonation();
            response.put("pickupLat", donation.getLatitude() != null ? donation.getLatitude() : 12.9716);
            response.put("pickupLng", donation.getLongitude() != null ? donation.getLongitude() : 77.5946);
            response.put("foodType", donation.getFoodType());
            response.put("quantity", delivery.getFoodRequest().getQuantityRequested());
            if (donation.getDonor() != null) {
                response.put("donorName", donation.getDonor().getOrganizationName());
            }
        } else {
            response.put("pickupLat", 12.9716);
            response.put("pickupLng", 77.5946);
        }

        // Destination details (Receiver / Shelter)
        response.put("deliveryLocation", delivery.getDeliveryLocation());
        if (delivery.getFoodRequest() != null && delivery.getFoodRequest().getReceiver() != null) {
            Receiver receiver = delivery.getFoodRequest().getReceiver();
            response.put("deliveryLat", receiver.getLatitude() != null ? receiver.getLatitude() : 12.9750);
            response.put("deliveryLng", receiver.getLongitude() != null ? receiver.getLongitude() : 77.6000);
            response.put("receiverName", receiver.getOrganizationName());
        } else {
            response.put("deliveryLat", 12.9750);
            response.put("deliveryLng", 77.6000);
        }

        // Live Volunteer position
        response.put("currentLat", delivery.getCurrentLatitude());
        response.put("currentLng", delivery.getCurrentLongitude());
        response.put("currentBearing", delivery.getCurrentBearing() != null ? delivery.getCurrentBearing() : 0.0);
        response.put("lastUpdate", delivery.getLastLocationUpdate());

        // Volunteer Courier Profile
        if (delivery.getVolunteer() != null) {
            Volunteer vol = delivery.getVolunteer();
            response.put("volunteerId", vol.getId());
            response.put("vehicleType", vol.getVehicleType());
            response.put("vehicleNumber", vol.getVehicleNumber());
            if (vol.getUser() != null) {
                response.put("volunteerName", vol.getUser().getName());
                response.put("volunteerPhone", vol.getUser().getPhone());
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-request/{requestId}")
    public ResponseEntity<?> getDeliveryByRequestId(@PathVariable Long requestId) {
        PickupDelivery delivery = deliveryRepository.findByFoodRequestId(requestId).orElse(null);
        if (delivery == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "No active delivery assignment found for this request");
            return ResponseEntity.status(404).body(err);
        }
        return getLiveTracking(delivery.getId());
    }

    @GetMapping("/{id}/route")
    public ResponseEntity<?> getRouteDetails(@PathVariable Long id) {
        return getLiveTracking(id);
    }
}
