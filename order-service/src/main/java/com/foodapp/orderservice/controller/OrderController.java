package com.foodapp.orderservice.controller;

import com.foodapp.orderservice.dto.OrderRequest;
import com.foodapp.orderservice.dto.OrderResponse;
import com.foodapp.orderservice.dto.OrderSummaryResponse;
import com.foodapp.orderservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    // Constructor injection is the cleanest way to wire dependencies
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest orderRequest) {
        // Now delegating the actual work to the service layer
        OrderResponse response = orderService.createOrder(orderRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderStatus(@PathVariable Long orderId) {
        OrderResponse response = orderService.getOrderStatus(orderId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderSummaryResponse>> getUserOrders(@PathVariable Long userId) {
        List<OrderSummaryResponse> orders = orderService.getUserOrders(userId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
}