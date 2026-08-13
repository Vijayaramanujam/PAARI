package com.paari.controller;

import com.paari.entity.FoodDonation;
import com.paari.entity.Receiver;
import com.paari.repository.FoodDonationRepository;
import com.paari.service.SmartMatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matches")
public class MatchingController {

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private SmartMatchingService matchingService;

    @GetMapping("/donation/{donationId}")
    public ResponseEntity<?> getMatchesForDonation(@PathVariable Long donationId) {
        FoodDonation donation = donationRepository.findById(donationId).orElse(null);
        if (donation == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Donation not found");
            return ResponseEntity.status(404).body(err);
        }

        List<SmartMatchingService.MatchedReceiver> rawMatches = matchingService.findTopMatches(donation);
        
        List<Map<String, Object>> responseList = rawMatches.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            Receiver receiver = m.getReceiver();
            map.put("id", receiver.getId());
            map.put("organizationName", receiver.getOrganizationName());
            map.put("address", receiver.getAddress());
            map.put("areaServed", receiver.getAreaServed());
            map.put("rating", receiver.getRating());
            map.put("latitude", receiver.getLatitude());
            map.put("longitude", receiver.getLongitude());
            map.put("distance", m.getDistance());
            map.put("score", m.getScore());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }
}
