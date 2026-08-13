package com.paari.repository;

import com.paari.entity.FoodRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FoodRequestRepository extends JpaRepository<FoodRequest, Long> {
    List<FoodRequest> findByReceiverId(Long receiverId);
    List<FoodRequest> findByReceiverUserId(Long userId);
    List<FoodRequest> findByFoodDonationDonorId(Long donorId);
    List<FoodRequest> findByFoodDonationDonorUserId(Long userId);
    List<FoodRequest> findByFoodDonationId(Long donationId);
}
