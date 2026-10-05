package com.paari.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RouteOptimizationService {
    private static final Logger logger = LoggerFactory.getLogger(RouteOptimizationService.class);

    @Value("${paari.routing.ghApiKey:}")
    private String apiKey;

    public static class RouteDetails {
        private double distanceKm;
        private long etaMinutes;
        private String routeDataJson; // Mock GEOJson route path coordinates string

        public RouteDetails(double distanceKm, long etaMinutes, String routeDataJson) {
            this.distanceKm = distanceKm;
            this.etaMinutes = etaMinutes;
            this.routeDataJson = routeDataJson;
        }

        public double getDistanceKm() { return distanceKm; }
        public long getEtaMinutes() { return etaMinutes; }
        public String getRouteDataJson() { return routeDataJson; }
    }

    public RouteDetails calculateRoute(double startLat, double startLng, double endLat, double endLng) {
        // Fallback calculations using Haversine
        double distance = calculateHaversineDistance(startLat, startLng, endLat, endLng);
        
        // Assume average speed = 35 km/h for delivery volunteer
        double hours = distance / 35.0;
        long etaMinutes = Math.max(5, Math.round(hours * 60.0)); // minimum 5 mins

        // Generate realistic street waypoints (12 segments emulating city grid roads)
        StringBuilder coords = new StringBuilder("[");
        int segments = 12;
        for (int i = 0; i <= segments; i++) {
            double fraction = (double) i / segments;
            double lat = startLat + fraction * (endLat - startLat);
            double lng = startLng + fraction * (endLng - startLng);
            
            if (i > 0 && i < segments) {
                double lateralOffset = 0.0022 * Math.sin(fraction * Math.PI);
                if (i % 2 == 1) {
                    lat += lateralOffset * 0.7;
                    lng += lateralOffset * 0.3;
                } else {
                    lat -= lateralOffset * 0.3;
                    lng += lateralOffset * 0.7;
                }
            }
            if (i > 0) coords.append(",");
            coords.append(String.format(java.util.Locale.US, "[%f,%f]", lng, lat));
        }
        coords.append("]");

        String mockPathJson = String.format("{\"type\":\"LineString\",\"coordinates\":%s}", coords.toString());

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            logger.info("GraphHopper key detected. Stubbing exterior integration. Distance: {} km", distance);
        }

        return new RouteDetails(distance, etaMinutes, mockPathJson);
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
