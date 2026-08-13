package com.paari.service;

import com.paari.entity.*;
import com.paari.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class LogisticsService {

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private FoodRequestRepository requestRepository;

    @Autowired
    private PickupDeliveryRepository deliveryRepository;

    @Autowired
    private ReceiverRepository receiverRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private RouteOptimizationService routeService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public FoodRequest createRequest(Long donationId, Long receiverUserId, BigDecimal quantity) {
        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found"));

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new RuntimeException("Donation is not available for requests");
        }

        Receiver receiver = receiverRepository.findByUserId(receiverUserId)
                .orElseThrow(() -> new RuntimeException("Receiver profile not found"));

        FoodRequest request = new FoodRequest();
        request.setFoodDonation(donation);
        request.setReceiver(receiver);
        request.setQuantityRequested(quantity);
        request.setStatus(RequestStatus.PENDING);

        request = requestRepository.save(request);

        // Notify donor of incoming request
        notificationService.createNotification(
                donation.getDonor().getUser(),
                "New food claim request from " + receiver.getOrganizationName() + " for " + quantity + " units.",
                NotificationType.MATCH
        );

        return request;
    }

    @Transactional
    public FoodRequest decideRequest(Long requestId, boolean accept) {
        FoodRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request has already been processed");
        }

        FoodDonation donation = request.getFoodDonation();

        if (accept) {
            request.setStatus(RequestStatus.ACCEPTED);
            donation.setStatus(DonationStatus.REQUESTED);
            donationRepository.save(donation);

            // Reject other pending requests for this same donation automatically
            requestRepository.findByFoodDonationId(donation.getId())
                    .forEach(r -> {
                        if (r.getStatus() == RequestStatus.PENDING) {
                            r.setStatus(RequestStatus.REJECTED);
                            requestRepository.save(r);
                            
                            // Notify other receivers of rejection
                            notificationService.createNotification(
                                    r.getReceiver().getUser(),
                                    "Your request for " + donation.getFoodType() + " was rejected (claimed by another receiver).",
                                    NotificationType.ALERT
                            );
                        }
                    });

            // Create logistics Delivery Task
            PickupDelivery delivery = new PickupDelivery();
            delivery.setFoodRequest(request);
            delivery.setPickupLocation(donation.getPickupAddress());
            delivery.setDeliveryLocation(request.getReceiver().getAddress());
            delivery.setStatus(DeliveryStatus.ASSIGNED); // Needs volunteer assignment

            // Geolocation computations
            double donationLat = donation.getLatitude() != null ? donation.getLatitude() : 0.0;
            double donationLng = donation.getLongitude() != null ? donation.getLongitude() : 0.0;
            double receiverLat = request.getReceiver().getLatitude() != null ? request.getReceiver().getLatitude() : 0.0;
            double receiverLng = request.getReceiver().getLongitude() != null ? request.getReceiver().getLongitude() : 0.0;

            RouteOptimizationService.RouteDetails route = routeService.calculateRoute(
                    donationLat, donationLng, receiverLat, receiverLng
            );

            delivery.setDistanceKm(route.getDistanceKm());
            delivery.setRouteData(route.getRouteDataJson());
            deliveryRepository.save(delivery);

            // Notify Receiver of Acceptance
            notificationService.createNotification(
                    request.getReceiver().getUser(),
                    "Your request for " + donation.getFoodType() + " has been ACCEPTED. A delivery task is being assigned.",
                    NotificationType.MATCH
            );

        } else {
            request.setStatus(RequestStatus.REJECTED);
            
            // Notify Receiver of Rejection
            notificationService.createNotification(
                    request.getReceiver().getUser(),
                    "Your request for " + donation.getFoodType() + " was rejected by the donor.",
                    NotificationType.ALERT
            );
        }

        return requestRepository.save(request);
    }

    @Transactional
    public PickupDelivery assignVolunteer(Long deliveryId, Long volunteerUserId) {
        PickupDelivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery task not found"));

        if (delivery.getVolunteer() != null) {
            throw new RuntimeException("Volunteer already assigned to this delivery");
        }

        Volunteer volunteer = volunteerRepository.findByUserId(volunteerUserId)
                .orElseThrow(() -> new RuntimeException("Volunteer profile not found"));

        delivery.setVolunteer(volunteer);
        delivery = deliveryRepository.save(delivery);

        // Notify Receiver and Donor
        notificationService.createNotification(
                delivery.getFoodRequest().getReceiver().getUser(),
                "Volunteer " + volunteer.getUser().getName() + " has accepted to deliver your food order.",
                NotificationType.DELIVERY
        );
        notificationService.createNotification(
                delivery.getFoodRequest().getFoodDonation().getDonor().getUser(),
                "Volunteer " + volunteer.getUser().getName() + " has been assigned to pick up your food donation.",
                NotificationType.PICKUP
        );

        return delivery;
    }

    @Transactional
    public PickupDelivery updateDeliveryStatus(Long deliveryId, DeliveryStatus newStatus) {
        PickupDelivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery task not found"));

        delivery.setStatus(newStatus);
        
        FoodDonation donation = delivery.getFoodRequest().getFoodDonation();
        FoodRequest request = delivery.getFoodRequest();

        if (newStatus == DeliveryStatus.PICKED_UP) {
            delivery.setPickupTime(LocalDateTime.now());
            donation.setStatus(DonationStatus.PICKED_UP);
            donationRepository.save(donation);

            // Send notification alerts
            notificationService.createNotification(
                    request.getReceiver().getUser(),
                    "Your food rescue has been picked up & is on the way (Volunteer: " + delivery.getVolunteer().getUser().getName() + ").",
                    NotificationType.DELIVERY
            );
        } else if (newStatus == DeliveryStatus.DELIVERED) {
            delivery.setDeliveryTime(LocalDateTime.now());
            donation.setStatus(DonationStatus.COMPLETED);
            request.setStatus(RequestStatus.COMPLETED);
            
            donationRepository.save(donation);
            requestRepository.save(request);

            // Notify everyone
            notificationService.createNotification(
                    request.getReceiver().getUser(),
                    "Food rescue has been DELIVERED successfully! Please leave feedback for the donor and volunteer.",
                    NotificationType.DELIVERY
            );
            notificationService.createNotification(
                    donation.getDonor().getUser(),
                    "Food rescue completed! Your donation has reached " + request.getReceiver().getOrganizationName() + ".",
                    NotificationType.SYSTEM
            );
        } else if (newStatus == DeliveryStatus.CANCELLED) {
            // Revert donation and request back to allow re-scheduling
            donation.setStatus(DonationStatus.AVAILABLE);
            request.setStatus(RequestStatus.PENDING);
            delivery.setVolunteer(null); // Unassign volunteer

            donationRepository.save(donation);
            requestRepository.save(request);
        }

        return deliveryRepository.save(delivery);
    }
}
