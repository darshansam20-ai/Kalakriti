import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { AddressForm, Address } from '../components/AddressForm';

export const Checkout: React.FC = () => {
  const { items, cartTotal, closeCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Address search field (use-places-autocomplete)
  const {
    ready,
    value: addressSearchValue,
    suggestions: { status, data: addressSuggestions },
    setValue: setAddressSearchValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
  });

  useEffect(() => {
    // If empty cart, go back to shop
    if (items.length === 0 && !paymentSuccess) {
      navigate('/shop');
    }
    
    // Fetch user addresses
    const fetchUserAddresses = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().addresses) {
        setAddresses(userSnap.data().addresses);
        if (userSnap.data().addresses.length > 0) {
          setSelectedAddressIndex(0);
        }
      }
    };
    fetchUserAddresses();
  }, [user, items, navigate, paymentSuccess]);

  // Dynamically load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, []);

  const finalTotal = Math.max(0, cartTotal - discount);

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoCode) return;
    try {
      const codeRef = doc(db, 'promoCodes', promoCode.toUpperCase());
      const codeSnap = await getDoc(codeRef);
      if (codeSnap.exists()) {
        const promoData = codeSnap.data();
        if (promoData.isActive) {
          if (promoData.type === 'percentage') {
            setDiscount(cartTotal * (promoData.value / 100));
          } else {
            setDiscount(promoData.value);
          }
        } else {
          setPromoError('This promo code is no longer active.');
        }
      } else {
        setPromoError('Invalid promo code.');
      }
    } catch (err) {
      setPromoError('Failed to apply promo code.');
    }
  };

  const handleSelectAddressSuggestion = async (description: string) => {
    setAddressSearchValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      
      const newAddress = {
        description,
        lat,
        lng,
        id: new Date().getTime().toString()
      };

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          addresses: arrayUnion(newAddress)
        });
      }
      
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);
      setSelectedAddressIndex(updatedAddresses.length - 1);
      setIsAddingAddress(false);
      setAddressSearchValue('');
      
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    // Record Order in Firestore
    if (user && selectedAddressIndex !== null) {
      const orderData = {
        userId: user.uid,
        userName: user.displayName || 'Unknown User',
        userEmail: user.email || '',
        items,
        totalAmount: finalTotal,
        discountApplied: discount,
        shippingAddress: addresses[selectedAddressIndex],
        status: 'Processing',
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        createdAt: new Date(),
      };
      await addDoc(collection(db, 'orders'), orderData);
    }
    setPaymentSuccess(true);
    setProcessing(false);
  };

  const handlePaymentSubmit = async () => {
    if (!user || selectedAddressIndex === null || finalTotal <= 0) return;
    
    setProcessing(true);

    try {
      // 1. Create order on the server
      const res = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal, currency: 'INR' })
      });
      const order = await res.json();
      
      if (order.error) {
        console.error("Order error:", order.error);
        setProcessing(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || '', // We assume VITE_RAZORPAY_KEY_ID will be set
        amount: order.amount,
        currency: order.currency,
        name: 'Our Store',
        description: 'Store Purchase',
        order_id: order.id,
        handler: function (response: any) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#8A2035' // Maroon color to match the theme
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        console.error("Payment failed", response.error);
        setProcessing(false);
      });
      
      rzp.open();
    } catch (error) {
      console.error("Error starting checkout", error);
      setProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-[40px] font-bold text-maroon mb-4">Payment Successful!</h1>
        <p className="text-text-light mb-8 max-w-md">Your order has been placed securely. We will send you an email confirmation shortly.</p>
        <button onClick={() => navigate('/orders')} className="bg-maroon text-white px-8 py-3 rounded-[30px] font-semibold">View Orders</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-[32px] font-bold text-ink mb-4">Account Required</h2>
        <p className="text-text-light mb-6">Please log in or sign up to finalize checkout.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-ink mb-10">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Shipping & Payment */}
        <div className="space-y-10">
          
          {/* Shipping Address */}
          <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <h2 className="font-serif text-[24px] font-bold text-ink mb-6 flex items-center justify-between">
              Shipping Address
              {!isAddingAddress && (
                <button onClick={() => setIsAddingAddress(true)} className="text-[14px] text-maroon font-medium uppercase tracking-wide">
                  + Add New
                </button>
              )}
            </h2>

            {isAddingAddress ? (
              <div className="space-y-4">
                <AddressForm
                  onSave={async (newAddress) => {
                    try {
                      if (user) {
                        const userRef = doc(db, 'users', user.uid);
                        await updateDoc(userRef, {
                          addresses: arrayUnion(newAddress)
                        });
                      }
                      const updatedAddresses = [...addresses, newAddress];
                      setAddresses(updatedAddresses);
                      setSelectedAddressIndex(updatedAddresses.length - 1);
                      setIsAddingAddress(false);
                    } catch (err) {
                      console.error("Error saving address:", err);
                    }
                  }}
                  onCancel={() => setIsAddingAddress(false)}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-text-light text-[14px]">You have no saved addresses.</p>
                ) : (
                  addresses.map((addr, idx) => (
                    <div 
                      key={addr.id || idx} 
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-4 border rounded-[8px] cursor-pointer transition-colors ${selectedAddressIndex === idx ? 'border-maroon bg-maroon/5 ring-1 ring-maroon' : 'border-black/10 hover:border-black/30'}`}
                    >
                      <p className="text-[15px] text-ink">{addr.description}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Payment Element */}
          <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <h2 className="font-serif text-[24px] font-bold text-ink mb-6">Payment</h2>
            {selectedAddressIndex === null ? (
              <p className="text-[14px] text-text-light">Select a shipping address first to proceed with payment.</p>
            ) : (
              <button
                onClick={handlePaymentSubmit}
                disabled={processing}
                className="w-full bg-maroon hover:bg-maroon-dark text-white font-semibold py-4 rounded-[30px] disabled:opacity-50 transition-colors uppercase tracking-wide text-[14px] flex justify-center items-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  `Pay ₹${finalTotal.toLocaleString('en-IN')}`
                )}
              </button>
            )}
          </div>
          
        </div>

        {/* Right Side: Order Summary */}
        <div>
          <div className="bg-surface p-6 rounded-[16px] border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] top-24 sticky">
            <h2 className="font-serif text-[24px] font-bold text-ink mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.cartId} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={item.images[0]} alt={item.title} className="w-16 h-16 object-cover rounded-[8px]" />
                    <div>
                      <p className="text-[14px] font-bold text-ink">{item.title}</p>
                      <p className="text-[12px] text-text-light">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-[14px] font-semibold text-ink">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            {/* Promo Code section */}
            <div className="border-t border-black/10 pt-6 mb-6">
              <label className="block text-[14px] font-bold text-ink mb-2">Discount Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code" 
                  className="flex-1 w-full border border-black/10 rounded-[8px] px-4 py-2 text-[14px]"
                />
                <button 
                  onClick={handleApplyPromo}
                  className="bg-ink hover:bg-ink-light text-white px-4 py-2 rounded-[8px] text-[13px] uppercase tracking-wide font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-red-500 text-[12px] mt-2">{promoError}</p>}
              {discount > 0 && <p className="text-green-600 text-[12px] mt-2 font-medium">Coupon applied successfully!</p>}
            </div>

            <div className="border-t border-black/10 pt-6 space-y-3">
              <div className="flex justify-between text-[14px] text-text-light">
                <p>Subtotal</p>
                <p>₹{cartTotal.toLocaleString('en-IN')}</p>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[14px] text-green-600 font-medium">
                  <p>Discount</p>
                  <p>-₹{discount.toLocaleString('en-IN')}</p>
                </div>
              )}
              <div className="flex justify-between text-[18px] font-bold text-ink pt-3 border-t border-black/5">
                <p>Total</p>
                <p className="text-maroon">₹{finalTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
