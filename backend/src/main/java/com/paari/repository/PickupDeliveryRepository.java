package com.paari.repository;

import com.paari.entity.DeliveryStatus;
import com.paari.entity.PickupDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PickupDeliveryRepository extends JpaRepository<PickupDelivery, Long> {
    List<PickupDelivery> findByVolunteerId(Long volunteerId);
    List<PickupDelivery> findByVolunteerUserId(Long userId);
    List<PickupDelivery> findByStatus(DeliveryStatus status);
    
    @Query("SELECT pd FROM PickupDelivery pd WHERE pd.volunteer IS NULL AND pd.status = 'ASSIGNED'")
    List<PickupDelivery> findUnassignedTasks();
}
