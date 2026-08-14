package com.paari.controller;

import com.paari.entity.*;
import com.paari.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PickupDeliveryRepository deliveryRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getAnalyticsSummary() {
        List<FoodDonation> donations = donationRepository.findAll();

        BigDecimal totalKgsSaved = BigDecimal.ZERO;
        long activeDonors = 0;
        long activeReceivers = 0;

        for (FoodDonation donation : donations) {
            if (donation.getStatus() == DonationStatus.COMPLETED) {
                totalKgsSaved = totalKgsSaved.add(donation.getQuantity());
            }
        }

        // Count users
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getStatus() == UserStatus.ACTIVE) {
                if (user.getRole() == Role.DONOR) {
                    activeDonors++;
                } else if (user.getRole() == Role.RECEIVER) {
                    activeReceivers++;
                }
            }
        }

        long completedDeliveries = deliveryRepository.findByStatus(DeliveryStatus.DELIVERED).size();

        // Meals equivalency: Assume 1 kg of food is approximately 2.5 meals
        BigDecimal mealsSaved = totalKgsSaved.multiply(BigDecimal.valueOf(2.5));

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalKgsSaved", totalKgsSaved);
        summary.put("mealsSaved", mealsSaved.setScale(0, BigDecimal.ROUND_HALF_UP));
        summary.put("activeDonors", activeDonors);
        summary.put("activeReceivers", activeReceivers);
        summary.put("completedDeliveries", completedDeliveries);

        // Chart mock data for donations over the last 7 days
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime day = now.minusDays(i);
            String dayName = day.getDayOfWeek().toString().substring(0, 3);
            
            // Random-seeded mock count for visual beauty
            int count = 5 + (dayName.hashCode() % 15);
            Map<String, Object> point = new HashMap<>();
            point.put("day", dayName);
            point.put("quantity", count);
            weeklyData.add(point);
        }
        summary.put("weeklyDonations", weeklyData);

        // Hotspot coordinates for visual dashboard mapping
        List<Map<String, Object>> hotspots = new ArrayList<>();
        donations.stream()
                .filter(d -> d.getLatitude() != null && d.getLongitude() != null)
                .limit(10)
                .forEach(d -> {
                    Map<String, Object> marker = new HashMap<>();
                    marker.put("lat", d.getLatitude());
                    marker.put("lng", d.getLongitude());
                    marker.put("type", d.getFoodType());
                    marker.put("qty", d.getQuantity());
                    hotspots.add(marker);
                });
        summary.put("hotspots", hotspots);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/charts")
    public ResponseEntity<?> getChartsData() {
        Map<String, Object> charts = new HashMap<>();
        List<String> labels = Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun");
        
        // Sum completed donations vs total deliveries (using mock/real counts)
        List<Integer> kgsSavedData = Arrays.asList(120, 240, 480, 720, 1100, 1420);
        List<Integer> deliveriesData = Arrays.asList(6, 12, 18, 25, 34, 46);
        
        charts.put("labels", labels);
        charts.put("kgsSavedData", kgsSavedData);
        charts.put("deliveriesData", deliveriesData);
        
        return ResponseEntity.ok(charts);
    }
}
