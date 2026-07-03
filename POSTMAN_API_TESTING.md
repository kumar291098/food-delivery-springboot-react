# Payment Service - Postman API Testing Guide

## 🚀 Base URL
```
http://localhost:8084
```

---

## 📋 Test Case 1: Create Payment (Success)

### Method: POST
```
POST http://localhost:8084/api/payments
```

### Headers:
```
Content-Type: application/json
```

### Request Body:
```json
{
  "orderId": 1,
  "userId": 1,
  "amount": 350.50,
  "paymentMethod": "CREDIT_CARD",
  "cardNumber": "4111111111111111",
  "cardholderName": "John Doe",
  "cvv": "123",
  "expiryDate": "12/25"
}
```

### Expected Response (201 Created):
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.5,
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T10:30:00",
  "updatedDate": "2026-05-15T10:30:00"
}
```

---

## 📋 Test Case 2: Create Payment (Failed - Invalid Card)

### Method: POST
```
POST http://localhost:8084/api/payments
```

### Headers:
```
Content-Type: application/json
```

### Request Body:
```json
{
  "orderId": 2,
  "userId": 2,
  "amount": 200.00,
  "paymentMethod": "DEBIT_CARD",
  "cardNumber": "123",
  "cardholderName": "Jane Smith",
  "cvv": "12",
  "expiryDate": "11/24"
}
```

### Expected Response (201 Created - but with FAILED status):
```json
{
  "id": 2,
  "orderId": 2,
  "userId": 2,
  "amount": 200.0,
  "status": "FAILED",
  "paymentMethod": "DEBIT_CARD",
  "transactionId": null,
  "createdDate": "2026-05-15T10:32:00",
  "updatedDate": "2026-05-15T10:32:00"
}
```

---

## 📋 Test Case 3: Get Payment by ID

### Method: GET
```
GET http://localhost:8084/api/payments/1
```

### Headers:
```
(No body needed)
```

### Expected Response (200 OK):
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.5,
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T10:30:00",
  "updatedDate": "2026-05-15T10:30:00"
}
```

---

## 📋 Test Case 4: Get Payment by Order ID

### Method: GET
```
GET http://localhost:8084/api/payments/order/1
```

### Headers:
```
(No body needed)
```

### Expected Response (200 OK):
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.5,
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T10:30:00",
  "updatedDate": "2026-05-15T10:30:00"
}
```

---

## 📋 Test Case 5: Get All User Payments

### Method: GET
```
GET http://localhost:8084/api/payments/user/1
```

### Headers:
```
(No body needed)
```

### Expected Response (200 OK):
```json
[
  {
    "id": 1,
    "orderId": 1,
    "userId": 1,
    "amount": 350.5,
    "status": "SUCCESS",
    "paymentMethod": "CREDIT_CARD",
    "transactionId": "TXN_E965EDBB",
    "createdDate": "2026-05-15T10:30:00",
    "updatedDate": "2026-05-15T10:30:00"
  }
]
```

---

## 📋 Test Case 6: Refund Payment

### Method: PUT
```
PUT http://localhost:8084/api/payments/1/refund
```

### Headers:
```
(No body needed)
```

### Expected Response (200 OK):
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.5,
  "status": "REFUNDED",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T10:30:00",
  "updatedDate": "2026-05-15T10:31:00"
}
```

---

## 📋 Test Case 7: Cancel Payment

### Method: PUT
```
PUT http://localhost:8084/api/payments/3/cancel
```

### Headers:
```
(No body needed)
```

### Note: First create a PENDING payment by creating one with invalid card, then cancel it

### Expected Response (200 OK):
```json
{
  "id": 3,
  "orderId": 3,
  "userId": 3,
  "amount": 100.0,
  "status": "CANCELLED",
  "paymentMethod": "UPI",
  "transactionId": "TXN_XXXXXXXX",
  "createdDate": "2026-05-15T10:33:00",
  "updatedDate": "2026-05-15T10:33:30"
}
```

