package com.foodapp.orderservice.config;

import org.springframework.cloud.client.loadbalancer.DeferringLoadBalancerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class HttpClientConfig {

    @Bean
    RestClient restaurantRestClient(RestClient.Builder restClientBuilder, DeferringLoadBalancerInterceptor loadBalancerInterceptor) {
        return restClientBuilder
                .requestInterceptor(loadBalancerInterceptor)
                .baseUrl("http://restaurant-service")
                .build();
    }
}
