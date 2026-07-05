package com.foodapp.notificationservice.listener;

import com.foodapp.notificationservice.dto.OrderNotificationRequest;
import com.foodapp.notificationservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);

    private final NotificationService notificationService;

    public OrderEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "order-notification-queue")
    public void handleOrderUpdate(OrderNotificationRequest request) {
        log.info("Received order status update event from RabbitMQ for order ID: {}", request.getOrderId());
        try {
            notificationService.sendOrderUpdate(request);
        } catch (Exception ex) {
            log.error("Failed to process order update event for order ID {}: {}", request.getOrderId(), ex.getMessage());
        }
    }
}
