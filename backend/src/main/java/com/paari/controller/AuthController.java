package com.paari.controller;

import com.paari.dto.JwtResponse;
import com.paari.dto.LoginRequest;
import com.paari.dto.RegisterRequest;
import com.paari.entity.*;
import com.paari.repository.*;
import com.paari.security.JwtUtils;
import com.paari.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ReceiverRepository receiverRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(item -> item.getAuthority().replace("ROLE_", ""))
                .orElse("DONOR");

        return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getName(), role));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Email is already in use!");
            return ResponseEntity.badRequest().body(err);
        }

        // Create new user's account
        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPhone(signUpRequest.getPhone());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(signUpRequest.getRole());
        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);

        // Map role specific profiles
        switch (signUpRequest.getRole()) {
            case DONOR:
                Donor donor = new Donor();
                donor.setUser(user);
                donor.setOrganizationName(signUpRequest.getOrganizationName() != null ? signUpRequest.getOrganizationName() : signUpRequest.getName());
                donor.setAddress(signUpRequest.getAddress() != null ? signUpRequest.getAddress() : "Default Address");
                donor.setFoodTypeOffered(signUpRequest.getFoodTypeOffered());
                donor.setLatitude(signUpRequest.getLatitude() != null ? signUpRequest.getLatitude() : 0.0);
                donor.setLongitude(signUpRequest.getLongitude() != null ? signUpRequest.getLongitude() : 0.0);
                donorRepository.save(donor);
                break;
            case RECEIVER:
                Receiver receiver = new Receiver();
                receiver.setUser(user);
                receiver.setOrganizationName(signUpRequest.getOrganizationName() != null ? signUpRequest.getOrganizationName() : signUpRequest.getName());
                receiver.setAddress(signUpRequest.getAddress() != null ? signUpRequest.getAddress() : "Default Address");
                receiver.setAreaServed(signUpRequest.getAreaServed());
                receiver.setLatitude(signUpRequest.getLatitude() != null ? signUpRequest.getLatitude() : 0.0);
                receiver.setLongitude(signUpRequest.getLongitude() != null ? signUpRequest.getLongitude() : 0.0);
                receiverRepository.save(receiver);
                break;
            case VOLUNTEER:
                Volunteer volunteer = new Volunteer();
                volunteer.setUser(user);
                volunteer.setVehicleType(signUpRequest.getVehicleType());
                volunteer.setVehicleNumber(signUpRequest.getVehicleNumber());
                volunteer.setAvailabilityStatus(true);
                volunteerRepository.save(volunteer);
                break;
            case ADMIN:
                // No extra profile table for Admin in base schema
                break;
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }
}
