package com.paari.controller;

import com.paari.dto.DonationRequest;
import com.paari.dto.DonationResponse;
import com.paari.entity.DonationStatus;
import com.paari.entity.Donor;
import com.paari.entity.FoodDonation;
import com.paari.entity.User;
import com.paari.repository.DonorRepository;
import com.paari.repository.FoodDonationRepository;
import com.paari.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorRepository donorRepository;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<?> createDonation(@Valid @RequestBody DonationRequest request) {
        // Verification Engine Rules
        if (request.getExpiryTime().isBefore(LocalDateTime.now())) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Expiry time must be in the future!");
            return ResponseEntity.badRequest().body(err);
        }

        if (request.getPickupTime().isAfter(request.getExpiryTime())) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Pickup time must be before expiry time!");
            return ResponseEntity.badRequest().body(err);
        }

        User user = getAuthenticatedUser();
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor profile not found for user: " + user.getId()));

        FoodDonation donation = new FoodDonation();
        donation.setDonor(donor);
        donation.setFoodType(request.getFoodType());
        donation.setQuantity(request.getQuantity());
        donation.setDescription(request.getDescription());
        donation.setPickupAddress(request.getPickupAddress());
        donation.setPickupTime(request.getPickupTime());
        donation.setExpiryTime(request.getExpiryTime());
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setLatitude(request.getLatitude());
        donation.setLongitude(request.getLongitude());

        donation = donationRepository.save(donation);
        return ResponseEntity.ok(new DonationResponse(donation));
    }

    @GetMapping("/available")
    public ResponseEntity<List<DonationResponse>> getAvailableDonations() {
        // Returns listings that are AVAILABLE and NOT expired
        List<FoodDonation> list = donationRepository.findAvailableActive(LocalDateTime.now());
        List<DonationResponse> res = list.stream().map(DonationResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<List<DonationResponse>> getMyDonations() {
        User user = getAuthenticatedUser();
        List<FoodDonation> list = donationRepository.findByDonorUserId(user.getId());
        List<DonationResponse> res = list.stream().map(DonationResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDonationById(@PathVariable Long id) {
        FoodDonation donation = donationRepository.findById(id)
                .orElse(null);
        if (donation == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Donation not found with id: " + id);
            return ResponseEntity.status(404).body(err);
        }
        return ResponseEntity.ok(new DonationResponse(donation));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateDonationStatus(@PathVariable Long id, @RequestParam DonationStatus status) {
        FoodDonation donation = donationRepository.findById(id)
                .orElse(null);
        if (donation == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Donation not found with id: " + id);
            return ResponseEntity.status(404).body(err);
        }

        // Simplistic ownership check
        User user = getAuthenticatedUser();
        if (user.getRole() == com.paari.entity.Role.DONOR && !donation.getDonor().getUser().getId().equals(user.getId())) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Access Denied: You do not own this donation record!");
            return ResponseEntity.status(403).body(err);
        }

        donation.setStatus(status);
        donation = donationRepository.save(donation);
        return ResponseEntity.ok(new DonationResponse(donation));
    }
}
