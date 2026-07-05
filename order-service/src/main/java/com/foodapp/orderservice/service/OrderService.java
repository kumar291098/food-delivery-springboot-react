package com.foodapp.orderservice.service;

import com.foodapp.orderservice.dto.OrderItemRequest;
import com.foodapp.orderservice.dto.OrderRequest;
import com.foodapp.orderservice.dto.OrderResponse;
import com.foodapp.orderservice.dto.OrderSummaryResponse;
import com.foodapp.orderservice.entity.Order;
import com.foodapp.orderservice.entity.OrderItem;
import com.foodapp.orderservice.entity.OrderStatus;
import com.foodapp.orderservice.dto.RestaurantResponse;
import com.foodapp.orderservice.dto.MenuItemResponse;
import com.foodapp.orderservice.integration.NotificationClient;
import com.foodapp.orderservice.integration.RestaurantClient;
import com.foodapp.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final NotificationClient notificationClient;
    private final RestaurantClient restaurantClient;

    public OrderService(OrderRepository orderRepository, NotificationClient notificationClient, RestaurantClient restaurantClient) {
        this.orderRepository = orderRepository;
        this.notificationClient = notificationClient;
        this.restaurantClient = restaurantClient;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // Fetch and validate restaurant info dynamically
        RestaurantResponse restaurant = restaurantClient.getRestaurantById(request.getRestaurantId());
        if (restaurant == null) {
            throw new IllegalArgumentException("Restaurant not found with id: " + request.getRestaurantId());
        }
        if (restaurant.getActive() != null && !restaurant.getActive()) {
            throw new IllegalArgumentException("Restaurant with id: " + request.getRestaurantId() + " is currently inactive");
        }

        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setRestaurantId(request.getRestaurantId());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setInstructions(request.getInstructions());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhoneNumber(request.getCustomerPhoneNumber());
        order.setStatus(OrderStatus.PENDING);

        double totalAmount = 0.0;

        for (OrderItemRequest itemRequest : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setMenuItemId(itemRequest.getMenuItemId());
            item.setQuantity(itemRequest.getQuantity());

            // Retrieve price and availability dynamically from restaurant menu
            MenuItemResponse menuItem = restaurant.getMenuItems().stream()
                    .filter(m -> m.getId().equals(itemRequest.getMenuItemId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Menu item " + itemRequest.getMenuItemId() + " not found in restaurant menu"));

            if (menuItem.getAvailable() != null && !menuItem.getAvailable()) {
                throw new IllegalArgumentException("Menu item " + menuItem.getName() + " is currently unavailable");
            }

            double itemPrice = menuItem.getPrice() != null ? menuItem.getPrice() : 0.0;
            item.setPrice(itemPrice);

            totalAmount += (itemPrice * itemRequest.getQuantity());

            // Use the helper method from the Order entity to link them together
            order.addItem(item);
        }

        order.setTotalAmount(totalAmount);

        // This single line saves the Order AND all OrderItems to PostgreSQL
        // because of CascadeType.ALL in your entity.
        Order savedOrder = orderRepository.save(order);
        notificationClient.sendOrderUpdate(savedOrder);

        return new OrderResponse(
                savedOrder.getId().toString(),
                savedOrder.getStatus().name(),
                "Order created successfully"
        );
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderStatus(Long orderId) {
        Order order = findOrder(orderId);

        return new OrderResponse(
                order.getId().toString(),
                order.getStatus().name(),
                "Order retrieved successfully"
        );
    }

    @Transactional(readOnly = true)
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

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status, String driverEmail, String driverName) {
        Order order = findOrder(orderId);
        order.setStatus(OrderStatus.valueOf(status.trim().toUpperCase()));
        if (driverEmail != null) {
            order.setDriverEmail(driverEmail);
        }
        if (driverName != null) {
            order.setDriverName(driverName);
        }
        Order updatedOrder = orderRepository.save(order);
        notificationClient.sendOrderUpdate(updatedOrder);

        return new OrderResponse(
                updatedOrder.getId().toString(),
                updatedOrder.getStatus().name(),
                "Order status updated successfully"
        );
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    private Order findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }
}
