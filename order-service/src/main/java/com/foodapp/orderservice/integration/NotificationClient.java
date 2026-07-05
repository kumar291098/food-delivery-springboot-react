package com.foodapp.orderservice.integration;

import com.foodapp.orderservice.dto.OrderNotificationRequest;
import com.foodapp.orderservice.entity.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClient.class);

    private final RabbitTemplate rabbitTemplate;

    public NotificationClient(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendOrderUpdate(Order order) {
        OrderNotificationRequest request = new OrderNotificationRequest();
        request.setOrderId(order.getId());
        request.setUserId(order.getUserId());
        request.setCustomerEmail(order.getCustomerEmail());
        request.setCustomerPhoneNumber(order.getCustomerPhoneNumber());
        request.setStatus(order.getStatus().name());

        try {
            log.info("Publishing order status update event to RabbitMQ for order ID: {}", order.getId());
            rabbitTemplate.convertAndSend("order-exchange", "order.status.update", request);
        } catch (Exception ex) {
            log.error("Failed to publish order event to RabbitMQ for order ID {}: {}", order.getId(), ex.getMessage());
        }
    }
}
