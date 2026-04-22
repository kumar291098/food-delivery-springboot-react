package com.foodapp.orderservice.controller;


import com.foodapp.orderservice.dto.OrderResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/orders")
public class OrderController {
    @GetMapping
    public ResponseEntity<OrderResponse> createOrder() {
        // Logic to create an order
        OrderResponse response = new OrderResponse("12345", "SUCCESS", "Order created successfully");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
