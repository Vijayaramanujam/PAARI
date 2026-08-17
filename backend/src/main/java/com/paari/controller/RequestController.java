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
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    @Autowired
    private LogisticsService logisticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodRequestRepository requestRepository;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @PostMapping
    @PreAuthorize("hasRole('RECEIVER')")
    public ResponseEntity<?> createRequest(@RequestParam Long donationId, @RequestParam BigDecimal quantity) {
        User user = getAuthenticatedUser();
        try {
            FoodRequest request = logisticsService.createRequest(donationId, user.getId(), quantity);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/{id}/decision")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<?> decideRequest(@PathVariable Long id, @RequestParam boolean accept) {
        User user = getAuthenticatedUser();
        try {
            FoodRequest request = logisticsService.decideRequest(id, user.getId(), accept);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<FoodRequest>> getMyRequests() {
        User user = getAuthenticatedUser();
        List<FoodRequest> list;
        if (user.getRole() == Role.RECEIVER) {
            list = requestRepository.findByReceiverUserId(user.getId());
        } else if (user.getRole() == Role.DONOR) {
            list = requestRepository.findByFoodDonationDonorUserId(user.getId());
        } else {
            list = requestRepository.findAll();
        }
        return ResponseEntity.ok(list);
    }
}
