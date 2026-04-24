package com.foodapp.orderservice.service;

import com.foodapp.orderservice.dto.OrderItemRequest;
import com.foodapp.orderservice.dto.OrderRequest;
import com.foodapp.orderservice.dto.OrderResponse;
import com.foodapp.orderservice.dto.OrderSummaryResponse;
import com.foodapp.orderservice.entity.Order;
import com.foodapp.orderservice.entity.OrderItem;
import com.foodapp.orderservice.entity.OrderStatus;
import com.foodapp.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setRestaurantId(request.getRestaurantId());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setInstructions(request.getInstructions());
        order.setStatus(OrderStatus.PENDING);

        double totalAmount = 0.0;

        for (OrderItemRequest itemRequest : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setMenuItemId(itemRequest.getMenuItemId());
            item.setQuantity(itemRequest.getQuantity());

            // Note: Since we don't have a Restaurant/Menu service yet to fetch the real price,
            // we are mocking the price of each item as 15.00 for now.
            double itemPrice = 15.00;
            item.setPrice(itemPrice);

            totalAmount += (itemPrice * itemRequest.getQuantity());

            // Use the helper method from the Order entity to link them together
            order.addItem(item);
        }

        order.setTotalAmount(totalAmount);

        // This single line saves the Order AND all OrderItems to PostgreSQL
        // because of CascadeType.ALL in your entity.
        Order savedOrder = orderRepository.save(order);

        return new OrderResponse(
                savedOrder.getId().toString(),
                savedOrder.getStatus().name(),
                "Order created successfully"
        );
    }

    public OrderResponse getOrderStatus(Long orderId) {
        // Fetch from database or throw a simple exception if missing
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        return new OrderResponse(
                order.getId().toString(),
                order.getStatus().name(),
                "Order retrieved successfully"
        );
    }

    public List<OrderSummaryResponse> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        List<OrderSummaryResponse> summaryList = new ArrayList<>();

        for (Order order : orders) {
            summaryList.add(new OrderSummaryResponse(
                    order.getId(),
                    order.getRestaurantId(),
                    order.getTotalAmount(),
                    order.getStatus().name()
            ));
        }

        return summaryList;
    }
}