package com.paari.dto;

public class RouteResponse {
    private double distanceKm;
    private long etaMinutes;
    private String routeData;

    public RouteResponse() {}

    public RouteResponse(double distanceKm, long etaMinutes, String routeData) {
        this.distanceKm = distanceKm;
        this.etaMinutes = etaMinutes;
        this.routeData = routeData;
    }

    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    public long getEtaMinutes() { return etaMinutes; }
    public void setEtaMinutes(long etaMinutes) { this.etaMinutes = etaMinutes; }
    public String getRouteData() { return routeData; }
    public void setRouteData(String routeData) { this.routeData = routeData; }
}
