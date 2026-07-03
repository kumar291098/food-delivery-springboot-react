package com.foodapp.paymentservice.controller;

import com.foodapp.paymentservice.dto.PaymentRequest;
import com.foodapp.paymentservice.dto.PaymentResponse;
import com.foodapp.paymentservice.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Process a new payment
     * POST /api/payments
     */
    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest paymentRequest) {
        PaymentResponse response = paymentService.processPayment(paymentRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get payment details by payment ID
     * GET /api/payments/{paymentId}
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long paymentId) {
        PaymentResponse response = paymentService.getPaymentById(paymentId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Get payment details by order ID
     * GET /api/payments/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable Long orderId) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Get all payments for a user
     * GET /api/payments/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getUserPayments(@PathVariable Long userId) {
        List<PaymentResponse> responses = paymentService.getUserPayments(userId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    /**
     * Refund a payment
     * PUT /api/payments/{paymentId}/refund
     */
    @PutMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(@PathVariable Long paymentId) {
        PaymentResponse response = paymentService.refundPayment(paymentId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Cancel a payment
     * PUT /api/payments/{paymentId}/cancel
     */
    @PutMapping("/{paymentId}/cancel")
    public ResponseEntity<PaymentResponse> cancelPayment(@PathVariable Long paymentId) {
        PaymentResponse response = paymentService.cancelPayment(paymentId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}

