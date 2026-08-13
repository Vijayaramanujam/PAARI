package com.paari.controller;

import com.paari.entity.*;
import com.paari.repository.UserRepository;
import com.paari.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @PostMapping
    public ResponseEntity<?> submitFeedback(
            @RequestParam Long targetUserId,
            @RequestParam String type,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment) {

        User user = getAuthenticatedUser();
        User targetUser = userRepository.findById(targetUserId).orElse(null);

        if (targetUser == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Target user not found");
            return ResponseEntity.status(404).body(err);
        }

        if (rating < 1 || rating > 5) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Rating score must be between 1 and 5");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            Feedback feedback = feedbackService.submitFeedback(user, targetUser, type, rating, comment);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
