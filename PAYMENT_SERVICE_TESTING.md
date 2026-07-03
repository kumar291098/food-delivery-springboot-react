# Payment Service - Testing Guide

## 🚀 Quick Start

### 1. Start the Service
```powershell
cd E:\JavaProject\OnlineFoodOrderingSystem\food-delivery\payment-service
..\mvnw.cmd spring-boot:run
```

Service runs on: **http://localhost:8084**

### 2. Access Database Console
```
URL: http://localhost:8084/h2-console
Driver: org.h2.Driver
Database URL: jdbc:h2:mem:paymentdb
Username: sa
Password: (leave blank)
```

---

## 📋 Test Cases

### Test 1: Create Payment (Success)
**Endpoint:** `POST /api/payments`

**PowerShell Command:**
```powershell
$body = @{
    orderId = 1
    userId = 1
    amount = 350.50
    paymentMethod = "CREDIT_CARD"
    cardNumber = "4111111111111111"
    cardholderName = "John Doe"
    cvv = "123"
    expiryDate = "12/25"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8084/api/payments" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.5,
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_XXXXXXXX",
  "createdDate": "2026-05-15T...",
  "updatedDate": "2026-05-15T..."
}
```

**Status Code:** `201 Created` ✅

---

### Test 2: Create Payment (Failed - Invalid Card)
**Endpoint:** `POST /api/payments`

**PowerShell Command:**
```powershell
$body = @{
    orderId = 2
    userId = 2
    amount = 200.00
    paymentMethod = "CREDIT_CARD"
    cardNumber = "123"
    cardholderName = "Jane Doe"
    cvv = "12"
    expiryDate = "12/25"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8084/api/payments" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
```json
{
  "id": 2,
  "orderId": 2,
  "userId": 2,
  "amount": 200.0,
  "status": "FAILED",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": null,
  "createdDate": "2026-05-15T...",
  "updatedDate": "2026-05-15T..."
}
```

**Status Code:** `201 Created` ✅

---

### Test 3: Get Payment by ID
**Endpoint:** `GET /api/payments/{paymentId}`

**PowerShell Command:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/1" `
  -Method Get `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.5,
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T09:52:48.250843",
  "updatedDate": "2026-05-15T09:52:48.250843"
}
```

**Status Code:** `200 OK` ✅

---

### Test 4: Get Payment by Order ID
**Endpoint:** `GET /api/payments/order/{orderId}`

**PowerShell Command:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/order/1" `
  -Method Get `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.5,
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T09:52:48.250843",
  "updatedDate": "2026-05-15T09:52:48.250843"
}
```

**Status Code:** `200 OK` ✅

---

### Test 5: Get User Payments
**Endpoint:** `GET /api/payments/user/{userId}`

**PowerShell Command:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/user/1" `
  -Method Get `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
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
    "createdDate": "2026-05-15T09:52:48.250843",
    "updatedDate": "2026-05-15T09:52:48.250843"
  }
]
```

**Status Code:** `200 OK` ✅

---

### Test 6: Refund Payment
**Endpoint:** `PUT /api/payments/{paymentId}/refund`

**PowerShell Command:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/1/refund" `
  -Method Put `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.5,
  "status": "REFUNDED",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T09:52:48.250843",
  "updatedDate": "2026-05-15T09:53:XX.XXXXXX"
}
```

**Status Code:** `200 OK` ✅

---

### Test 7: Cancel Payment
**Endpoint:** `PUT /api/payments/{paymentId}/cancel`

