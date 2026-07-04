package com.foodapp.orderservice.integration;

import com.foodapp.orderservice.dto.OrderNotificationRequest;
import com.foodapp.orderservice.entity.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClient.class);

    private final RestClient restClient;

    public NotificationClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl("http://notification-service").build();
    }

    public void sendOrderUpdate(Order order) {
        OrderNotificationRequest request = new OrderNotificationRequest();
        request.setOrderId(order.getId());
        request.setUserId(order.getUserId());
        request.setCustomerEmail(order.getCustomerEmail());
        request.setCustomerPhoneNumber(order.getCustomerPhoneNumber());
        request.setStatus(order.getStatus().name());

        try {
            restClient.post()
                    .uri("/api/notifications/order-update")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            // Keep order operations available even if the notification service is down.
            log.warn("Notification service call failed for order {}: {}", order.getId(), ex.getMessage());
        }
    }
}
