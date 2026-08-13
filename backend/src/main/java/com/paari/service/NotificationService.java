package com.paari.service;

import com.paari.entity.Notification;
import com.paari.entity.NotificationType;
import com.paari.entity.User;
import com.paari.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Value("${paari.mail.fromAddress:noreply@paari.org}")
    private String fromAddress;

    public void sendEmailMock(String to, String subject, String body) {
        // Logs outbound email to console in dev mode
        logger.info("\n-----------------------------------------------\n"
                + "[Mock Mail SMTP Gateway]\n"
                + "From: {}\n"
                + "To: {}\n"
                + "Subject: {}\n"
                + "Body: {}\n"
                + "-----------------------------------------------",
                fromAddress, to, subject, body);
    }

    public void createNotification(User user, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        // Send email mock
        sendEmailMock(user.getEmail(), "PAARI Notification Alert - " + type, message);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }
}
