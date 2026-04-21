# Stripe Payment Integration Setup

## Environment Variables

Add these to your `.env` file:

```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLIC_KEY=pk_test_your_public_key_here

# Webhook Secret (from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Installation

```bash
npm install stripe
npm install --save-dev @types/stripe
```

## API Endpoints

### 1. Get Stripe Public Key

**Endpoint:** `GET /api/v1/payment/public-key`

- No authentication required
- Returns your Stripe publishable key for frontend

**Response:**

```json
{
  "success": true,
  "data": {
    "publicKey": "pk_test_..."
  }
}
```

### 2. Create Payment Intent

**Endpoint:** `POST /api/v1/payment/create-intent`

- Requires authentication
- Creates a payment intent in Stripe

**Request Body:**

```json
{
  "amount": 89.0,
  "currency": "usd",
  "description": "Product purchase",
  "paymentMethodType": "card",
  "metadata": {
    "orderId": "12345"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234_secret_567",
    "paymentIntentId": "pi_1234567890",
    "paymentRecord": { ... }
  }
}
```

### 3. Confirm Payment

**Endpoint:** `POST /api/v1/payment/confirm`

- Requires authentication
- Confirms payment after Stripe processing

**Request Body:**

```json
{
  "paymentIntentId": "pi_1234567890",
  "billingDetails": {
    "country": "US",
    "zip": "10001",
    "line1": "123 Main St",
    "city": "New York",
    "state": "NY"
  }
}
```

### 4. Get Payment History

**Endpoint:** `GET /api/v1/payment/history?status=succeeded&limit=10&page=1`

- Requires authentication
- Returns user's payment history

**Query Parameters:**

- `status` (optional): pending, succeeded, failed, cancelled
- `limit` (optional): Number of records per page (default: 10)
- `page` (optional): Page number (default: 1)

### 5. Get Payment Details

**Endpoint:** `GET /api/v1/payment/:paymentIntentId`

- Requires authentication
- Returns specific payment details

### 6. Cancel Payment

**Endpoint:** `PATCH /api/v1/payment/:paymentIntentId/cancel`

- Requires authentication
- Cancels a pending payment

### 7. Refund Payment

**Endpoint:** `POST /api/v1/payment/:paymentIntentId/refund`

- Requires authentication
- Refunds a succeeded payment

### 8. Stripe Webhook

**Endpoint:** `POST /api/v1/payment/webhook`

- No authentication required
- Handles Stripe webhook events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`

**Important:** Configure this URL in Stripe Dashboard under Webhooks:
`https://your-domain.com/api/v1/payment/webhook`

## Frontend Integration Example

```typescript
import { loadStripe } from '@stripe/js';

// 1. Get public key
const response = await fetch('/api/v1/payment/public-key');
const { data } = await response.json();
const stripe = await loadStripe(data.publicKey);

// 2. Create payment intent
const paymentResponse = await fetch('/api/v1/payment/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 89.0,
    currency: 'usd',
    paymentMethodType: 'card',
    description: 'Product purchase',
  }),
});

const { data: paymentData } = await paymentResponse.json();
const { clientSecret } = paymentData;

// 3. Confirm payment with Stripe (use Elements or Stripe.js library)
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement, // Your Stripe card element
    billing_details: {
      address: {
        country: 'US',
        postal_code: '10001',
      },
    },
  },
});

// 4. Confirm on backend
if (result.paymentIntent.status === 'succeeded') {
  await fetch('/api/v1/payment/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentIntentId: result.paymentIntent.id,
      billingDetails: {
        country: 'US',
        zip: '10001',
      },
    }),
  });
}
```

## Database Schema

The `Payment` collection stores:

- User ID
- Amount & Currency
- Stripe Payment Intent ID
- Payment status (pending, succeeded, failed, cancelled)
- Card details (last 4 digits, brand, expiry)
- Billing address
- Metadata (order ID, etc.)
- Timestamps

## Error Handling

All endpoints follow your standard error response format. Stripe errors are caught and returned with appropriate HTTP status codes:

- `400 Bad Request` - Invalid payment data
- `404 Not Found` - Payment record not found
- `500 Internal Server Error` - Stripe API errors

## Supported Payment Methods

- 💳 Card (Visa, Mastercard, Amex, etc.)
- 🔵 Google Pay
- 🍎 Apple Pay

## Testing

Use Stripe test cards:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- CVC: Any 3 digits
- Expiry: Any future date

## Security Notes

✅ Never expose `STRIPE_SECRET_KEY` on the frontend
✅ Always validate amounts on the backend
✅ Use HTTPS for all payments
✅ Implement proper webhook signature verification
✅ Store sensitive data in environment variables only
