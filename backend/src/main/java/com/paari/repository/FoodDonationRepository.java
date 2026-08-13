package com.paari.repository;

import com.paari.entity.DonationStatus;
import com.paari.entity.FoodDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {
    List<FoodDonation> findByStatus(DonationStatus status);
    List<FoodDonation> findByDonorId(Long donorId);
    List<FoodDonation> findByDonorUserId(Long userId);
    List<FoodDonation> findByStatusAndExpiryTimeAfter(DonationStatus status, LocalDateTime now);
    List<FoodDonation> findByExpiryTimeBeforeAndStatus(LocalDateTime time, DonationStatus status);

    @Query("SELECT fd FROM FoodDonation fd WHERE fd.status = 'AVAILABLE' AND fd.expiryTime > :now")
    List<FoodDonation> findAvailableActive(LocalDateTime now);
}
