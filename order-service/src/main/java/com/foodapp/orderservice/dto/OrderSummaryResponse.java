package com.foodapp.orderservice.dto;

public class OrderSummaryResponse {
    private Long orderId;
    private Long restaurantId;
    private double totalAmount;
    private String status;

    public OrderSummaryResponse(long l, long l1, double v, String delivered) {
        this.orderId=l;
        this.restaurantId=l1;
        this.totalAmount=v;
        this.status=delivered;
    }

//    getters & setters

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
