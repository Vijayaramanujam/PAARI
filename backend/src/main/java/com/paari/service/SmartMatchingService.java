package com.paari.service;

import com.paari.entity.FoodDonation;
import com.paari.entity.Receiver;
import com.paari.repository.ReceiverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SmartMatchingService {

    @Autowired
    private ReceiverRepository receiverRepository;

    @Value("${paari.matching.radiusKm:15.0}")
    private double radiusLimit;

    // Haversine calculation formula
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public static class MatchedReceiver {
        private Receiver receiver;
        private double distance;
        private double score;

        public MatchedReceiver(Receiver receiver, double distance, double score) {
            this.receiver = receiver;
            this.distance = distance;
            this.score = score;
        }

        public Receiver getReceiver() { return receiver; }
        public double getDistance() { return distance; }
        public double getScore() { return score; }
    }

    public List<MatchedReceiver> findTopMatches(FoodDonation donation) {
        if (donation.getLatitude() == null || donation.getLongitude() == null) {
            return new ArrayList<>();
        }

        List<Receiver> allReceivers = receiverRepository.findAll();
        List<MatchedReceiver> matches = new ArrayList<>();

        for (Receiver receiver : allReceivers) {
            if (receiver.getLatitude() == null || receiver.getLongitude() == null) {
                continue;
            }

            double distance = calculateDistance(
                    donation.getLatitude(), donation.getLongitude(),
                    receiver.getLatitude(), receiver.getLongitude()
            );

            // Filtering based on radius limit
            if (distance <= radiusLimit) {
                // Rank Score: Higher rating boosts it, lower distance boosts it
                // Max rating is 5.0. Score = (rating * 2.0) - (distance / radiusLimit * 5.0)
                double rating = receiver.getRating() != null ? receiver.getRating() : 0.0;
                double score = (rating * 2.0) - ((distance / radiusLimit) * 5.0);
                matches.add(new MatchedReceiver(receiver, distance, score));
            }
        }

        // Sort by score descending (highest recommendations first)
        return matches.stream()
                .sorted(Comparator.comparingDouble(MatchedReceiver::getScore).reversed())
                .collect(Collectors.toList());
    }
}
