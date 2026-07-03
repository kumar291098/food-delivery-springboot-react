package com.foodapp.orderservice.entity;

public enum OrderStatus {
    PENDING,
    ACCEPTED,
    PREPARING,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}