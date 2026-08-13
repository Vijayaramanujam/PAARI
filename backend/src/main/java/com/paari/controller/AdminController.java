package com.paari.controller;

import com.paari.entity.*;
import com.paari.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private FoodRequestRepository requestRepository;

    @Autowired
    private PickupDeliveryRepository deliveryRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "User not found with id: " + id);
            return ResponseEntity.status(404).body(err);
        }
        
        user.setStatus(status);
        userRepository.save(user);

        Map<String, String> res = new HashMap<>();
        res.put("message", "User status updated to " + status);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports() {
        long totalUsers = userRepository.count();
        long totalDonations = donationRepository.count();
        long totalRequests = requestRepository.count();
        long totalDeliveries = deliveryRepository.count();

        // Roll up user distribution
        List<User> allUsers = userRepository.findAll();
        long donorCount = allUsers.stream().filter(u -> u.getRole() == Role.DONOR).count();
        long receiverCount = allUsers.stream().filter(u -> u.getRole() == Role.RECEIVER).count();
        long volunteerCount = allUsers.stream().filter(u -> u.getRole() == Role.VOLUNTEER).count();

        Map<String, Object> report = new HashMap<>();
        report.put("totalUsers", totalUsers);
        report.put("donors", donorCount);
        report.put("receivers", receiverCount);
        report.put("volunteers", volunteerCount);
        report.put("totalDonations", totalDonations);
        report.put("totalRequests", totalRequests);
        report.put("totalDeliveries", totalDeliveries);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<Feedback>> getComplaints() {
        // Treat low-rating feedbacks (rating <= 2) as complaints
        List<Feedback> feedbacks = feedbackRepository.findAll();
        List<Feedback> complaints = feedbacks.stream()
                .filter(f -> f.getRating() <= 2)
                .collect(Collectors.toList());
        return ResponseEntity.ok(complaints);
    }
}
