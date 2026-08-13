package com.paari.repository;

import com.paari.entity.Receiver;
import com.paari.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReceiverRepository extends JpaRepository<Receiver, Long> {
    Optional<Receiver> findByUser(User user);
    Optional<Receiver> findByUserId(Long userId);
}
