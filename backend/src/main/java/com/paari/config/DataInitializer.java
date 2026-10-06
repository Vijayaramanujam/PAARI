package com.paari.config;

import com.paari.entity.*;
import com.paari.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

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
    private com.paari.service.RouteOptimizationService routeService;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Admin
        if (!userRepository.existsByEmail("admin@paari.org")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@paari.org");
            admin.setPhone("1234567890");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);
        }

        // 2. Seed Donor
        Donor donor;
        if (!userRepository.existsByEmail("donor@paari.org")) {
            User donorUser = new User();
            donorUser.setName("Baker's Delight");
            donorUser.setEmail("donor@paari.org");
            donorUser.setPhone("2345678901");
            donorUser.setPassword(encoder.encode("donor123"));
            donorUser.setRole(Role.DONOR);
            donorUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(donorUser);

            donor = new Donor();
            donor.setUser(donorUser);
            donor.setOrganizationName("Baker's Delight (CIT Campus)");
            donor.setAddress("Chennai Institute of Technology, Sarathy Nagar, Kundrathur, Chennai - 600069");
            donor.setFoodTypeOffered("Fresh Bakery & Meals");
            donor.setRating(4.8f);
            donor.setLatitude(12.9715628); // Chennai Institute of Technology (CIT)
            donor.setLongitude(80.043079);
            donor = donorRepository.save(donor);

            // Seed sample food donations
            FoodDonation donation1 = new FoodDonation();
            donation1.setDonor(donor);
            donation1.setFoodType("Fresh Chocolate Croissants & Buns");
            donation1.setQuantity(BigDecimal.valueOf(25));
            donation1.setDescription("Freshly baked items from CIT Food Court, excess stock ready for distribution.");
            donation1.setPickupAddress("Chennai Institute of Technology, Sarathy Nagar, Kundrathur, Chennai - 600069");
            donation1.setPickupTime(LocalDateTime.now().plusHours(1));
            donation1.setExpiryTime(LocalDateTime.now().plusHours(12));
            donation1.setStatus(DonationStatus.AVAILABLE);
            donation1.setLatitude(12.9715628);
            donation1.setLongitude(80.043079);
            donationRepository.save(donation1);

            FoodDonation donation2 = new FoodDonation();
            donation2.setDonor(donor);
            donation2.setFoodType("Prepared Nutritious Meal Packs");
            donation2.setQuantity(BigDecimal.valueOf(40));
            donation2.setDescription("40 warm packed meal trays prepared with hygienic standards at CIT.");
            donation2.setPickupAddress("Chennai Institute of Technology, Sarathy Nagar, Kundrathur, Chennai - 600069");
            donation2.setPickupTime(LocalDateTime.now().plusHours(2));
            donation2.setExpiryTime(LocalDateTime.now().plusHours(24));
            donation2.setStatus(DonationStatus.AVAILABLE);
            donation2.setLatitude(12.9715628);
            donation2.setLongitude(80.043079);
            donationRepository.save(donation2);
        } else {
            donor = userRepository.findByEmail("donor@paari.org")
                .flatMap(u -> donorRepository.findByUserId(u.getId()))
                .orElse(null);
        }

        // 3. Seed Receiver (NGO)
        Receiver receiver;
        if (!userRepository.existsByEmail("ngo@paari.org")) {
            User receiverUser = new User();
            receiverUser.setName("Hope Shelter");
            receiverUser.setEmail("ngo@paari.org");
            receiverUser.setPhone("3456789012");
            receiverUser.setPassword(encoder.encode("ngo123"));
            receiverUser.setRole(Role.RECEIVER);
            receiverUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(receiverUser);

            receiver = new Receiver();
            receiver.setUser(receiverUser);
            receiver.setOrganizationName("Hope Food Rescue Shelter");
            receiver.setAddress("Kundrathur Main Road, Near Murugan Temple, Chennai");
            receiver.setAreaServed("Kundrathur & Porur Region, Chennai");
            receiver.setRating(4.8f);
            receiver.setLatitude(12.9860); // Kundrathur Main Road
            receiver.setLongitude(80.0650);
            receiver = receiverRepository.save(receiver);
        } else {
            receiver = userRepository.findByEmail("ngo@paari.org")
                .flatMap(u -> receiverRepository.findByUserId(u.getId()))
                .orElse(null);
        }

        // 4. Seed Volunteer
        Volunteer volunteer;
        if (!userRepository.existsByEmail("volunteer@paari.org")) {
            User volunteerUser = new User();
            volunteerUser.setName("John Deliverer");
            volunteerUser.setEmail("volunteer@paari.org");
            volunteerUser.setPhone("4567890123");
            volunteerUser.setPassword(encoder.encode("volunteer123"));
            volunteerUser.setRole(Role.VOLUNTEER);
            volunteerUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(volunteerUser);

            volunteer = new Volunteer();
            volunteer.setUser(volunteerUser);
            volunteer.setVehicleType("Motorcycle");
            volunteer.setVehicleNumber("TN-09-AB-2026");
            volunteer.setAvailabilityStatus(true);
            volunteer.setRating(4.9f);
            volunteer = volunteerRepository.save(volunteer);
        } else {
            volunteer = userRepository.findByEmail("volunteer@paari.org")
                .flatMap(u -> volunteerRepository.findByUserId(u.getId()))
                .orElse(null);
        }

        // 5. Guarantee all demo accounts ALWAYS have valid passwords & ACTIVE status across every iteration
        java.util.Map<String, String> demoCredentials = java.util.Map.of(
            "admin@paari.org", "admin123",
            "donor@paari.org", "donor123",
            "ngo@paari.org", "ngo123",
            "volunteer@paari.org", "volunteer123"
        );
        for (java.util.Map.Entry<String, String> entry : demoCredentials.entrySet()) {
            userRepository.findByEmail(entry.getKey()).ifPresent(u -> {
                u.setPassword(encoder.encode(entry.getValue()));
                u.setStatus(UserStatus.ACTIVE);
                userRepository.save(u);
            });
        }

        // Ensure volunteer availability is reset to active
        if (volunteer != null) {
            volunteer.setAvailabilityStatus(true);
            volunteerRepository.save(volunteer);
        }

        // Sync existing demo donor and receiver coordinates to CIT Chennai
        if (donor != null) {
            donor.setLatitude(12.9715628);
            donor.setLongitude(80.043079);
            donor.setAddress("Chennai Institute of Technology, Sarathy Nagar, Kundrathur, Chennai - 600069");
            donorRepository.save(donor);
        }
        if (receiver != null) {
            receiver.setLatitude(12.9860);
            receiver.setLongitude(80.0650);
            receiver.setAddress("Kundrathur Main Road, Near Murugan Temple, Chennai");
            receiverRepository.save(receiver);
        }

        // 6. Pre-seed Active and Open Delivery Jobs if none exist or fewer than 2 exist
        if (deliveryRepository.count() < 2 && donor != null && receiver != null && volunteer != null) {
            // Fetch or create donations
            var donations = donationRepository.findByDonorId(donor.getId());
            FoodDonation d1 = donations.size() > 0 ? donations.get(0) : null;
            FoodDonation d2 = donations.size() > 1 ? donations.get(1) : null;

            if (d1 == null) {
                d1 = new FoodDonation();
                d1.setDonor(donor);
                d1.setFoodType("Fresh Chocolate Croissants & Buns");
                d1.setQuantity(BigDecimal.valueOf(25));
                d1.setDescription("Freshly baked items from CIT Food Court, excess stock ready for distribution.");
                d1.setPickupAddress("Chennai Institute of Technology, Sarathy Nagar, Kundrathur, Chennai - 600069");
                d1.setPickupTime(LocalDateTime.now().plusHours(1));
                d1.setExpiryTime(LocalDateTime.now().plusHours(12));
                d1.setStatus(DonationStatus.AVAILABLE);
                d1.setLatitude(12.9715628);
                d1.setLongitude(80.043079);
                d1 = donationRepository.save(d1);
            }

            if (d2 == null) {
                d2 = new FoodDonation();
                d2.setDonor(donor);
                d2.setFoodType("Prepared Nutritious Meal Packs");
                d2.setQuantity(BigDecimal.valueOf(40));
                d2.setDescription("40 warm packed meal trays prepared with hygienic standards at CIT.");
                d2.setPickupAddress("Chennai Institute of Technology, Sarathy Nagar, Kundrathur, Chennai - 600069");
                d2.setPickupTime(LocalDateTime.now().plusHours(2));
                d2.setExpiryTime(LocalDateTime.now().plusHours(24));
                d2.setStatus(DonationStatus.AVAILABLE);
                d2.setLatitude(12.9715628);
                d2.setLongitude(80.043079);
                d2 = donationRepository.save(d2);
            }

            // Create Food Request 1 (Active Delivery for volunteer)
            FoodRequest r1 = new FoodRequest();
            r1.setFoodDonation(d1);
            r1.setReceiver(receiver);
            r1.setQuantityRequested(BigDecimal.valueOf(15));
            r1.setRequestTime(LocalDateTime.now().minusMinutes(20));
            r1.setStatus(RequestStatus.ACCEPTED);
            r1 = requestRepository.save(r1);

            // Active delivery task (Pre-assigned to John Deliverer so volunteer portal immediately has work)
            PickupDelivery activeDelivery = new PickupDelivery();
            activeDelivery.setFoodRequest(r1);
            activeDelivery.setVolunteer(volunteer);
            activeDelivery.setStatus(DeliveryStatus.ASSIGNED);
            activeDelivery.setPickupLocation(d1.getPickupAddress());
            activeDelivery.setDeliveryLocation(receiver.getAddress());
            activeDelivery.setPickupTime(LocalDateTime.now().plusMinutes(15));
            activeDelivery.setCurrentLatitude(12.9715628);
            activeDelivery.setCurrentLongitude(80.043079);
            activeDelivery.setCurrentBearing(40.0);
            activeDelivery.setLastLocationUpdate(LocalDateTime.now());
            var route1 = routeService.calculateRoute(12.9715628, 80.043079, 12.9860, 80.0650);
            activeDelivery.setDistanceKm(route1.getDistanceKm());
            activeDelivery.setRouteData(route1.getRouteDataJson());
            deliveryRepository.save(activeDelivery);

            // Create Food Request 2 (Open unassigned run on the board for testing claim)
            FoodRequest r2 = new FoodRequest();
            r2.setFoodDonation(d2);
            r2.setReceiver(receiver);
            r2.setQuantityRequested(BigDecimal.valueOf(20));
            r2.setRequestTime(LocalDateTime.now().minusMinutes(10));
            r2.setStatus(RequestStatus.ACCEPTED);
            r2 = requestRepository.save(r2);

            PickupDelivery openDelivery = new PickupDelivery();
            openDelivery.setFoodRequest(r2);
            openDelivery.setVolunteer(null); // Unassigned -> shows in Open Runs Board
            openDelivery.setStatus(DeliveryStatus.ASSIGNED);
            openDelivery.setPickupLocation("Chennai Institute of Technology, Food Plaza, Kundrathur");
            openDelivery.setDeliveryLocation("Hope Food Rescue Center, Kundrathur Main Road, Chennai");
            openDelivery.setPickupTime(LocalDateTime.now().plusHours(1));
            var route2 = routeService.calculateRoute(12.9715628, 80.043079, 12.9840, 80.0620);
            openDelivery.setDistanceKm(route2.getDistanceKm());
            openDelivery.setRouteData(route2.getRouteDataJson());
            deliveryRepository.save(openDelivery);
        }
    }
}
