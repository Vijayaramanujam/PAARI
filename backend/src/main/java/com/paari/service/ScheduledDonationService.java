package com.paari.service;

import com.paari.entity.DonationStatus;
import com.paari.entity.FoodDonation;
import com.paari.repository.FoodDonationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduledDonationService {
    private static final Logger logger = LoggerFactory.getLogger(ScheduledDonationService.class);

    @Autowired
    private FoodDonationRepository donationRepository;

    // Runs every 60 seconds
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkExpiredDonations() {
        LocalDateTime now = LocalDateTime.now();
        List<FoodDonation> expiredList = donationRepository.findByExpiryTimeBeforeAndStatus(now, DonationStatus.AVAILABLE);

        if (!expiredList.isEmpty()) {
            logger.info("Found {} expired food donations. Auto-marking them as EXPIRED.", expiredList.size());
            for (FoodDonation donation : expiredList) {
                donation.setStatus(DonationStatus.EXPIRED);
                donationRepository.save(donation);
            }
        }
    }
}
