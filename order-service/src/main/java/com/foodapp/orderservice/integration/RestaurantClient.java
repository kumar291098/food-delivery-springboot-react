package com.foodapp.orderservice.integration;

import com.foodapp.orderservice.dto.RestaurantResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class RestaurantClient {

    private static final Logger log = LoggerFactory.getLogger(RestaurantClient.class);

    private final RestClient restClient;

    public RestaurantClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl("http://restaurant-service").build();
    }

    public RestaurantResponse getRestaurantById(Long restaurantId) {
        try {
            return restClient.get()
                    .uri("/api/restaurants/{id}", restaurantId)
                    .retrieve()
                    .body(RestaurantResponse.class);
        } catch (Exception ex) {
            log.error("Failed to fetch restaurant details for ID {}: {}", restaurantId, ex.getMessage());
            throw new RuntimeException("Restaurant service is currently unavailable or restaurant not found: " + ex.getMessage(), ex);
        }
    }
}
