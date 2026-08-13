package com.paari.repository;

import com.paari.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByTargetUserId(Long targetUserId);
    List<Feedback> findByUserId(Long userId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.targetUser.id = :userId")
    Double getAverageRatingForUser(Long userId);
}
