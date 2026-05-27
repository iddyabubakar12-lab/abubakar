/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle, Shield, AlertCircle, Sparkles, CreditCard, Fingerprint, RefreshCw } from 'lucide-react';
import { Story, User } from '../types';

interface PaymentModalProps {
  story: Story;
  user: User;
  onClose: () => void;
  onSuccess: (storyId: string, paymentMethod: string, phoneOrCard: string) => void;
}

export default function PaymentModal({ story, user, onClose, onSuccess }: PaymentModalProps) {
  // Chosen master tab: WALLET, MOBILE, CARD, GPAY or INT_METHODS
  const [paymentType, setPaymentType] = useState<'WALLET' | 'MOBILE' | 'CARD' | 'GPAY' | 'INT_METHODS'>('WALLET');

  // Mobile Money states
  const [phone, setPhone] = useState(user.phone || '0712345678');
  const [operator, setOperator] = useState<'MPESA' | 'AIRTEL' | 'TIGO'>('MPESA');
  const [step, setStep] = useState<'input' | 'push' | 'pin' | 'success'>('input');
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [enteredPin, setEnteredPin] = useState('');

  // Online Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isCardProcessing, setIsCardProcessing] = useState(false);

  // Google Pay states
  const [isGpayProcessing, setIsGpayProcessing] = useState(false);

  // International payment states
  const [selectedIntMethod, setSelectedIntMethod] = useState<'PAYPAL' | 'APPLEPAY' | 'STRIPE'>('PAYPAL');
  const [intEmail, setIntEmail] = useState(user.email || 'guest@example.com');
  const [isIntProcessing, setIsIntProcessing] = useState(false);

  // Auto-detect mobile provider from prefix
  useEffect(() => {
    if (phone.startsWith('074') || phone.startsWith('075') || phone.startsWith('076')) {
      setOperator('MPESA');
    } else if (phone.startsWith('078') || phone.startsWith('068') || phone.startsWith('079')) {
      setOperator('AIRTEL');
    } else if (phone.startsWith('071') || phone.startsWith('065') || phone.startsWith('067') || phone.startsWith('077')) {
      setOperator('TIGO');
    }
  }, [phone]);

  // Countdown timer for USSD mock push notification
  useEffect(() => {
    if (step !== 'push') return;
    if (countdown <= 0) {
      // automatically transition to pin entry if user waits
      setStep('pin');
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Swahili phone number layout validation (10 digits)
    const normalized = phone.trim().replace(/\s/g, '');
    const phoneRegex = /^(0[67])[0-9]{8}$/;

    if (!phoneRegex.test(normalized)) {
      setErrorMsg('Tafadhali weka namba sahihi ya Tanzania (Mfano: 0712345678 au 0654123456).');
      return;
    }

    setStep('push');
    setCountdown(6);
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.length < 4) {
      setErrorMsg('Tafadhali weka PIN yote ya tarakimu 4.');
      return;
    }
    
    setStep('success');
  };

  const handleCardPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 16) {
      setErrorMsg('Tafadhali weka namba sahihi ya kadi yenye tarakimu 16.');
      return;
    }
    if (!cardExpiry.includes('/')) {
      setErrorMsg('Weka tarehe ya mwisho sahihi kama MM/YY (Mfano: 12/28).');
      return;
    }
    if (cardCvc.replace(/\s/g, '').length < 3) {
      setErrorMsg('Weka namba sahihi ya usalama ya CVC tarakimu 3.');
      return;
    }

    setIsCardProcessing(true);
    setTimeout(() => {
      setIsCardProcessing(false);
      setStep('success');
    }, 2000);
  };

  const handleGooglePayTrigger = () => {
    setErrorMsg('');
    setIsGpayProcessing(true);
    setTimeout(() => {
      setIsGpayProcessing(false);
      setStep('success');
    }, 1800);
  };

  const handleFinishSuccess = () => {
    let method = 'M-PESA';
    let label = phone;

    if (paymentType === 'WALLET') {
      method = 'WALLET_APP';
      label = `Simulizi Wallet (+255 ${user.phone})`;
    } else if (paymentType === 'MOBILE') {
      method = operator === 'MPESA' ? 'VODACOM M-PESA' : operator === 'AIRTEL' ? 'AIRTEL MONEY' : 'TIGO PESA';
      label = phone;
    } else if (paymentType === 'CARD') {
      method = 'VISA / CARD';
      const cleanNum = cardNumber.replace(/\s/g, '');
      const lastFour = cleanNum.slice(-4) || '4255';
      label = `VISA Card (**** **** **** ${lastFour})`;
    } else if (paymentType === 'GPAY') {
      method = 'GOOGLE PAY';
      label = `GPay via ${user.email}`;
    } else if (paymentType === 'INT_METHODS') {
      if (selectedIntMethod === 'PAYPAL') {
        method = 'PAYPAL (INT)';
        label = `PayPal: ${intEmail}`;
      } else if (selectedIntMethod === 'APPLEPAY') {
        method = 'APPLE PAY (INT)';
        label = `Apple Pay (TouchID SECURE)`;
      } else {
        method = 'STRIPE (INT)';
        label = `Stripe Checkout (${intEmail})`;
      }
    }

    onSuccess(story.id, method, label);
    onClose();
  };

  const getOperatorStyle = () => {
    switch (operator) {
      case 'MPESA':
        return { name: 'Vodacom M-Pesa', bg: 'bg-red-600', text: 'text-red-500', border: 'border-red-600' };
      case 'AIRTEL':
        return { name: 'Airtel Money', bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' };
      case 'TIGO':
        return { name: 'Tigo Pesa', bg: 'bg-blue-600', text: 'text-blue-500', border: 'border-blue-600' };
    }
  };

  const currentStyle = getOperatorStyle();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans text-white">
      {/* High-Contrast Glassmorphic Payment Box */}
      <div className="w-full max-w-sm glass-modal rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header bar controls */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-bold font-display tracking-widest uppercase">Malipo ya Simulizi</span>
          </div>
          {step !== 'success' && (
            <button
              id="close-payment-modal"
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Story Metadata panel preview */}
        <div className="bg-black/40 p-4 border-b border-white/5 flex items-center gap-3">
          <img
            src={story.coverUrl}
            alt={story.title}
            referrerPolicy="no-referrer"
            className="w-10 h-12 rounded object-cover shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-neutral-100 line-clamp-1">{story.title}</h4>
            <p className="text-[10px] text-neutral-405">na {story.author}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              <span className="text-xs font-mono font-bold text-gold-400">
                TZS {story.price.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                (~ ${(story.price / 2600).toFixed(2)} USD)
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Step Switcher */}
        <div className="p-5 flex-1 overflow-y-auto">
          {step === 'input' && (
            <div className="space-y-4">
              {/* Payment Method Selector Tab bar */}
              <div className="grid grid-cols-5 gap-0.5 border-b border-white/10 mb-3 pb-1">
                <button
                  type="button"
                  onClick={() => { setPaymentType('WALLET'); setErrorMsg(''); }}
                  className={`pb-1 text-center text-[9px] font-bold transition-all border-b-2 cursor-pointer ${
                    paymentType === 'WALLET' 
                      ? 'border-gold-500 text-gold-400 font-extrabold' 
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Wallet 🪙
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentType('MOBILE'); setErrorMsg(''); }}
                  className={`pb-1 text-center text-[9px] font-bold transition-all border-b-2 cursor-pointer ${
                    paymentType === 'MOBILE' 
                      ? 'border-gold-500 text-gold-400 font-extrabold' 
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Simu
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentType('CARD'); setErrorMsg(''); }}
                  className={`pb-1 text-center text-[9px] font-bold transition-all border-b-2 cursor-pointer ${
                    paymentType === 'CARD' 
                      ? 'border-gold-500 text-gold-400 font-extrabold' 
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Kadi
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentType('GPAY'); setErrorMsg(''); }}
                  className={`pb-1 text-center text-[9px] font-bold transition-all border-b-2 cursor-pointer ${
                    paymentType === 'GPAY' 
                      ? 'border-gold-500 text-gold-400 font-extrabold' 
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  G-Pay
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentType('INT_METHODS'); setErrorMsg(''); }}
                  className={`pb-1 text-center text-[9px] font-bold transition-all border-b-2 cursor-pointer ${
                    paymentType === 'INT_METHODS' 
                      ? 'border-gold-500 text-gold-400 font-extrabold' 
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Nje 🌍
                </button>
              </div>

              {/* 0. WALLET APP CHECKOUT PANEL */}
              {paymentType === 'WALLET' && (
                <div className="space-y-4">
                  <div className="text-center py-2.5 bg-gold-500/5 rounded-2xl border border-gold-500/15 p-3 space-y-1.5">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                      Lipia simulizi hii kwa haraka ukitumia salio lililopo kwenye mkoba/pesa ya akaunti yako ya App.
                    </p>
                    <div className="pt-1.5 pb-0.5 border-t border-white/5">
                      <span className="text-[9px] text-neutral-450 font-mono uppercase block">Salio Lako la Sasa:</span>
                      <span className="text-sm font-bold text-gold-400 font-mono">TZS {user.balance.toLocaleString()}</span>
                    </div>
                  </div>

                  {user.balance >= story.price ? (
                    <button
                      id="wallet-payment-submit-btn"
                      type="button"
                      onClick={() => {
                        setStep('success');
                      }}
                      className="w-full bg-gradient-to-r from-gold-500 to-orange-500 text-neutral-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg hover:brightness-110"
                    >
                      <span>Thibitisha Kulipa TZS {story.price.toLocaleString()}</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-red-950/20 border border-red-800/40 rounded-xl text-red-400 text-[10px] text-center font-medium leading-relaxed">
                        ⚠️ Salio lako la TZS {user.balance.toLocaleString()} halitoshi kununua simulizi hii inayogharimu TZS {story.price.toLocaleString()}. Tafadhali funga panel hii uende kwenye tab ya 'Wasifu' kuongeza salio.
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-colors"
                      >
                        Nenda Ongeza Salio
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 1. MOBILE MONEY CHECKOUT */}
              {paymentType === 'MOBILE' && (
                <form onSubmit={handleStartPayment} className="space-y-4">
                  <div className="text-center py-1 bg-white/2 rounded-xl border border-white/5 p-2">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                      Chagua mtandao wa simu kisha uingize namba kupokea ombi la USSD Push (PIN).
                    </p>
                  </div>

                  {/* Operator grid selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {(['MPESA', 'AIRTEL', 'TIGO'] as const).map((op) => {
                      let opName = 'M-Pesa';
                      let activeBorder = 'border-red-650 font-bold';
                      let logoBg = 'bg-red-650';
                      if (op === 'AIRTEL') {
                        opName = 'Airtel';
                        activeBorder = 'border-red-500 font-bold';
                        logoBg = 'bg-red-500';
                      } else if (op === 'TIGO') {
                        opName = 'TigoPesa';
                        activeBorder = 'border-blue-600 font-bold';
                        logoBg = 'bg-blue-600';
                      }

                      const isActive = operator === op;

                      return (
                        <button
                          key={op}
                          id={`select-op-${op}`}
                          type="button"
                          onClick={() => setOperator(op)}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? `${activeBorder} bg-white/10 text-white border-gold-500`
                              : 'border-white/5 bg-white/2 hover:bg-white/5 text-neutral-400'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${logoBg} mb-1.5`}></div>
                          <span className="text-[9px] uppercase font-mono tracking-wider">{opName}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Input for Phone number */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                      Namba ya Simu ya Malipo
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-neutral-400 font-mono select-none">TZ</span>
                      <input
                        id="payment-phone-input"
                        type="tel"
                        placeholder="07xxxxxxxx"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full glass-input rounded-xl py-1.5 pl-8 pr-3 text-xs text-neutral-250 outline-none font-mono tracking-wider"
                        required={paymentType === 'MOBILE'}
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="flex items-start gap-1.5 p-2 bg-red-955/50 border border-red-900 rounded-lg text-red-400 text-[10px] leading-relaxed">
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Confirm submit trigger button */}
                  <button
                    id="submit-payment-btn"
                    type="submit"
                    className="w-full btn-glass-prime py-2.5 rounded-xl text-xs uppercase tracking-widest font-display cursor-pointer font-bold"
                  >
                    Lipia TZS {story.price.toLocaleString()} Sasa
                  </button>
                </form>
              )}

              {/* 2. CARD ONLINE CHECKOUT */}
              {paymentType === 'CARD' && (
                <form onSubmit={handleCardPaymentSubmit} className="space-y-3">
                  <div className="text-center py-1 bg-white/2 rounded-xl border border-white/5 p-2">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                      Lipa salama kwa kadi ya Visa au MasterCard kupitia kiunganishi salama cha kibenki.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Jina la kadi (Cardholder)</label>
                    <input
                      type="text"
                      placeholder="Mfano: Iddy Abubakar"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full glass-input rounded-xl py-1.5 px-3 text-xs text-neutral-200 outline-none font-sans"
                      required={paymentType === 'CARD'}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Namba ya Kadi (Card Number)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4000 1234 5678 9010"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                          setCardNumber(val);
                        }}
                        className="w-full glass-input rounded-xl py-1.5 pl-3 pr-8 text-xs text-neutral-200 outline-none font-mono"
                        required={paymentType === 'CARD'}
                      />
                      <CreditCard className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Kuisha (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.length === 2 && !val.includes('/')) {
                            val = val + '/';
                          }
                          setCardExpiry(val);
                        }}
                        className="w-full glass-input rounded-xl py-1.5 px-3 text-xs text-neutral-200 outline-none font-mono"
                        required={paymentType === 'CARD'}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">CVC/CVV</label>
                      <input
                        type="password"
                        placeholder="***"
                        maxLength={3}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        className="w-full glass-input rounded-xl py-1.5 px-3 text-xs text-neutral-200 outline-none font-mono"
                        required={paymentType === 'CARD'}
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="flex items-start gap-1.5 p-2 bg-red-955/50 border border-red-900 rounded-lg text-red-400 text-[10px] leading-relaxed">
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCardProcessing}
                    className="w-full btn-glass-prime py-2.5 rounded-xl text-xs uppercase tracking-widest font-display cursor-pointer font-bold flex items-center justify-center gap-1.5"
                  >
                    {isCardProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Inachakata Kadi...</span>
                      </>
                    ) : (
                      <span>Lipia TZS {story.price.toLocaleString()} Sasa</span>
                    )}
                  </button>
                </form>
              )}

              {/* 3. GOOGLE PAY INSTANT CHECKOUT */}
              {paymentType === 'GPAY' && (
                <div className="space-y-4 py-3 flex flex-col items-center justify-center">
                  <div className="text-center py-2 bg-white/2 rounded-xl border border-white/5 p-3 w-full">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                      Malipo ya papo hapo kupitia akiba ya kadi iliyoko kwenye simu yako au kivinjari chako cha Google.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGooglePayTrigger}
                    disabled={isGpayProcessing}
                    className="w-full bg-neutral-900 border border-neutral-750 hover:border-white/20 hover:bg-neutral-850 rounded-2xl py-3 px-4 shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 duration-200 relative overflow-hidden"
                  >
                    <span className="font-extrabold text-xs font-sans text-white tracking-tight flex items-center gap-1">
                      <span className="text-white">Pay with</span>
                      <span className="text-blue-450">G</span>
                      <span className="text-red-500">o</span>
                      <span className="text-yellow-500 font-bold">o</span>
                      <span className="text-blue-500">g</span>
                      <span className="text-green-500 font-bold">l</span>
                      <span className="text-red-500">e</span>
                      <span className="text-neutral-200 ml-0.5 font-bold">Pay</span>
                    </span>
                    {isGpayProcessing && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5 text-[8.5px] text-neutral-500 font-mono">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Inatumia uthibitisho wa kibaolojia (Biometrics Lock)</span>
                  </div>
                </div>
              )}

              {/* 4. INTERNATIONAL PAYMENTS */}
              {paymentType === 'INT_METHODS' && (
                <div className="space-y-4">
                  {/* Selector for Int provider */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                    {(['PAYPAL', 'APPLEPAY', 'STRIPE'] as const).map((m) => {
                      const isSelected = selectedIntMethod === m;
                      const label = m === 'PAYPAL' ? 'PayPal' : m === 'APPLEPAY' ? 'Apple Pay' : 'Stripe';
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => { setSelectedIntMethod(m); setErrorMsg(''); }}
                          className={`text-center py-1 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-gold-500 text-black shadow-md font-extrabold' 
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Pricing info details */}
                  <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] text-neutral-400 block font-mono">KIASI CHA KULIPIA (CONVERTED AMOUNT)</span>
                    <span className="text-base font-black font-display text-gold-400 block">
                      ${(story.price / 2600).toFixed(2)} USD
                    </span>
                    <span className="text-[8px] text-neutral-500 block mt-0.5 leading-none">
                      Sawa na TZS {story.price.toLocaleString()} (Viwango vya makadirio)
                    </span>
                  </div>

                  {/* 4.1 PAYPAL SUBFORM */}
                  {selectedIntMethod === 'PAYPAL' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Barua Pepe ya PayPal (PayPal Email)</label>
                        <input
                          type="email"
                          placeholder="Mfano: client@paypal.com"
                          value={intEmail}
                          onChange={(e) => setIntEmail(e.target.value)}
                          className="w-full glass-input rounded-xl py-1.5 px-3 text-xs text-neutral-220 outline-none font-mono"
                          required
                        />
                      </div>
                      <p className="text-[9px] text-neutral-400 leading-normal bg-blue-950/20 border border-blue-900/10 p-2 rounded-lg">
                        Kuendelea kutakuelekeza kwenye weka PIN ya PayPal na kukatwa tarakimu za usalama salama katika dola za kimarekani.
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (!intEmail.includes('@')) {
                            setErrorMsg('Tafadhali weka barua pepe sahihi ya PayPal!');
                            return;
                          }
                          setErrorMsg('');
                          setIsIntProcessing(true);
                          setTimeout(() => {
                            setIsIntProcessing(false);
                            setStep('success');
                          }, 2000);
                        }}
                        disabled={isIntProcessing}
                        className="w-full bg-[#ffc439] hover:brightness-110 text-[#003087] font-black py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        {isIntProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#003087]" />
                        ) : (
                          <span>Lipia na PayPal Sasa</span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 4.2 APPLE PAY SUBFORM */}
                  {selectedIntMethod === 'APPLEPAY' && (
                    <div className="space-y-3 text-center flex flex-col items-center">
                      <p className="text-[10px] text-neutral-300 leading-relaxed bg-white/2 p-2 border border-white/5 rounded-xl w-full">
                        Tumia akiba ya Apple Wallet kamilisha kwa haraka mno.
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setIsIntProcessing(true);
                          setTimeout(() => {
                            setIsIntProcessing(false);
                            setStep('success');
                          }, 1800);
                        }}
                        disabled={isIntProcessing}
                        className="w-full bg-white hover:bg-neutral-100 text-black font-semibold py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer relative overflow-hidden"
                      >
                        {isIntProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="font-sans font-extrabold text-sm font-display lowercase"></span> Pay with Apple Pay
                          </span>
                        )}
                      </button>
                      <span className="text-[8.5px] text-neutral-500 font-mono">Bila ada ya ziada juu ya muamala</span>
                    </div>
                  )}

                  {/* 4.3 STRIPE SUBFORM */}
                  {selectedIntMethod === 'STRIPE' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Kadi ya Nje</label>
                          <input
                            type="text"
                            placeholder="4242 4242 4242..."
                            maxLength={19}
                            className="w-full glass-input rounded-xl py-1.5 px-3 text-xs text-neutral-220 outline-none font-mono"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block font-sans">Expiry & CVC</label>
                          <input
                            type="text"
                            placeholder="12/29 • 123"
                            className="w-full glass-input rounded-xl py-1.5 px-3 text-xs text-neutral-220 outline-none font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Barua Pepe ya Stakabadhi (Stripe Billing Email)</label>
                        <input
                          type="email"
                          placeholder="Mtumiaji@gmail.com"
                          value={intEmail}
                          onChange={(e) => setIntEmail(e.target.value)}
                          className="w-full glass-input rounded-xl py-1.5 px-3 text-xs text-neutral-220 outline-none font-mono"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!intEmail.includes('@')) {
                            setErrorMsg('Tafadhali weka barua pepe sahihi ya kutumia risiti!');
                            return;
                          }
                          setErrorMsg('');
                          setIsIntProcessing(true);
                          setTimeout(() => {
                            setIsIntProcessing(false);
                            setStep('success');
                          }, 2000);
                        }}
                        disabled={isIntProcessing}
                        className="w-full bg-[#635bff] hover:brightness-110 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        {isIntProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Kamilisha na Stripe Secure</span>
                        )}
                      </button>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="flex items-start gap-1.5 p-2 bg-red-955/50 border border-red-900 rounded-lg text-red-400 text-[10px] leading-relaxed">
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Safe Checkout Badge */}
              <div className="flex items-center gap-1.5 justify-center py-1 text-[9.5px] text-neutral-500 border-t border-white/5 pt-3">
                <Shield className="w-3.5 h-3.5 text-gold-500" />
                <span>Malipo salama ya kielektroniki yamesimbwa kwa SSL 256-bit</span>
              </div>
            </div>
          )}

          {step === 'push' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-white/10 border-t-gold-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-gold-500 font-mono">{countdown}s</span>
                </div>
              </div>

              <div className="space-y-1">
                <h5 className="font-semibold text-sm">Tunakutumia ombi la USSD...</h5>
                <p className="text-xs text-neutral-450">
                  Tafadhali angalia screen ya simu yako kisha uruhusu muamala kuashiria malipo.
                </p>
              </div>

              {/* High simulated notification popup banner absolute rendering inside frame */}
              <div className="w-full p-4 glass-card border border-white/10 rounded-2xl shadow-2xl text-left scale-95 animate-pulse">
                <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-2">
                  <span className="text-[9px] font-bold text-neutral-400 font-mono">PUSH POPUP SIMULATOR</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                </div>
                <p className="text-xs text-neutral-205 leading-normal">
                  <span className="font-bold text-gold-550 uppercase">{currentStyle.name}</span>: Je, unaruhusu malipo ya <span className="font-bold">TZS {story.price}</span> kwenda <span className="font-bold">SIMULIZI APP</span>?
                </p>
                <button
                  id="simulate-click-push"
                  type="button"
                  onClick={() => setStep('pin')}
                  className="mt-3 w-full bg-black/40 text-gold-450 border border-gold-500/20 py-1.5 rounded-lg text-[10px] font-bold hover:bg-black/60 transition-colors"
                >
                  BONYEZA HAPA KUWEKA PIN KWA HARAKA
                </button>
              </div>
            </div>
          )}

          {step === 'pin' && (
            <form onSubmit={verifyPin} className="space-y-4">
              <div className="text-center">
                <div className={`inline-block p-1 bg-black/45 border ${currentStyle.border} rounded-lg text-[10px] font-bold font-mono tracking-wider ${currentStyle.text} mb-2 uppercase px-3`}>
                  SIMULET CO-FINANCE ({operator})
                </div>
                <h5 className="font-bold text-sm">Weka PIN ya Muamala</h5>
                <p className="text-xs text-neutral-455">
                  Weka PIN ya mtandao wako ili kukamilisha kutoa TZS {story.price.toLocaleString()}
                </p>
              </div>

              <div className="flex justify-center py-2">
                <input
                  id="payment-pin-input"
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setEnteredPin(val);
                  }}
                  className="w-28 text-center glass-input tracking-[0.8em] font-black py-2.5 rounded-xl text-base outline-none text-gold-400"
                  required
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="flex items-start gap-1.5 p-2 bg-red-950/50 border border-red-800/80 rounded-lg text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Cute mock numeric dial to speed up input clicking inside Web environment */}
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((num, i) => {
                  return (
                    <button
                      key={i}
                      id={`pin-button-${num}`}
                      type="button"
                      onClick={() => {
                        if (num === 'C') {
                           setEnteredPin('');
                        } else if (num === '✓') {
                          if (enteredPin.length === 4) setStep('success');
                        } else {
                          if (enteredPin.length < 4) {
                            setEnteredPin(prev => prev + num);
                          }
                        }
                      }}
                      className="aspect-square flex items-center justify-center p-1 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono font-bold active:bg-gradient-to-r active:from-gold-500 active:to-orange-500 active:text-neutral-950 transition-colors cursor-pointer"
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <button
                id="sumbit-pin-btn"
                type="submit"
                className={`w-full ${currentStyle.bg} text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wide transition-colors hover:opacity-95 cursor-pointer`}
              >
                Kamilisha Malipo Salaama
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-gold-500 stroke-[2.5]" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-gold-500 flex items-center justify-center text-[8px] text-neutral-950 font-bold font-mono">
                    ★
                  </span>
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold font-display text-gold-400">ASANTE SANA!</h4>
                <p className="text-sm font-semibold text-neutral-100">Malipo Yamekamilika</p>
                <p className="text-xs text-neutral-400 leading-relaxed px-4">
                  Muamala wako wa TZS {story.price.toLocaleString()} umethibitishwa. Sasa unaweza kusoma simulizi yote ya <span className="text-neutral-200">"{story.title}"</span> bila kikomo!
                </p>
              </div>

              <div className="w-full glass-card border border-white/5 p-3 rounded-2xl text-[10px] text-left font-mono text-neutral-550 space-y-1">
                <div>Kumbukumbu: MP-{Math.random().toString().slice(2, 10).toUpperCase()}</div>
                <div>Mtandao: {operator} Pesa</div>
                <div>Namba: {phone}</div>
                <div>Hali: IMESAFISHWA</div>
              </div>

              <button
                id="finish-payment-success"
                onClick={handleFinishSuccess}
                className="w-full btn-glass-prime py-2.5 rounded-xl text-xs uppercase tracking-widest font-display cursor-pointer"
              >
                Anza Kusoma Sasa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
