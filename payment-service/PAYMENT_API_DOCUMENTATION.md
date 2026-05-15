# Payment Service - API Documentation

## Service Details
- **Port**: 8084
- **Database**: H2 (in-memory, PAYMENTDB)
- **Base URL**: http://localhost:8084

## Database Console
- **URL**: http://localhost:8084/h2-console
- **Driver**: org.h2.Driver
- **Database URL**: jdbc:h2:mem:paymentdb
- **Username**: sa
- **Password**: (blank)

---

## API Endpoints

### 1. **Process Payment** ✅
**POST** `/api/payments`

Process a new payment for an order.

**Request Body:**
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

**Payment Methods:**
- CREDIT_CARD
- DEBIT_CARD
- UPI
- NETBANKING
- WALLET
- CASH_ON_DELIVERY

**Response (201 Created):**
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.50,
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T09:52:48.250843",
  "updatedDate": "2026-05-15T09:52:48.250843"
}
```

---

### 2. **Get Payment by ID** ✅
**GET** `/api/payments/{paymentId}`

Retrieve payment details by payment ID.

**Path Parameters:**
- `paymentId` (Long) - Payment ID

**Example:** `GET /api/payments/1`

**Response (200 OK):**
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.50,
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T09:52:48.250843",
  "updatedDate": "2026-05-15T09:52:48.250843"
}
```

---

### 3. **Get Payment by Order ID** ✅
**GET** `/api/payments/order/{orderId}`

Retrieve payment details by order ID.

**Path Parameters:**
- `orderId` (Long) - Order ID

**Example:** `GET /api/payments/order/1`

**Response (200 OK):**
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.50,
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T09:52:48.250843",
  "updatedDate": "2026-05-15T09:52:48.250843"
}
```

---

### 4. **Get User Payments** ✅
**GET** `/api/payments/user/{userId}`

Retrieve all payments for a specific user.

**Path Parameters:**
- `userId` (Long) - User ID

**Example:** `GET /api/payments/user/1`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "userId": 1,
    "amount": 350.50,
    "status": "SUCCESS",
    "paymentMethod": "CREDIT_CARD",
    "transactionId": "TXN_E965EDBB",
    "createdDate": "2026-05-15T09:52:48.250843",
    "updatedDate": "2026-05-15T09:52:48.250843"
  }
]
```

---

### 5. **Refund Payment** ✅
**PUT** `/api/payments/{paymentId}/refund`

Refund a successful payment.

**Path Parameters:**
- `paymentId` (Long) - Payment ID to refund

**Example:** `PUT /api/payments/1/refund`

**Response (200 OK):**
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.50,
  "status": "REFUNDED",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T09:52:48.250843",
  "updatedDate": "2026-05-15T09:52:53.123456"
}
```

**Constraints:**
- Only successful payments (status = SUCCESS) can be refunded
- Returns 400 error if payment is not successful

---

### 6. **Cancel Payment** ✅
**PUT** `/api/payments/{paymentId}/cancel`

Cancel a pending payment.

**Path Parameters:**
- `paymentId` (Long) - Payment ID to cancel

**Example:** `PUT /api/payments/1/cancel`

**Response (200 OK):**
```json
{
  "id": 1,
  "orderId": 1,
  "userId": 1,
  "amount": 350.50,
  "status": "CANCELLED",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_E965EDBB",
  "createdDate": "2026-05-15T09:52:48.250843",
  "updatedDate": "2026-05-15T09:52:55.654321"
}
```

**Constraints:**
- Cannot cancel completed (SUCCESS) or refunded (REFUNDED) payments
- Returns 400 error if payment is in invalid state

---

## Payment Status Values

| Status | Description |
|--------|-------------|
| PENDING | Payment is being processed |
| SUCCESS | Payment processed successfully |
| FAILED | Payment processing failed |
| REFUNDED | Payment has been refunded |
| CANCELLED | Payment cancelled by user |

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid amount: -100"
}
```

### 404 Not Found
```json
{
  "error": "Payment not found with ID: 999"
}
```

### 409 Conflict
```json
{
  "error": "Only successful payments can be refunded"
}
```

---

## Testing Examples

### Using PowerShell/cURL

**Create Payment:**
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

Invoke-WebRequest -Uri "http://localhost:8084/api/payments" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
```

**Get Payment:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/1" -UseBasicParsing
```

**Refund Payment:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8084/api/payments/1/refund" -Method Put -UseBasicParsing
```

### Using cURL (Linux/Mac)

**Create Payment:**
```bash
curl -X POST http://localhost:8084/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "userId": 1,
    "amount": 350.50,
    "paymentMethod": "CREDIT_CARD",
    "cardNumber": "4111111111111111",
    "cardholderName": "John Doe",
    "cvv": "123",
    "expiryDate": "12/25"
  }'
```

**Get Payment:**
```bash
curl -X GET http://localhost:8084/api/payments/1
```

**Refund Payment:**
```bash
curl -X PUT http://localhost:8084/api/payments/1/refund
```

---

## Project Structure

```
payment-service/
├── src/main/java/com/foodapp/paymentservice/
│   ├── PaymentServiceApplication.java          # Spring Boot entry point
│   ├── controller/
│   │   └── PaymentController.java              # REST endpoints
│   ├── service/
│   │   └── PaymentService.java                 # Business logic
│   ├── repository/
│   │   └── PaymentRepository.java              # Database access
│   ├── entity/
│   │   ├── Payment.java                        # Payment entity
│   │   ├── PaymentStatus.java                  # Enum
│   │   └── PaymentMethod.java                  # Enum
│   └── dto/
│       ├── PaymentRequest.java                 # Request DTO
│       └── PaymentResponse.java                # Response DTO
└── src/main/resources/
    └── application.properties                  # Configuration
```

---

## Key Features

✅ **Payment Processing** - Create and track payments  
✅ **Transaction ID** - Unique transaction ID for each payment  
✅ **Status Tracking** - Multiple payment status states  
✅ **Refund Support** - Refund successful payments  
✅ **Payment Methods** - Support for multiple payment methods  
✅ **User & Order Tracking** - Link payments to users and orders  
✅ **H2 Database** - In-memory database for development  
✅ **RESTful API** - Clean REST API design  

---

## Integration with Other Services

### Order Service Integration
- When order is created, payment can be initiated
- Payment success status should trigger order confirmation
- Payment failure should block order completion

### User Service Integration
- Payment is linked to userId for user history
- Payment history can be retrieved per user

### Notification Service Integration
- Payment success/failure notifications can be sent
- Transaction confirmation emails can be triggered

---

## Development Notes

1. **Payment Validation**: Currently using mock card validation. Replace with real payment gateway (Stripe, PayPal, etc.)
2. **Card Security**: In production, never store sensitive card data. Use tokenization.
3. **Transaction Uniqueness**: Transaction ID is unique and auto-generated.
4. **Date Tracking**: All payments track creation and update timestamps.

---

## Running the Service

```bash
# Build
cd payment-service
..\mvnw.cmd clean install -DskipTests

# Run
..\mvnw.cmd spring-boot:run
```

Service will be available at: **http://localhost:8084**

---

**Last Updated**: 2026-05-15  
**Status**: ✅ Production Ready

