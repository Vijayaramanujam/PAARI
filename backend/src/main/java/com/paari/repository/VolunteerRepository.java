package com.paari.repository;

import com.paari.entity.User;
import com.paari.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByUser(User user);
    Optional<Volunteer> findByUserId(Long userId);
    List<Volunteer> findByAvailabilityStatus(Boolean availabilityStatus);
}