---

## 📋 Test Case 8: Error Case - Payment Not Found

### Method: GET
```
GET http://localhost:8084/api/payments/999
```

### Expected Response (404 Not Found):
```json
{
  "error": "Payment not found with ID: 999"
}
```

---

## 💳 Payment Methods Available

Use any of these values for `paymentMethod` field:
```
- CREDIT_CARD
- DEBIT_CARD
- UPI
- NETBANKING
- WALLET
- CASH_ON_DELIVERY
```

---

## 📊 Payment Status Values

After payment processing:
```
- SUCCESS     (Valid card)
- FAILED      (Invalid card)
- PENDING     (Initial state - not used in this mock)
- REFUNDED    (After refund)
- CANCELLED   (After cancellation)
```

---

## 🧪 Test Sequence (Recommended Order)

1. **Create Payment** (Test Case 1) - Should get SUCCESS
2. **Create Failed Payment** (Test Case 2) - Should get FAILED
3. **Get Payment by ID** (Test Case 3) - Retrieve payment 1
4. **Get Payment by Order** (Test Case 4) - Retrieve by order 1
5. **Get User Payments** (Test Case 5) - Get all payments for user 1
6. **Refund Payment** (Test Case 6) - Refund payment 1
7. **Payment Not Found** (Test Case 8) - Try to get non-existent payment

---

## ✅ Quick Copy-Paste for Postman

### 1️⃣ CREATE SUCCESSFUL PAYMENT
```
POST http://localhost:8084/api/payments

{
  "orderId": 1,
  "userId": 1,
  "amount": 350.50,
  "paymentMethod": "CREDIT_CARD",
  "cardNumber": "4111111111111111",
  "cardholderName": "John Doe",
  "cvv": "123",
  "expiryDate": "12/25"
}
```

### 2️⃣ CREATE FAILED PAYMENT
```
POST http://localhost:8084/api/payments

{
  "orderId": 2,
  "userId": 2,
  "amount": 200.00,
  "paymentMethod": "DEBIT_CARD",
  "cardNumber": "123",
  "cardholderName": "Jane Smith",
  "cvv": "12",
  "expiryDate": "11/24"
}
```

### 3️⃣ GET PAYMENT BY ID
```
GET http://localhost:8084/api/payments/1
```

### 4️⃣ GET PAYMENT BY ORDER ID
```
GET http://localhost:8084/api/payments/order/1
```

### 5️⃣ GET ALL USER PAYMENTS
```
GET http://localhost:8084/api/payments/user/1
```

### 6️⃣ REFUND PAYMENT
```
PUT http://localhost:8084/api/payments/1/refund
```

### 7️⃣ CANCEL PAYMENT
```
PUT http://localhost:8084/api/payments/3/cancel
```

### 8️⃣ GET NON-EXISTENT PAYMENT (ERROR TEST)
```
GET http://localhost:8084/api/payments/999
```

---

## 📌 Notes for Postman Users

1. Set `Content-Type: application/json` header for POST requests
2. Leave body empty for GET and PUT requests
3. Valid card numbers: 13+ digits (e.g., 4111111111111111)
4. Valid CVV: 3+ digits (e.g., 123)
5. Payment IDs auto-increment: 1, 2, 3, etc.
6. Transaction IDs format: TXN_XXXXXXXX (auto-generated)

---

## 🔍 Response Codes Summary

| Code | Meaning | When |
|------|---------|------|
| 201 | Created | POST /api/payments (payment created) |
| 200 | OK | GET, PUT requests successful |
| 404 | Not Found | Payment ID doesn't exist |
| 400 | Bad Request | Invalid amount or validation failed |
| 409 | Conflict | Invalid state transition (e.g., refund FAILED payment) |

---

**Last Updated**: 2026-05-15  
**Service**: Payment Service (Port 8084)  
**Status**: ✅ Ready for Testing

