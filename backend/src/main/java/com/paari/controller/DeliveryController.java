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
        try {
            PickupDelivery delivery = logisticsService.updateDeliveryStatus(id, status);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/{id}/route")
    public ResponseEntity<?> getRouteDetails(@PathVariable Long id) {
        PickupDelivery delivery = deliveryRepository.findById(id).orElse(null);
        if (delivery == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Delivery record not found");
            return ResponseEntity.status(404).body(err);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("deliveryId", delivery.getId());
        response.put("pickupLocation", delivery.getPickupLocation());
        response.put("deliveryLocation", delivery.getDeliveryLocation());
        response.put("distanceKm", delivery.getDistanceKm());
        response.put("routeData", delivery.getRouteData());
        response.put("status", delivery.getStatus());

        return ResponseEntity.ok(response);
    }
}
