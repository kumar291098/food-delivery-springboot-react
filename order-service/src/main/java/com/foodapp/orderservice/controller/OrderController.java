package com.foodapp.orderservice.controller;


import com.foodapp.orderservice.dto.OrderRequest;
import com.foodapp.orderservice.dto.OrderResponse;
import com.foodapp.orderservice.dto.OrderSummaryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest orderRequest) {
        // Logic to create an order based on the request data
        OrderResponse response = new OrderResponse("12345", "SUCCESS", "Order created successfully");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{Id}")
    public ResponseEntity<OrderResponse> getOrderStatus(@PathVariable String Id) {
        // Logic to retrieve order status based on orderId
        OrderResponse response = new OrderResponse(Id, "IN_PROGRESS", "Order is being prepared");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @GetMapping("/user/{userId}")
    public List<OrderSummaryResponse> getUserOrders(@PathVariable Long userId) {
        // Logic to retrieve all orders for a specific user
        List<OrderSummaryResponse> orders = new ArrayList<>();
        orders.add(new OrderSummaryResponse(1L, 101L, 25.50, "DELIVERED"));
        orders.add(new OrderSummaryResponse(2L, 102L, 15.00, "IN_PROGRESS"));
        return new ResponseEntity<>(orders, HttpStatus.OK).getBody();
    }

}