package com.paari.controller;

import com.paari.entity.*;
import com.paari.repository.*;
import com.paari.service.RouteOptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "*")
public class DatabaseInspectorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ReceiverRepository receiverRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private FoodRequestRepository requestRepository;

    @Autowired
    private PickupDeliveryRepository deliveryRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private RouteOptimizationService routeService;

    @GetMapping("/database-inspector")
    public ResponseEntity<Map<String, Object>> getDatabaseSnapshot() {
        Map<String, Object> data = new LinkedHashMap<>();

        // 1. Database & Persistence Meta
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("databaseEngine", "H2 Database 2.x");
        meta.put("storageMode", "Persistent File-Backed Disk Storage (./data/paari_db.mv.db)");
        meta.put("h2ConsolePath", "/h2-console");
        meta.put("jdbcUrl", "jdbc:h2:file:./data/paari_db");
        meta.put("h2User", "sa");
        meta.put("h2Password", "(empty/blank)");
        meta.put("serverTime", LocalDateTime.now().toString());
        data.put("metadata", meta);

        // 2. Summary Counts
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("users", userRepository.count());
        counts.put("donors", donorRepository.count());
        counts.put("receivers", receiverRepository.count());
        counts.put("volunteers", volunteerRepository.count());
        counts.put("foodDonations", donationRepository.count());
        counts.put("foodRequests", requestRepository.count());
        counts.put("pickupDeliveries", deliveryRepository.count());
        counts.put("feedbacks", feedbackRepository.count());
        data.put("tableCounts", counts);

        // 3. Detailed Table Records
        // Users
        List<Map<String, Object>> usersList = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", u.getId());
            row.put("name", u.getName());
            row.put("email", u.getEmail());
            row.put("role", u.getRole() != null ? u.getRole().name() : null);
            row.put("status", u.getStatus() != null ? u.getStatus().name() : null);
            row.put("phone", u.getPhone());
            row.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
            usersList.add(row);
        }
        data.put("users", usersList);

        // Donors
        List<Map<String, Object>> donorsList = new ArrayList<>();
        for (Donor d : donorRepository.findAll()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", d.getId());
            row.put("organizationName", d.getOrganizationName());
            row.put("foodTypeOffered", d.getFoodTypeOffered());
            row.put("rating", d.getRating());
            row.put("address", d.getAddress());
            row.put("latitude", d.getLatitude());
            row.put("longitude", d.getLongitude());
            row.put("userId", d.getUser() != null ? d.getUser().getId() : null);
            row.put("userEmail", d.getUser() != null ? d.getUser().getEmail() : null);
            donorsList.add(row);
        }
        data.put("donors", donorsList);

        // Receivers
        List<Map<String, Object>> receiversList = new ArrayList<>();
        for (Receiver r : receiverRepository.findAll()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", r.getId());
            row.put("organizationName", r.getOrganizationName());
            row.put("areaServed", r.getAreaServed());
            row.put("rating", r.getRating());
            row.put("address", r.getAddress());
            row.put("latitude", r.getLatitude());
            row.put("longitude", r.getLongitude());
            row.put("userId", r.getUser() != null ? r.getUser().getId() : null);
            row.put("userEmail", r.getUser() != null ? r.getUser().getEmail() : null);
            receiversList.add(row);
        }
        data.put("receivers", receiversList);

        // Volunteers
        List<Map<String, Object>> volunteersList = new ArrayList<>();
        for (Volunteer v : volunteerRepository.findAll()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", v.getId());
            row.put("vehicleType", v.getVehicleType());
            row.put("vehicleNumber", v.getVehicleNumber());
            row.put("availabilityStatus", v.getAvailabilityStatus());
            row.put("rating", v.getRating());
            row.put("userId", v.getUser() != null ? v.getUser().getId() : null);
            row.put("userName", v.getUser() != null ? v.getUser().getName() : null);
            row.put("userEmail", v.getUser() != null ? v.getUser().getEmail() : null);
            volunteersList.add(row);
        }
        data.put("volunteers", volunteersList);

        // Food Donations
        List<Map<String, Object>> donationsList = new ArrayList<>();
        for (FoodDonation fd : donationRepository.findAll()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", fd.getId());
            row.put("foodType", fd.getFoodType());
            row.put("quantityKg", fd.getQuantity());
            row.put("status", fd.getStatus() != null ? fd.getStatus().name() : null);
            row.put("pickupAddress", fd.getPickupAddress());
            row.put("latitude", fd.getLatitude());
            row.put("longitude", fd.getLongitude());
            row.put("pickupTime", fd.getPickupTime() != null ? fd.getPickupTime().toString() : null);
            row.put("expiryTime", fd.getExpiryTime() != null ? fd.getExpiryTime().toString() : null);
            row.put("donorOrganization", fd.getDonor() != null ? fd.getDonor().getOrganizationName() : null);
            donationsList.add(row);
        }
        data.put("foodDonations", donationsList);

        // Food Requests
        List<Map<String, Object>> requestsList = new ArrayList<>();
        for (FoodRequest fr : requestRepository.findAll()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", fr.getId());
            row.put("status", fr.getStatus() != null ? fr.getStatus().name() : null);
            row.put("quantityRequestedKg", fr.getQuantityRequested());
            row.put("requestTime", fr.getRequestTime() != null ? fr.getRequestTime().toString() : null);
            row.put("donationFoodType", fr.getFoodDonation() != null ? fr.getFoodDonation().getFoodType() : null);
            row.put("receiverOrganization", fr.getReceiver() != null ? fr.getReceiver().getOrganizationName() : null);
            requestsList.add(row);
        }
        data.put("foodRequests", requestsList);

        // Pickup Deliveries
        List<Map<String, Object>> deliveriesList = new ArrayList<>();
        for (PickupDelivery pd : deliveryRepository.findAll()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", pd.getId());
            row.put("status", pd.getStatus() != null ? pd.getStatus().name() : null);
            row.put("pickupLocation", pd.getPickupLocation());
            row.put("deliveryLocation", pd.getDeliveryLocation());
            row.put("distanceKm", pd.getDistanceKm());
            row.put("currentLatitude", pd.getCurrentLatitude());
            row.put("currentLongitude", pd.getCurrentLongitude());
            row.put("currentBearing", pd.getCurrentBearing());
            row.put("lastLocationUpdate", pd.getLastLocationUpdate() != null ? pd.getLastLocationUpdate().toString() : null);
            row.put("volunteerName", pd.getVolunteer() != null && pd.getVolunteer().getUser() != null ? pd.getVolunteer().getUser().getName() : "UNASSIGNED");
            row.put("foodRequestId", pd.getFoodRequest() != null ? pd.getFoodRequest().getId() : null);
            deliveriesList.add(row);
        }
        data.put("pickupDeliveries", deliveriesList);

        // Feedbacks
        List<Map<String, Object>> feedbacksList = new ArrayList<>();
        for (Feedback fb : feedbackRepository.findAll()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", fb.getId());
            row.put("rating", fb.getRating());
            row.put("comment", fb.getComment());
            row.put("type", fb.getType());
            row.put("createdAt", fb.getCreatedAt() != null ? fb.getCreatedAt().toString() : null);
            row.put("userName", fb.getUser() != null ? fb.getUser().getName() : null);
            feedbacksList.add(row);
        }
        data.put("feedbacks", feedbacksList);

        return ResponseEntity.ok(data);
    }

    @PostMapping("/quick-dispatch-job")
    public ResponseEntity<?> quickDispatchDeliveryJob() {
        // Find existing donor and receiver or create
        Donor donor = donorRepository.findAll().stream().findFirst().orElse(null);
        Receiver receiver = receiverRepository.findAll().stream().findFirst().orElse(null);

        if (donor == null || receiver == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Donor or Receiver demo records missing. Re-initialize seeds.");
            return ResponseEntity.badRequest().body(err);
        }

        // Create fresh donation
        long count = deliveryRepository.count() + 1;
        FoodDonation donation = new FoodDonation();
        donation.setDonor(donor);
        donation.setFoodType("Surplus Food Pack #" + count + " (CIT Hub)");
        donation.setQuantity(BigDecimal.valueOf(15 + (count * 5) % 30));
        donation.setDescription("Real-time generated food surplus ready for volunteer pickup.");
        donation.setPickupAddress(donor.getAddress());
        donation.setPickupTime(LocalDateTime.now().plusMinutes(15));
        donation.setExpiryTime(LocalDateTime.now().plusHours(12));
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setLatitude(donor.getLatitude() != null ? donor.getLatitude() : 12.9715628);
        donation.setLongitude(donor.getLongitude() != null ? donor.getLongitude() : 80.043079);
        donation = donationRepository.save(donation);

        // Create accepted food request
        FoodRequest req = new FoodRequest();
        req.setFoodDonation(donation);
        req.setReceiver(receiver);
        req.setQuantityRequested(BigDecimal.valueOf(15));
        req.setRequestTime(LocalDateTime.now());
        req.setStatus(RequestStatus.ACCEPTED);
        req = requestRepository.save(req);

        // Create unassigned delivery task ready for volunteer to take
        PickupDelivery delivery = new PickupDelivery();
        delivery.setFoodRequest(req);
        delivery.setVolunteer(null); // Unassigned
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        delivery.setPickupLocation(donation.getPickupAddress());
        delivery.setDeliveryLocation(receiver.getAddress());
        delivery.setPickupTime(LocalDateTime.now().plusMinutes(30));
        var route = routeService.calculateRoute(
            donation.getLatitude(), donation.getLongitude(),
            receiver.getLatitude() != null ? receiver.getLatitude() : 12.9860,
            receiver.getLongitude() != null ? receiver.getLongitude() : 80.0650
        );
        delivery.setDistanceKm(route.getDistanceKm());
        delivery.setRouteData(route.getRouteDataJson());
        delivery = deliveryRepository.save(delivery);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Fresh delivery run dispatched successfully!");
        resp.put("deliveryId", delivery.getId());
        resp.put("pickupLocation", delivery.getPickupLocation());
        resp.put("deliveryLocation", delivery.getDeliveryLocation());
        resp.put("distanceKm", delivery.getDistanceKm());
        return ResponseEntity.ok(resp);
    }
}
