package com.paari.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class WastagePredictionService {
    private static final Logger logger = LoggerFactory.getLogger(WastagePredictionService.class);

    private List<WastageRecord> historicalRecords = new ArrayList<>();

    public static class WastageRecord {
        public String foodType;
        public int numberOfGuests;
        public String eventType;
        public double quantity;
        public String storageConditions;
        public String purchaseHistory;
        public String seasonality;
        public String preparationMethod;
        public String geographicalLocation;
        public String pricing;
        public double wastageAmount;

        public double getWastageRatio() {
            return quantity > 0 ? wastageAmount / quantity : 0.0;
        }
    }

    public static class PredictionResult {
        private double predictedWastageAmount;
        private double predictedWastagePercentage;
        private double confidenceScore;
        private String recommendation;
        private String matchedHistoricalFoodType;

        public PredictionResult(double amount, double percentage, double confidence, String recommendation, String matchedType) {
            this.predictedWastageAmount = amount;
            this.predictedWastagePercentage = percentage;
            this.confidenceScore = confidence;
            this.recommendation = recommendation;
            this.matchedHistoricalFoodType = matchedType;
        }

        public double getPredictedWastageAmount() { return predictedWastageAmount; }
        public double getPredictedWastagePercentage() { return predictedWastagePercentage; }
        public double getConfidenceScore() { return confidenceScore; }
        public String getRecommendation() { return recommendation; }
        public String getMatchedHistoricalFoodType() { return matchedHistoricalFoodType; }
    }

    @PostConstruct
    public void init() {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("food_wastage_data.csv")) {
            if (in == null) {
                logger.error("food_wastage_data.csv resource file not found!");
                return;
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
                String header = reader.readLine(); // skip header
                if (header != null) {
                    logger.debug("Parsing food wastage CSV headers: {}", header);
                }
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.trim().isEmpty()) continue;
                    String[] tokens = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"); // handle commas inside quotes if any
                    if (tokens.length >= 11) {
                        WastageRecord rec = new WastageRecord();
                        rec.foodType = cleanValue(tokens[0]);
                        rec.numberOfGuests = parseQuietlyInt(tokens[1]);
                        rec.eventType = cleanValue(tokens[2]);
                        rec.quantity = parseQuietlyDoubleWithUnit(tokens[3]);
                        rec.storageConditions = cleanValue(tokens[4]);
                        rec.purchaseHistory = cleanValue(tokens[5]);
                        rec.seasonality = cleanValue(tokens[6]);
                        rec.preparationMethod = cleanValue(tokens[7]);
                        rec.geographicalLocation = cleanValue(tokens[8]);
                        rec.pricing = cleanValue(tokens[9]);
                        rec.wastageAmount = parseQuietlyDoubleWithUnit(tokens[10]);

                        historicalRecords.add(rec);
                    }
                }
                logger.info("Successfully loaded {} historical food wastage prediction records.", historicalRecords.size());
            }
        } catch (Exception e) {
            logger.error("Error initializing food wastage dataset: {}", e.getMessage(), e);
        }
    }

    private String cleanValue(String val) {
        if (val == null) return "";
        return val.replace("\"", "").trim();
    }

    private int parseQuietlyInt(String val) {
        try {
            return Integer.parseInt(cleanValue(val));
        } catch (Exception e) {
            return 0;
        }
    }

    private double parseQuietlyDoubleWithUnit(String val) {
        try {
            String cleaned = cleanValue(val).replaceAll("[^0-9.]", "");
            return Double.parseDouble(cleaned);
        } catch (Exception e) {
            return 0.0;
        }
    }

    public PredictionResult predictWastage(
            String foodType,
            double quantity,
            String eventType,
            String storageConditions,
            String seasonality,
            int numberOfGuests) {

        if (historicalRecords.isEmpty()) {
            return new PredictionResult(0.0, 0.0, 0.0, "No historical data available.", "N/A");
        }

        WastageRecord bestMatch = historicalRecords.get(0);
        double highestSimilarityScore = -1.0;

        for (WastageRecord rec : historicalRecords) {
            double similarity = computeSimilarity(rec, foodType, quantity, eventType, storageConditions, seasonality, numberOfGuests);
            if (similarity > highestSimilarityScore) {
                highestSimilarityScore = similarity;
                bestMatch = rec;
            }
        }

        // Apply rules over best match percentage:
        double baseWastageRatio = bestMatch.getWastageRatio();
        double adjustedWastageRatio = baseWastageRatio;

        // Apply storage condition penalties or bonuses:
        // historical: bestMatch.storageConditions
        // request: storageConditions
        String histStorage = bestMatch.storageConditions.toLowerCase();
        String reqStorage = storageConditions != null ? storageConditions.toLowerCase() : "";

        if (!histStorage.equals(reqStorage)) {
            // Check degradation from Refrigerated/Deep Freeze to Room Temperature/Warm Display
            boolean histIsCold = histStorage.contains("refrig") || histStorage.contains("cold") || histStorage.contains("freeze");
            boolean reqIsCold = reqStorage.contains("refrig") || reqStorage.contains("cold") || reqStorage.contains("freeze");

            if (histIsCold && !reqIsCold) {
                // Warning penalty - multiplier increase by 1.5x up to max 1.0 (100% waste)
                adjustedWastageRatio = Math.min(1.0, adjustedWastageRatio * 1.5);
            } else if (!histIsCold && reqIsCold) {
                // Reward offset - decrease wastage by 0.5x
                adjustedWastageRatio = adjustedWastageRatio * 0.5;
            }
        }

        double predictedAmount = quantity * adjustedWastageRatio;
        double predictedPercentage = adjustedWastageRatio * 100.0;

        // Tailored recommendations mapping:
        String recommendation;
        if (predictedPercentage > 25.0) {
            recommendation = String.format("Caution: High wastage probability (%.1f%%) expected under current conditions. We recommend switching to refrigerated transport or prioritizing smart network match routes within a 5km radius.", predictedPercentage);
        } else if (predictedPercentage > 10.0) {
            recommendation = String.format("Moderate waste likelihood (%.1f%%). Package foods securely and log pickup slots during off-peak traffic hours to ensure fast transit.", predictedPercentage);
        } else {
            recommendation = "Low wastage forecast. Excellent storage conditions configured.";
        }

        return new PredictionResult(
                predictedAmount,
                predictedPercentage,
                highestSimilarityScore,
                recommendation,
                bestMatch.foodType
        );
    }

    private double computeSimilarity(
            WastageRecord rec,
            String foodType,
            double quantity,
            String eventType,
            String storageConditions,
            String seasonality,
            int numberOfGuests) {

        double score = 0.0;
        double maxPossible = 0.0;

        // 1. Food Type keyword matching
        maxPossible += 2.5;
        if (foodType != null && rec.foodType != null) {
            String f1 = foodType.toLowerCase();
            String f2 = rec.foodType.toLowerCase();
            if (f1.equals(f2)) {
                score += 2.5;
            } else if (f1.contains(f2) || f2.contains(f1)) {
                score += 1.8;
            } else {
                // Check if they share base tokens
                String[] t1 = f1.split("\\s+");
                String[] t2 = f2.split("\\s+");
                int matches = 0;
                for (String w1 : t1) {
                    if (w1.length() > 2) {
                        for (String w2 : t2) {
                            if (w1.equals(w2)) matches++;
                        }
                    }
                }
                if (matches > 0) {
                    score += Math.min(1.5, matches * 0.7);
                }
            }
        }

        // 2. Event Type exact matching
        maxPossible += 1.0;
        if (eventType != null && eventType.equalsIgnoreCase(rec.eventType)) {
            score += 1.0;
        }

        // 3. Storage Conditions similarity
        maxPossible += 1.5;
        if (storageConditions != null && storageConditions.equalsIgnoreCase(rec.storageConditions)) {
            score += 1.5;
        } else if (storageConditions != null && rec.storageConditions != null) {
            String s1 = storageConditions.toLowerCase();
            String s2 = rec.storageConditions.toLowerCase();
            if ((s1.contains("cold") || s1.contains("refrig")) && (s2.contains("cold") || s2.contains("refrig"))) {
                score += 1.0;
            }
        }

        // 4. Seasonality
        maxPossible += 1.0;
        if (seasonality != null && (seasonality.equalsIgnoreCase(rec.seasonality) || rec.seasonality.equalsIgnoreCase("All Seasons"))) {
            score += 1.0;
        }

        // 5. Quantity numerical distance
        maxPossible += 1.5;
        double maxQty = Math.max(quantity, rec.quantity);
        if (maxQty > 0) {
            score += 1.5 * (1.0 - (Math.abs(quantity - rec.quantity) / maxQty));
        }

        // 6. Guest Count numeric distance
        maxPossible += 1.0;
        double maxGuests = Math.max(numberOfGuests, rec.numberOfGuests);
        if (maxGuests > 0) {
            score += 1.0 * (1.0 - (Math.abs(numberOfGuests - rec.numberOfGuests) / maxGuests));
        }

        return score / maxPossible;
    }
}
