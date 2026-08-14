package com.paari.controller;

import com.paari.service.WastagePredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictions")
public class WastagePredictionController {

    @Autowired
    private WastagePredictionService predictionService;

    public static class PredictionRequest {
        private String foodType;
        private double quantity;
        private String eventType;
        private String storageConditions;
        private String seasonality;
        private int numberOfGuests;

        public String getFoodType() { return foodType; }
        public void setFoodType(String foodType) { this.foodType = foodType; }

        public double getQuantity() { return quantity; }
        public void setQuantity(double quantity) { this.quantity = quantity; }

        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }

        public String getStorageConditions() { return storageConditions; }
        public void setStorageConditions(String storageConditions) { this.storageConditions = storageConditions; }

        public String getSeasonality() { return seasonality; }
        public void setSeasonality(String seasonality) { this.seasonality = seasonality; }

        public int getNumberOfGuests() { return numberOfGuests; }
        public void setNumberOfGuests(int numberOfGuests) { this.numberOfGuests = numberOfGuests; }
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predictWastage(@RequestBody PredictionRequest request) {
        try {
            WastagePredictionService.PredictionResult result = predictionService.predictWastage(
                    request.getFoodType(),
                    request.getQuantity(),
                    request.getEventType(),
                    request.getStorageConditions(),
                    request.getSeasonality(),
                    request.getNumberOfGuests()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