**PowerShell Command (Create new payment first):**
```powershell
# First, create a payment
$body = @{
    orderId = 3
    userId = 3
    amount = 100.00
    paymentMethod = "UPI"
    cardNumber = "9999999999999999"
    cardholderName = "Bob Smith"
    cvv = "234"
    expiryDate = "12/26"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8084/api/payments" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing

$paymentId = ($response | ConvertFrom-Json).id

# Now cancel it
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/$paymentId/cancel" `
  -Method Put `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
```json
{
  "id": 3,
  "orderId": 3,
  "userId": 3,
  "amount": 100.0,
  "status": "CANCELLED",
  "paymentMethod": "UPI",
  "transactionId": "TXN_XXXXXXXX",
  "createdDate": "2026-05-15T09:54:XX.XXXXXX",
  "updatedDate": "2026-05-15T09:54:XX.XXXXXX"
}
```

**Status Code:** `200 OK` ✅

---

### Test 8: Error Cases

#### 8a. Invalid Amount
**Endpoint:** `POST /api/payments`

```powershell
$body = @{
    orderId = 4
    userId = 4
    amount = -100
    paymentMethod = "CREDIT_CARD"
    cardNumber = "4111111111111111"
    cardholderName = "Test User"
    cvv = "123"
    expiryDate = "12/25"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8084/api/payments" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing -ErrorAction SilentlyContinue
```

**Expected Response:**
```
Error: 400 Bad Request
"Invalid amount: -100"
```

---

#### 8b. Payment Not Found
**Endpoint:** `GET /api/payments/999`

```powershell
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/999" `
  -Method Get `
  -UseBasicParsing -ErrorAction SilentlyContinue
```

**Expected Response:**
```
Error: 404 Not Found
"Payment not found with ID: 999"
```

---

#### 8c. Cannot Refund Failed Payment
**Endpoint:** `PUT /api/payments/{paymentId}/refund`

```powershell
# Use payment ID 2 (which has FAILED status)
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/2/refund" `
  -Method Put `
  -UseBasicParsing -ErrorAction SilentlyContinue
```

**Expected Response:**
```
Error: 409 Conflict
"Only successful payments can be refunded"
```

---

#### 8d. Cannot Cancel Successful Payment
**Endpoint:** `PUT /api/payments/{paymentId}/cancel`

```powershell
# Use payment ID 1 (which has SUCCESS status)
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/1/cancel" `
  -Method Put `
  -UseBasicParsing -ErrorAction SilentlyContinue
```

**Expected Response:**
```
Error: 409 Conflict
"Cannot cancel a completed or refunded payment"
```

---

## 📊 Payment Status Transitions

```
PENDING
  ├─→ SUCCESS (payment valid)
  └─→ FAILED (payment invalid)

SUCCESS
  ├─→ REFUNDED (on refund request)
  └─→ Cannot be cancelled

FAILED
  ├─→ Cannot be refunded
  └─→ Cannot be cancelled

REFUNDED
  └─→ Final state

CANCELLED
  └─→ Final state (only from PENDING)
```

---

## 🗄️ Database Queries

### Check all payments
```sql
SELECT * FROM payments;
```

### Check payments by user
```sql
SELECT * FROM payments WHERE user_id = 1;
```

### Check successful payments
```sql
SELECT * FROM payments WHERE status = 'SUCCESS';
```

### Check refunded payments
```sql
SELECT * FROM payments WHERE status = 'REFUNDED';
```

---

## ✅ Test Checklist

- [ ] Service starts successfully on port 8084
- [ ] Create payment with valid card (SUCCESS)
- [ ] Create payment with invalid card (FAILED)
- [ ] Get payment by ID
- [ ] Get payment by order ID
- [ ] Get all user payments
- [ ] Refund successful payment
- [ ] Cancel pending payment
- [ ] Try to refund failed payment (should fail)
- [ ] Try to cancel successful payment (should fail)
- [ ] Payment not found error
- [ ] Invalid amount error
- [ ] Database console accessible
- [ ] All timestamps recorded correctly

---

## 🔍 Performance Testing

### Create Multiple Payments
```powershell
for ($i = 1; $i -le 10; $i++) {
    $body = @{
        orderId = $i
        userId = ($i % 5) + 1
        amount = [decimal]::Round((Get-Random -Minimum 100 -Maximum 1000) + 0.50, 2)
        paymentMethod = "CREDIT_CARD"
        cardNumber = "4111111111111111"
        cardholderName = "User $i"
        cvv = "123"
        expiryDate = "12/25"
    } | ConvertTo-Json

    Invoke-WebRequest -Uri "http://localhost:8084/api/payments" `
      -Method Post `
      -ContentType "application/json" `
      -Body $body `
      -UseBasicParsing | Out-Null
    
    Write-Host "Payment $i created"
}
```

---

## 📝 Notes

- Transaction IDs are unique and generated as `TXN_` + random 8-char string
- Timestamps use ISO 8601 format: `YYYY-MM-DDTHH:MM:SS.NNNNNN`
- H2 database resets on service restart (development only)
- Payment validation checks card number >= 13 digits and CVV >= 3 digits
- All responses are in JSON format

---

**Last Updated**: 2026-05-15  
**Created By**: GitHub Copilot  
**Status**: ✅ Ready for Testing

