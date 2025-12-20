package com.javabite.javabite_backend.service;

import com.javabite.javabite_backend.model.Notification;
import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.model.Role;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.repository.NotificationRepository;
import com.javabite.javabite_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // 🔥 Create notification for waiters when order is ready
    public void notifyWaitersOrderReady(Order order) {
        List<User> waiters = userRepository.findByRole(Role.WAITER);

        for (User waiter : waiters) {
            Notification notification = new Notification();
            notification.setId(UUID.randomUUID().toString());
            notification.setUserId(waiter.getId());
            notification.setOrderId(order.getId());
            notification.setTitle("Order Ready to Serve");
            notification.setMessage("Order #" + order.getId().substring(0, 8) +
                    " is ready to serve at Table. Please pick it up.");
            notification.setType("ORDER_READY");
            notification.setRead(false);
            notification.setCreatedAt(Instant.now());

            notificationRepository.save(notification);
        }
    }

    // 🔥 Create notification for chefs when admin assigns order
    public void notifyChefOrderAssigned(Order order, User chef) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID().toString());
        notification.setUserId(chef.getId());
        notification.setOrderId(order.getId());
        notification.setTitle("Order Assigned to You");
        notification.setMessage("Order #" + order.getId().substring(0, 8) +
                " has been assigned to you by Admin. Please start preparation.");
        notification.setType("ORDER_ASSIGNED");
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        notificationRepository.save(notification);
    }

    // 🔥 Get notifications for user
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 🔥 Mark notification as read
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
}