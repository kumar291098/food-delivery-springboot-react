package com.foodapp.orderservice.integration;

import com.foodapp.orderservice.dto.RestaurantResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
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

    @CircuitBreaker(name = "restaurantService", fallbackMethod = "getRestaurantByIdFallback")
    public RestaurantResponse getRestaurantById(Long restaurantId) {
        return restClient.get()
                .uri("/api/restaurants/{id}", restaurantId)
                .retrieve()
                .body(RestaurantResponse.class);
    }

    public RestaurantResponse getRestaurantByIdFallback(Long restaurantId, Throwable t) {
        log.error("Circuit Breaker fallback triggered for restaurant ID {} due to exception: {}", restaurantId, t.getMessage());
        throw new RuntimeException("Restaurant service is currently busy or down. Please try again in a few moments.");
    }
}
