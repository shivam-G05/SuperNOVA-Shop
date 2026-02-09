import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useParams } from "react-router-dom";
import './PaymentIntegration.css';

const PaymentIntegration = () => {
  const {id}=useParams()
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    if (!orderId.trim()) {
      alert('Please enter an order ID');
      return;
    }

    setLoading(true);
    setPaymentStatus(null);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Failed to load Razorpay SDK');
        setLoading(false);
        return;
      }

      const res = await fetch(`http://3.238.239.123:3004/api/payments/create/${orderId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (!res.ok) throw new Error('Failed to create payment');

      const { payment } = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: payment.price.amount,
        currency: payment.price.currency,
        name: 'Your Company Name',
        description: `Payment for Order #${orderId}`,
        order_id: payment.razorpayOrderId,
        handler: async (response) => {
          await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        theme: { color: '#3b82f6' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPaymentStatus({ type: 'cancelled', message: 'Payment cancelled' });
          },
        },
      };

      new window.Razorpay(options).open();
      setLoading(false);

    } catch (err) {
      console.error(err);
      setPaymentStatus({ type: 'error', message: err.message });
      setLoading(false);
    }
  };

  const verifyPayment = async (razorpayOrderId, paymentId, signature) => {
    setLoading(true);

    try {
      const res = await fetch(`http://3.238.239.123:3004/api/payments/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            razorpayOrderId,
            paymentId,
            signature,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setPaymentStatus({
          type: 'success',
          message: 'Payment verified successfully!',
          paymentId: data.payment.paymentId,
        });
      } else {
        setPaymentStatus({ type: 'error', message: data.message });
      }
    } catch {
      setPaymentStatus({ type: 'error', message: 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-wrapper">
      <div className="payment-card">
        <div className="icon-wrapper">
          <CreditCard />
        </div>

        <h2>Payment Gateway</h2>
        <p className="subtitle">Enter your order ID to proceed
          <br></br>
          <br></br>
          YOUR ORDER ID: {id}
        </p>

        

        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          disabled={loading}
        />

        <button onClick={initiatePayment} disabled={loading}>
          {loading ? <Loader className="spin" /> : <CreditCard />}
          {loading ? 'Processing...' : 'Proceed to Pay'}
        </button>

        {paymentStatus && (
          <div className={`status ${paymentStatus.type}`}>
            {paymentStatus.type === 'success' ? <CheckCircle /> : <XCircle />}
            <div>
              <p>{paymentStatus.message}</p>
              {paymentStatus.paymentId && (
                <small>Payment ID: {paymentStatus.paymentId}</small>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentIntegration;
