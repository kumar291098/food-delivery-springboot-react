package com.foodapp.paymentservice.service;

import com.foodapp.paymentservice.dto.PaymentRequest;
import com.foodapp.paymentservice.dto.PaymentResponse;
import com.foodapp.paymentservice.entity.Payment;
import com.foodapp.paymentservice.entity.PaymentMethod;
import com.foodapp.paymentservice.entity.PaymentStatus;
import com.foodapp.paymentservice.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Process payment for an order
     */
    public PaymentResponse processPayment(PaymentRequest request) {
        // Validate input
        if (request.getAmount() <= 0) {
            throw new IllegalArgumentException("Invalid amount: " + request.getAmount());
        }

        // Create payment entity
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedDate(LocalDateTime.now());
        payment.setUpdatedDate(LocalDateTime.now());

        // Simulate payment processing (in real scenario, integrate with payment gateway)
        if (validatePaymentDetails(request)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(generateTransactionId());
            payment.setNotes("Payment processed successfully");
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setNotes("Payment validation failed");
        }

        payment.setUpdatedDate(LocalDateTime.now());

        // Save payment
        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    /**
     * Get payment details by payment ID
     */
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
        return mapToResponse(payment);
    }

    /**
     * Get payment details by order ID
     */
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for Order ID: " + orderId));
        return mapToResponse(payment);
    }

    /**
     * Get all payments for a user
     */
    public List<PaymentResponse> getUserPayments(Long userId) {
        List<Payment> payments = paymentRepository.findByUserId(userId);
        return payments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Refund a payment
     */
    public PaymentResponse refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));

        if (!payment.getStatus().equals(PaymentStatus.SUCCESS)) {
            throw new IllegalStateException("Only successful payments can be refunded");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setUpdatedDate(LocalDateTime.now());
        payment.setNotes("Payment refunded successfully");

        Payment refundedPayment = paymentRepository.save(payment);
        return mapToResponse(refundedPayment);
    }

    /**
     * Cancel a payment
     */
    public PaymentResponse cancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));

        if (payment.getStatus().equals(PaymentStatus.SUCCESS) || 
            payment.getStatus().equals(PaymentStatus.REFUNDED)) {
            throw new IllegalStateException("Cannot cancel a completed or refunded payment");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setUpdatedDate(LocalDateTime.now());
        payment.setNotes("Payment cancelled by user");

        Payment cancelledPayment = paymentRepository.save(payment);
        return mapToResponse(cancelledPayment);
    }

    /**
     * Validate payment details (mock validation)
     */
    private boolean validatePaymentDetails(PaymentRequest request) {
        // In real scenario, integrate with payment gateway
        // For now, we'll just do basic validation
        if (request.getCardNumber() == null || request.getCardNumber().length() < 13) {
            return false;
        }
        if (request.getCvv() == null || request.getCvv().length() < 3) {
            return false;
        }
        return true;
    }

    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId() {
        return "TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Convert Payment entity to PaymentResponse DTO
     */
    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setOrderId(payment.getOrderId());
        response.setUserId(payment.getUserId());
        response.setAmount(payment.getAmount());
        response.setStatus(payment.getStatus().toString());
        response.setPaymentMethod(payment.getPaymentMethod().toString());
        response.setTransactionId(payment.getTransactionId());
        response.setCreatedDate(payment.getCreatedDate());
        response.setUpdatedDate(payment.getUpdatedDate());
        return response;
    }
}

