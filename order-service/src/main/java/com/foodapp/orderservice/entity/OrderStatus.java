package com.foodapp.orderservice.entity;

public enum OrderStatus {
    PENDING,
    ACCEPTED,
    PREPARING,
    SEARCHING_FOR_DELIVERY_PARTNER,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}