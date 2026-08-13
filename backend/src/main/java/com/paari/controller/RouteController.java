package com.paari.controller;

import com.paari.dto.RouteRequest;
import com.paari.dto.RouteResponse;
import com.paari.service.RouteOptimizationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RouteOptimizationService routeService;

    @PostMapping("/calculate")
    public ResponseEntity<RouteResponse> calculateRoute(@Valid @RequestBody RouteRequest request) {
        RouteOptimizationService.RouteDetails details = routeService.calculateRoute(
                request.getStartLat(),
                request.getStartLng(),
                request.getEndLat(),
                request.getEndLng()
        );

        RouteResponse response = new RouteResponse(
                details.getDistanceKm(),
                details.getEtaMinutes(),
                details.getRouteDataJson()
        );

        return ResponseEntity.ok(response);
    }
}
