package com.paari.service;

import com.paari.entity.*;
import com.paari.repository.FeedbackRepository;
import com.paari.repository.DonorRepository;
import com.paari.repository.ReceiverRepository;
import com.paari.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ReceiverRepository receiverRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Transactional
    public Feedback submitFeedback(User fromUser, User targetUser, String type, Integer rating, String comment) {
        Feedback feedback = new Feedback();
        feedback.setUser(fromUser);
        feedback.setTargetUser(targetUser);
        feedback.setType(type);
        feedback.setRating(rating);
        feedback.setComment(comment);
        feedback = feedbackRepository.save(feedback);

        // Recompute average rating for target user based on role
        Double avgRating = feedbackRepository.getAverageRatingForUser(targetUser.getId());
        float ratingValue = avgRating != null ? avgRating.floatValue() : 0.0f;

        if (targetUser.getRole() == Role.DONOR) {
            donorRepository.findByUserId(targetUser.getId()).ifPresent(d -> {
                d.setRating(ratingValue);
                donorRepository.save(d);
            });
        } else if (targetUser.getRole() == Role.RECEIVER) {
            receiverRepository.findByUserId(targetUser.getId()).ifPresent(r -> {
                r.setRating(ratingValue);
                receiverRepository.save(r);
            });
        } else if (targetUser.getRole() == Role.VOLUNTEER) {
            volunteerRepository.findByUserId(targetUser.getId()).ifPresent(v -> {
                v.setRating(ratingValue);
                volunteerRepository.save(v);
            });
        }

        return feedback;
    }
}
