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
        if (!userRepository.existsByEmail("donor@paari.org")) {
            User donorUser = new User();
            donorUser.setName("Baker's Delight");
            donorUser.setEmail("donor@paari.org");
            donorUser.setPhone("2345678901");
            donorUser.setPassword(encoder.encode("donor123"));
            donorUser.setRole(Role.DONOR);
            donorUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(donorUser);

            Donor donor = new Donor();
            donor.setUser(donorUser);
            donor.setOrganizationName("Baker's Delight Bakery");
            donor.setAddress("123 Bakery Lane, Food City");
            donor.setFoodTypeOffered("Flour and Pastries");
            donor.setRating(4.5f);
            donor.setLatitude(12.9716); // Bangalore Center approx
            donor.setLongitude(77.5946);
            donorRepository.save(donor);

            // Seed sample food donations
            FoodDonation donation1 = new FoodDonation();
            donation1.setDonor(donor);
            donation1.setFoodType("Fresh Chocolate Croissants");
            donation1.setQuantity(BigDecimal.valueOf(25));
            donation1.setDescription("Freshly baked this morning, excess stock from daily bake.");
            donation1.setPickupAddress("123 Bakery Lane, Food City");
            donation1.setPickupTime(LocalDateTime.now().plusHours(1));
            donation1.setExpiryTime(LocalDateTime.now().plusHours(12));
            donation1.setStatus(DonationStatus.AVAILABLE);
            donation1.setLatitude(12.9716);
            donation1.setLongitude(77.5946);
            donationRepository.save(donation1);

            FoodDonation donation2 = new FoodDonation();
            donation2.setDonor(donor);
            donation2.setFoodType("Whole Wheat Bread Loaves");
            donation2.setQuantity(BigDecimal.valueOf(10));
            donation2.setDescription("10 loaves of organic unsliced whole wheat bread.");
            donation2.setPickupAddress("123 Bakery Lane, Food City");
            donation2.setPickupTime(LocalDateTime.now().plusHours(2));
            donation2.setExpiryTime(LocalDateTime.now().plusHours(24));
            donation2.setStatus(DonationStatus.AVAILABLE);
            donation2.setLatitude(12.9716);
            donation2.setLongitude(77.5946);
            donationRepository.save(donation2);
        }

        // 3. Seed Receiver (NGO)
        if (!userRepository.existsByEmail("ngo@paari.org")) {
            User receiverUser = new User();
            receiverUser.setName("Hope Shelter");
            receiverUser.setEmail("ngo@paari.org");
            receiverUser.setPhone("3456789012");
            receiverUser.setPassword(encoder.encode("ngo123"));
            receiverUser.setRole(Role.RECEIVER);
            receiverUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(receiverUser);

            Receiver receiver = new Receiver();
            receiver.setUser(receiverUser);
            receiver.setOrganizationName("Hope Food Rescue Shelter");
            receiver.setAddress("456 Care Road, Food City");
            receiver.setAreaServed("Downtown Food City");
            receiver.setRating(4.8f);
            receiver.setLatitude(12.9750); // Near Bangalore Center approx
            receiver.setLongitude(77.6000);
            receiverRepository.save(receiver);
        }

        // 4. Seed Volunteer
        if (!userRepository.existsByEmail("volunteer@paari.org")) {
            User volunteerUser = new User();
            volunteerUser.setName("John Deliverer");
            volunteerUser.setEmail("volunteer@paari.org");
            volunteerUser.setPhone("4567890123");
            volunteerUser.setPassword(encoder.encode("volunteer123"));
            volunteerUser.setRole(Role.VOLUNTEER);
            volunteerUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(volunteerUser);

            Volunteer volunteer = new Volunteer();
            volunteer.setUser(volunteerUser);
            volunteer.setVehicleType("Motorcycle");
            volunteer.setVehicleNumber("MH-12-AB-9876");
            volunteer.setAvailabilityStatus(true);
            volunteer.setRating(4.2f);
            volunteerRepository.save(volunteer);
        }
    }
}
