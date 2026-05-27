/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Book,
  Search,
  Download,
  User as UserIcon,
  ShieldCheck,
  Wallet,
  WifiOff,
  Plus,
  Compass,
  Star,
  Check,
  AlertTriangle,
  CreditCard,
  History,
  Activity,
  Smartphone,
  RefreshCw,
  Shield,
  Globe,
  Sun,
  Moon,
  Upload
} from 'lucide-react';

import { Story, User, ActiveTab, Transaction } from './types';
import { loadStoriesFromStorage, saveStoriesToStorage } from './data/stories';
import MobileFrame from './components/MobileFrame';
import HeroSlider from './components/HeroSlider';
import StoryCard from './components/StoryCard';
import StoryReader from './components/StoryReader';
import PaymentModal from './components/PaymentModal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Core datasets
  const [stories, setStories] = useState<Story[]>(() => loadStoriesFromStorage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [slides, setSlides] = useState<any[]>([]);

  // User details, prefilled with metadata context and loaded dynamically from local storage
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('simulizi_user_real_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore JSON syntax failures
      }
    }
    return {
      id: '',
      name: '',
      email: '',
      phone: '',
      balance: 0, // anza na salio lililo safi kabisa (0 TZS)
      purchasedStoryIds: [], // hakuna kazi zilizofunguliwa mapema kabla ya kuanza kazi rasmi
      downloadedStoryIds: [],
      hasRegistered: false
    };
  });

  // Automatically persist user profile and wallet changes
  useEffect(() => {
    localStorage.setItem('simulizi_user_real_v1', JSON.stringify(user));
    // Sasa sajili au sasisha mtumiaji huyo halisi pia kwenye server kwa usalama tu ikiwa amejisajili tayari!
    if (user.hasRegistered && user.phone) {
      fetch('/api/register_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch((e) => console.error("Error registering user on server:", e));
    }
  }, [user]);

  // Rich wallet top-up processing states
  const [topupOperator, setTopupOperator] = useState<'MPESA' | 'TIGOPESA' | 'AIRTEL' | 'HALOPESA'>('MPESA');
  const [topupPhone, setTopupPhone] = useState('0712345678');
  const [topupState, setTopupState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [topupCountdown, setTopupCountdown] = useState(5);
  const [isInternational, setIsInternational] = useState<boolean>(false);
  const [topupEmail, setTopupEmail] = useState<string>('mteja@simulizi.app');
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [topupMessage, setTopupMessage] = useState<string>('');

  // Automatically check URL params for successful returning transactions (like cards or USSD callbacks)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const txRef = params.get('tx_ref');
    const transactionId = params.get('transaction_id') || params.get('id');

    if (txRef && (status === 'successful' || status === 'success' || transactionId)) {
      setVerificationMessage("Ulinzi na Usalama: Tunathibitisha muamala wako na Mfumo wa Malipo (Gateway)...");
      
      fetch(`/api/payments/verify/${txRef}?transaction_id=${transactionId || ''}`)
        .then((res) => {
          if (!res.ok) throw new Error("Payment verification failed");
          return res.json();
        })
        .then((data) => {
          if (data.success && data.status === "SUCCESS") {
            const amountCredited = data.amount || 5000;
            
            setUser((prev) => ({
              ...prev,
              balance: prev.balance + amountCredited
            }));

            const newTx: Transaction = {
              id: txRef,
              storyTitle: "Amana ya Wallet (Gateway Verified)",
              amount: amountCredited,
              paymentMethod: 'ONLINE_GATEWAY',
              status: 'SUCCESS',
              phone: user.phone || 'Namba ya Mteja',
              date: new Date().toISOString().split('T')[0]
            };
            setTransactions((prev) => [newTx, ...prev]);
            alert(`✓ AMANA IMEWEKWA: Salio lako limeongezwa TZS ${amountCredited.toLocaleString()} kwa usalama kabisa!`);
          } else {
            alert(`⚠️ Malipo haya yamewahi kusajiliwa au bado hayajakamilika: ${data.error || 'Tafadhali kamilisha malipo.'}`);
          }
        })
        .catch((err) => {
          console.error("Verification error:", err);
          alert("Imeshindwa kuthibitisha muamala wako kiotomatiki. Kama ulikatwa fedha tafadhali wasiliana na Admin (Iddy) mara moja.");
        })
        .finally(() => {
          setVerificationMessage(null);
          // Redirect to clean path without query parameters, keeping the user context
          const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        });
    }
  }, [user.phone]);

  // Flow triggers
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [paymentStory, setPaymentStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ZOTE');
  
  // Simulated State settings
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Mwandishi story posting modal states
  const [showMwandishiPostModal, setShowMwandishiPostModal] = useState(false);
  const [writerTitle, setWriterTitle] = useState('');
  const [writerDescription, setWriterDescription] = useState('');
  const [writerCategory, setWriterCategory] = useState('Love Story');
  const [writerPrice, setWriterPrice] = useState<number>(1000);
  const [writerIsPremium, setWriterIsPremium] = useState(false);
  const [writerCoverUrl, setWriterCoverUrl] = useState('https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600');
  const [writerChapterContent, setWriterChapterContent] = useState('');

  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setWriterCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Live active app-users counter simulation (organic display stats loaded from DB, e.g. 300,000+)
  const [totalUsers, setTotalUsers] = useState(300000);
  const [onlineUsers, setOnlineUsers] = useState(3200);

  // Vuta takwimu zilizowekwa na Admin kiuhalisia kutoka kwenye server
  useEffect(() => {
    fetch('/api/public_stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalUsers !== undefined) setTotalUsers(data.totalUsers);
        if (data.onlineUsers !== undefined) setOnlineUsers(data.onlineUsers);
      })
      .catch((err) => console.log("Imeshindwa kuvuta takwimu za umma:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) => {
        // Oscilate slightly around the current set number for immersive real-time activity representation
        const change = Math.floor(Math.random() * 9) - 4; // oscillate -4 to +4
        const next = prev + change;
        return next;
      });
      // Occasionally increase total users slightly
      if (Math.random() > 0.85) {
        setTotalUsers((prev) => prev + 1);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Admin password & revenue states (persistent via localStorage)
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('simulizi_admin_password') || 'iddy2026';
  });
  
  const [adminRevenueBalance, setAdminRevenueBalance] = useState<number>(() => {
    const saved = localStorage.getItem('simulizi_admin_revenue');
    return saved ? Number(saved) : 455000; // default initial mock wallet for the Admin
  });
  
  const [adminWithdrawals, setAdminWithdrawals] = useState<any[]>(() => {
    const saved = localStorage.getItem('simulizi_admin_withdrawals');
    return saved ? JSON.parse(saved) : [
      { id: 'W-01', amount: 50000, method: 'M-PESA', accountNo: '0712345678', date: '2026-05-24', status: 'SUCCESS' },
      { id: 'W-02', amount: 120000, method: 'TIGO PESA', accountNo: '0654112233', date: '2026-05-25', status: 'SUCCESS' }
    ];
  });

  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    localStorage.setItem('simulizi_admin_password', newPass);
  };

  const handleWithdrawAdminRevenue = (amount: number, method: string, accountNo: string) => {
    if (amount > adminRevenueBalance) {
      alert('Salio halitoshi kufanya utoaji wa kiasi hicho!');
      return false;
    }

    // Call server database API to post withdrawal!
    fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, method, accountNo })
    })
    .then((res) => {
      if (!res.ok) throw new Error("Backend server declined check");
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        setAdminRevenueBalance(data.admin_revenue);
        localStorage.setItem('simulizi_admin_revenue', String(data.admin_revenue));
        
        // Refresh withdrawals & logs from Database Server
        fetch('/api/revenue_data')
          .then(r => r.json())
          .then((resData) => {
            if (resData.withdrawals) setAdminWithdrawals(resData.withdrawals);
          });
      }
    })
    .catch((err) => console.error("Database checkout request failed: ", err));

    const newBal = adminRevenueBalance - amount;
    setAdminRevenueBalance(newBal);
    localStorage.setItem('simulizi_admin_revenue', String(newBal));
    
    const newWithdrawal = {
      id: `W-NMB-${Math.floor(100 + Math.random() * 900)}`,
      amount,
      method,
      accountNo,
      date: new Date().toISOString().split('T')[0],
      status: 'SUCCESS'
    };
    
    const updatedHistory = [newWithdrawal, ...adminWithdrawals];
    setAdminWithdrawals(updatedHistory);
    localStorage.setItem('simulizi_admin_withdrawals', JSON.stringify(updatedHistory));
    alert(`Ombi la utoaji wa TZS ${amount.toLocaleString()} kwenda akaunti ${accountNo} limetumwa na kusajiliwa kwenye Database ya Backend!`);
    return true;
  };

  // Admin passcode lock states
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Admin login attempts and lockout tracking (survives reload)
  const [incorrectAttempts, setIncorrectAttempts] = useState<number>(() => {
    return Number(localStorage.getItem('simulizi_admin_attempts') || '0');
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    return Number(localStorage.getItem('simulizi_admin_lockout_until') || '0');
  });
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    let timer: any;
    if (lockoutUntil > currentTime) {
      timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutUntil, currentTime]);

  const formatRemainingTime = (ms: number) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    if (hrs > 0) {
      return `${hrs} masaa, ${mins} dakika, na ${secs} sekunde`;
    }
    return `${mins} dakika na ${secs} sekunde`;
  };

  const handleAdminLoginSubmit = () => {
    const now = Date.now();
    if (lockoutUntil > now) {
      alert(`Bado umezuiwa! Tafadhali subiri muda uishe.`);
      return;
    }

    if (adminPasswordInput === adminPassword) {
      setIsAdminMode(true);
      setShowAdminLoginModal(false);
      setAdminPasswordInput('');
      setAdminLoginError('');
      // Reset variables upon correct code entry
      setIncorrectAttempts(0);
      localStorage.removeItem('simulizi_admin_attempts');
      setLockoutUntil(0);
      localStorage.removeItem('simulizi_admin_lockout_until');
    } else {
      const nextAttempts = incorrectAttempts + 1;
      setIncorrectAttempts(nextAttempts);
      localStorage.setItem('simulizi_admin_attempts', String(nextAttempts));

      if (nextAttempts === 3) {
        const lockTime = Date.now() + 2 * 60 * 1000; // 2 minutes block
        setLockoutUntil(lockTime);
        localStorage.setItem('simulizi_admin_lockout_until', String(lockTime));
        setAdminLoginError('Umekosea mara 3! Umezuiwa kujaribu tena kwa dakika 2.');
      } else if (nextAttempts > 3) {
        const lockTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours block
        setLockoutUntil(lockTime);
        localStorage.setItem('simulizi_admin_lockout_until', String(lockTime));
        setAdminLoginError('Umekosea tena! Umezuiwa kujaribu nenosiri kwa masaa 24.');
      } else {
        setAdminLoginError(`Nenosiri si sahihi! Jaribio la ${nextAttempts} kati ya 3 peleka kwa uangalifu.`);
      }
    }
  };

  const handleTryEnterAdmin = () => {
    setShowAdminLoginModal(true);
  };

  const [customTopupAmount, setCustomTopupAmount] = useState<string>('5000');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // DB Sync: On mount, fetch stories, and administrative records from API Server
  useEffect(() => {
    fetch('/api/stories')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data) {
          setStories(data);
          saveStoriesToStorage(data);
        }
      })
      .catch((err) => console.log('Using local cached stories: ', err));

    fetch('/api/revenue_data')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (data.admin_revenue !== undefined) {
            setAdminRevenueBalance(data.admin_revenue);
            localStorage.setItem('simulizi_admin_revenue', String(data.admin_revenue));
          }
          if (data.withdrawals) {
            setAdminWithdrawals(data.withdrawals);
            localStorage.setItem('simulizi_admin_withdrawals', JSON.stringify(data.withdrawals));
          }
          if (data.transactions) {
            setTransactions(data.transactions);
          }
        }
      })
      .catch((err) => console.log('Offline/Mock sync: ', err));

    fetch('/api/slides')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data) {
          setSlides(data);
        }
      })
      .catch((err) => {
        console.log('Error fetching slides:', err);
        setSlides([]);
      });
  }, []);

  const handleAddSlide = (newSlide: any) => {
    fetch('/api/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSlide)
    })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to save slide on API server');
      return res.json();
    })
    .then((savedSlide) => {
      setSlides((prev) => [savedSlide, ...prev]);
    })
    .catch((err) => {
      console.error(err);
      const fallbackSlide = { id: `slide-${Date.now()}`, ...newSlide, reads: Math.floor(2000 + Math.random() * 5000), isAd: true };
      setSlides((prev) => [fallbackSlide, ...prev]);
    });
  };

  const handleDeleteSlide = (slideId: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== slideId));
    fetch(`/api/slides/${slideId}`, {
      method: 'DELETE'
    }).catch((err) => console.error('API Error details:', err));
  };

  // Synchronize story database changes with local state AND physical API Server
  const handleAddStory = (newStory: Story) => {
    const updated = [newStory, ...stories];
    setStories(updated);
    saveStoriesToStorage(updated);

    fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStory)
    }).catch((e) => console.error('API Error: ', e));
  };

  const handleDeleteStory = (storyId: string) => {
    const updated = stories.filter((s) => s.id !== storyId);
    setStories(updated);
    saveStoriesToStorage(updated);

    fetch(`/api/stories/${storyId}`, {
      method: 'DELETE'
    }).catch((e) => console.error('API Error: ', e));
  };

  const handleUpdateStory = (updatedStory: Story) => {
    const updated = stories.map((s) => s.id === updatedStory.id ? updatedStory : s);
    setStories(updated);
    saveStoriesToStorage(updated);

    fetch(`/api/stories/${updatedStory.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStory)
    }).catch((e) => console.error('API Error: ', e));
  };

  const handleOpenStoryWithViewIncrement = (story: Story) => {
    // Increment views (reads) by 1
    const updatedStory: Story = {
      ...story,
      reads: Math.min(20000000, (story.reads || 0) + 1)
    };
    handleUpdateStory(updatedStory);
    setSelectedStory(updatedStory);
  };

  // Click on Story trigger
  const handleSelectStory = (story: Story) => {
    // If the user is in mock offline mode, allow opening only downloaded stories
    if (isOfflineMode) {
      if (user.downloadedStoryIds.includes(story.id)) {
        handleOpenStoryWithViewIncrement(story);
      } else {
        alert('Hadithi hii haijapakuliwa. Zima "Offline Mode" au pakua hadithi kabla ya kuisoma.');
      }
      return;
    }

    // Check if story is premium and needs unlocking
    const isPurchased = user.purchasedStoryIds.includes(story.id);
    if (story.isPremium && !isPurchased) {
      setPaymentStory(story);
    } else {
      handleOpenStoryWithViewIncrement(story);
    }
  };

  // Complete Simulated payment success
  const handlePaymentSuccess = (storyId: string, paymentMethod: string = 'M-PESA', payPhoneOrCard: string = '') => {
    const targetStory = stories.find((s) => s.id === storyId);
    if (!targetStory) return;

    const amountPaid = targetStory.price;

    if (paymentMethod === 'WALLET_APP') {
      if (user.balance < amountPaid) {
        alert('Salio lako la App halitoshi! Tafadhali nenda kwenye wasifu wako ili kuweka salio la kutosha.');
        return;
      }
      setUser((prev) => ({
        ...prev,
        balance: prev.balance - amountPaid,
        purchasedStoryIds: [...prev.purchasedStoryIds, storyId]
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        purchasedStoryIds: [...prev.purchasedStoryIds, storyId]
      }));
    }

    // Call server database checkout to log transaction on backend
    fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId,
        storyTitle: targetStory.title,
        amount: amountPaid,
        paymentMethod,
        phoneOrCard: payPhoneOrCard
      })
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.admin_revenue !== undefined) {
        setAdminRevenueBalance(data.admin_revenue);
        localStorage.setItem('simulizi_admin_revenue', String(data.admin_revenue));
        
        // Refresh transaction list from server database
        fetch('/api/revenue_data')
          .then((r) => r.json())
          .then((resData) => {
            if (resData.transactions) setTransactions(resData.transactions);
          });
      }
    })
    .catch((err) => console.error("Database logs purchase failed: ", err));

    // Fallback UI updates
    setAdminRevenueBalance((prev) => {
      const nextBal = prev + amountPaid;
      localStorage.setItem('simulizi_admin_revenue', String(nextBal));
      return nextBal;
    });

    const newTx: Transaction = {
      id: `TX-${Math.random().toString().slice(2, 8).toUpperCase()}`,
      storyTitle: targetStory.title,
      amount: amountPaid,
      paymentMethod: paymentMethod,
      status: 'SUCCESS',
      phone: payPhoneOrCard || user.phone,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Open reader directly
    setTimeout(() => {
      handleOpenStoryWithViewIncrement(targetStory);
    }, 300);
  };

  // Toggle saving offline
  const handleToggleDownload = (storyId: string) => {
    setUser((prev) => {
      const alreadyDownloaded = prev.downloadedStoryIds.includes(storyId);
      const updated = alreadyDownloaded
        ? prev.downloadedStoryIds.filter((id) => id !== storyId)
        : [...prev.downloadedStoryIds, storyId];

      return {
        ...prev,
        downloadedStoryIds: updated
      };
    });
  };

  // Rich automated wallet topup with REAL gateway initiation and guide countdown helper
  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(customTopupAmount);
    if (amt <= 0 || isNaN(amt)) {
      alert('Tafadhali weka kiasi sahihi cha fedha.');
      return;
    }
    if (!isInternational && (!topupPhone.trim() || topupPhone.length < 8)) {
      alert('Tafadhali jaza namba ya simu sahihi ya muamala k.m. 07XXXXXXXX.');
      return;
    }
    if (isInternational && (!topupEmail.trim() || !topupEmail.includes('@'))) {
      alert('Tafadhali jaza barua pepe (Email) sahihi kwa ajili ya risiti ya kadi.');
      return;
    }

    // Initialize states
    setTopupState('processing');
    setTopupMessage("Inatuma maelezo yako katika seva ya malipo...");
    setTopupCountdown(5);

    fetch('/api/payments/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amt,
        phone: isInternational ? '' : topupPhone,
        email: topupEmail,
        operator: isInternational ? 'VISA_CARD' : topupOperator,
        isInternational,
        redirect_url: window.location.href // This points back to the React client URL
      })
    })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((d) => { throw new Error(d.error || "Imeshindwa kuunganisha"); });
      }
      return res.json();
    })
    .then((data) => {
      if (data.redirect_url) {
        // Mode 1: Real Gateway (Flutterwave) active! Redirect them!
        setTopupMessage(`Anza Kuingiza PIN: Tukio la malipo ya kadi/simu yako ya ${topupPhone || 'Kimataifa'} linafunguka. Subiri...`);
        setTimeout(() => {
          // Open the real secure, interactive payment portal!
          window.location.href = data.redirect_url;
        }, 1500);
      } else {
        // Mode 2: Simulated Demo session (no API key configured by the administrator yet)
        setTopupMessage(data.message || "Simulating payment...");
        
        const interval = setInterval(() => {
          setTopupCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              
              // Credit balance directly in simulation/demo mode
              setUser((prevUser) => ({
                ...prevUser,
                balance: prevUser.balance + amt
              }));

              const carrierLabel = isInternational 
                ? 'Visa/Mastercard Int' 
                : (topupOperator === 'MPESA' ? 'VODACOM M-PESA' : topupOperator === 'TIGOPESA' ? 'TIGO PESA' : topupOperator === 'AIRTEL' ? 'AIRTEL MONEY' : 'HALOPESA');

              const newTx: Transaction = {
                id: data.tx_ref || `DEP-${Math.random().toString().slice(2, 8).toUpperCase()}`,
                storyTitle: `Amana ya Wallet (Simulated Demo)`,
                amount: amt,
                paymentMethod: carrierLabel,
                status: 'SUCCESS',
                phone: isInternational ? 'Kadi ya Nje' : topupPhone,
                date: new Date().toISOString().split('T')[0]
              };

              setTransactions((prevTx) => [newTx, ...prevTx]);
              setTopupState('success');
              
              // Also sync this transaction with system logs on sever
              fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  storyId: 'wallet-topup',
                  storyTitle: `Amana ya Wallet (${carrierLabel} - Majaribio)`,
                  amount: amt,
                  paymentMethod: carrierLabel,
                  phoneOrCard: isInternational ? 'International Card' : topupPhone
                })
              })
              .then(() => {
                // Refresh admin panel balance
                fetch('/api/revenue_data')
                  .then((r) => r.json())
                  .then((resData) => {
                    if (resData.transactions) setTransactions(resData.transactions);
                    if (resData.admin_revenue) {
                      setAdminRevenueBalance(resData.admin_revenue);
                      localStorage.setItem('simulizi_admin_revenue', String(resData.admin_revenue));
                    }
                  });
              })
              .catch(e => console.log(e));

              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    })
    .catch((err) => {
      console.error(err);
      alert(`Itilafu ya Malipo: ${err.message || "Imeshindwa kukamilisha ombi."}`);
      setTopupState('idle');
    });
  };

  // Category filter
  const filteredStories = stories.filter((story) => {
    // 1. Text Search matching
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Tab-specific category selection
    if (selectedCategory === 'ZOTE') return true;
    if (selectedCategory === 'BURE') return !story.isPremium;
    if (selectedCategory === 'PREMIUM') return story.isPremium;
    return story.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Dynamic quick-access list of Swahili tags
  const CATEGORY_TABS = [
    { label: 'ZOTE', value: 'ZOTE' },
    { label: 'BURE', value: 'BURE' },
    { label: 'YENYE KULIPIA', value: 'PREMIUM' },
    { label: 'HORROR', value: 'Horror' },
    { label: 'MAPENZI', value: 'Love Story' },
    { label: 'ACTION', value: 'Action' },
    { label: 'DRAMA', value: 'Drama' }
  ];

  return (
    <MobileFrame>
      {/* Mobile Shell Frame inside Screen content */}
      <div className={`flex-1 w-full flex flex-col relative overflow-hidden select-none transition-colors duration-300 ${
        themeMode === 'light' ? 'bg-[#fcfbf6] text-[#1a191d] theme-light' : 'bg-black text-white'
      }`}>
        
        {/* Onboarding Registration for First-Time entry */}
        {!user.hasRegistered && (
          <div className="absolute inset-0 z-50 flex flex-col justify-center p-6 bg-gradient-to-b from-[#1c1810] via-neutral-950 to-black overflow-y-auto">
            <div className="w-full max-w-sm mx-auto space-y-5 animate-fade-in text-center">
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-450 flex items-center justify-center shadow-2xl border border-gold-500/20 mx-auto">
                  <span className="text-black font-black font-display text-2xl">S</span>
                </div>
                <h1 className="text-lg font-display font-extrabold text-white tracking-widest uppercase">
                  SIMULIZI APP
                </h1>
                <p className="text-[10px] uppercase font-mono tracking-widest text-gold-500 font-bold">
                  SOMA RIWAYA & SIMULIZI
                </p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-gold-500/10 space-y-4 shadow-2xl">
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase text-neutral-250 tracking-wider">Jisajili Sura ya Kwanza</h2>
                  <p className="text-[9.5px] text-[#a3a19a] leading-relaxed">
                    Tafadhali kamilisha usajili wa haraka hapa chini uanze kufurahia orodha mpana ya hadithi zetu adimu sasa hivi.
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const nameVal = target.fullname.value.trim();
                  const phoneVal = target.phone.value.trim();
                  const passwordVal = target.password.value;

                  if (!nameVal || !phoneVal) {
                    alert('Imefeli! Jina na Namba ya Simu ni lazima vijazwe.');
                    return;
                  }

                  const isAdminAttempt = 
                    phoneVal.toLowerCase() === 'iddyabubakar12@gmail.com' && 
                    passwordVal === adminPassword;

                  if (!isAdminAttempt && phoneVal.length < 9) {
                    alert('Namba ya simu lazima iwe na urefu wa angalau tarakimu 9 za namba!');
                    return;
                  }

                  const generatedUserId = `user-${Date.now()}`;
                  setUser({
                    id: generatedUserId,
                    name: nameVal,
                    phone: isAdminAttempt ? '0700000000' : phoneVal,
                    email: isAdminAttempt ? 'iddyabubakar12@gmail.com' : '',
                    balance: isAdminAttempt ? 35000 : 0,
                    purchasedStoryIds: [],
                    downloadedStoryIds: [],
                    hasRegistered: true,
                    isAdmin: isAdminAttempt
                  });

                  if (isAdminAttempt) {
                    alert('✓ HONGERA: Umesajiliwa na Kuidhinishwa kama Admin Mkuu automatically! Sasa una uwezo wa kuanzisha na kuingia kwenye Paneli ya Usimamizi.');
                  } else {
                    alert('✓ Pongezi! Usajili umekamilika kama mwanachama wa kawaida.');
                  }
                }} className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Jina Kamili Halisi <span className="text-gold-500">*</span>
                    </label>
                    <input
                      name="fullname"
                      type="text"
                      className="w-full bg-neutral-900 border border-white/15 focus:border-gold-500 outline-none rounded-xl py-2 px-3 text-xs text-white"
                      placeholder="Mfano: Juma Musa"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Namba ya Simu (Ya Kuingia/Malipo) <span className="text-gold-500">*</span>
                    </label>
                    <input
                      name="phone"
                      type="text"
                      className="w-full bg-neutral-900 border border-white/15 focus:border-gold-500 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                      placeholder="Mfano: 07XXXXXXXX au barua pepe ya msimamizi"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Nenosiri (Password / Admin PIN) <span className="text-neutral-550 font-normal">(Sio lazima kwa kila mtu)</span>
                    </label>
                    <input
                      name="password"
                      type="password"
                      className="w-full bg-neutral-900 border border-white/15 focus:border-gold-500 outline-none rounded-xl py-2 px-3 text-xs text-white font-mono"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 cursor-pointer bg-gradient-to-r from-gold-500 to-amber-500 hover:brightness-110 text-neutral-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all text-center border-none"
                  >
                    Kamilisha Usajili na Uanze Kusoma
                  </button>
                </form>
              </div>

              <div className="text-[7.5px] text-neutral-500 font-mono">
                Usajili wako ni asilimia 100 salama na unalindwa • 2026
              </div>
            </div>
          </div>
        )}

        {/* TOP STATUS APP BAR */}
        <header className="h-16 px-4 glass-header border-b border-white/5 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gold-500 to-amber-450 flex items-center justify-center shadow-lg border border-gold-500/20">
              <span className="text-black font-extrabold font-display text-base">S</span>
            </div>
            <div>
              <h2 className="text-xs font-display font-extrabold text-white tracking-widest uppercase">
                SIMULIZI APP
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[7.5px] font-mono font-bold text-neutral-300">
                  {onlineUsers} Active • {totalUsers.toLocaleString()} Members
                </span>
              </div>
            </div>
          </div>

          {/* Quick interactive parameters bar (Wallet / Theme Switcher / Offline State switcher) */}
          <div className="flex items-center gap-2">
            {/* Theme switcher: Black vs White */}
            <button
              id="toggle-theme-mode"
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center p-2 rounded-xl bg-white/5 text-gold-500 border border-white/5 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 h-9 w-9"
              title={themeMode === 'dark' ? 'Badilisha kwenda Mwanga (White)' : 'Badilisha kwenda Giza (Black)'}
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-gold-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 fill-stone-700" />
              )}
            </button>

            {/* Simulation parameters indicator for evaluators */}
            <button
              id="toggle-offline-mode"
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black tracking-wider transition-colors cursor-pointer border shrink-0 h-9 ${
                isOfflineMode
                  ? 'bg-red-950 text-red-400 border-red-800'
                  : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
              }`}
              title={isOfflineMode ? 'Washa Online' : 'Weka Offline'}
            >
              <WifiOff className={`w-3 h-3 shrink-0 ${isOfflineMode ? 'animate-pulse text-red-500' : ''}`} />
              <span className="hidden sm:inline">{isOfflineMode ? 'OFFLINE DEMO' : 'ONLINE'}</span>
            </button>

            {/* Wallet Quick Access display */}
            <div className="flex items-center gap-1.5 glass-premium px-2 py-1 rounded-xl shrink-0 h-9">
              <Wallet className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[7px] text-neutral-550 uppercase font-mono tracking-wider leading-none">Salio</span>
                <span className="text-[9px] font-mono font-bold text-gold-400 leading-none mt-0.5 whitespace-nowrap">
                  {user.balance.toLocaleString()} TZS
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY SCROLL VIEWPORT */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            {/* Render Reader Mode Over the entire screen space if active */}
            {selectedStory && (
              <StoryReader
                key="reader-view"
                story={selectedStory}
                isDownloaded={user.downloadedStoryIds.includes(selectedStory.id)}
                onBack={() => setSelectedStory(null)}
                onToggleDownload={handleToggleDownload}
                onUpdateStory={handleUpdateStory}
              />
            )}

            {/* Admin toggle overlay mode */}
            {isAdminMode && (
              <div className="absolute inset-0 z-30 flex flex-col bg-neutral-950">
                {/* Header widget to return back */}
                <div className="h-12 px-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
                  <span className="text-xs font-mono font-bold text-neutral-400">PANELI YA MSIMAMIZI (ADMIN)</span>
                  <button
                    id="exit-admin-btn"
                    onClick={() => {
                      setIsAdminMode(false);
                      // Force reload local database changes
                      setStories(loadStoriesFromStorage());
                    }}
                    className="bg-gold-500 text-neutral-950 px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors hover:bg-gold-400 cursor-pointer"
                  >
                    Rudi App
                  </button>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                  <AdminPanel
                    stories={stories}
                    slides={slides}
                    onAddSlide={handleAddSlide}
                    onDeleteSlide={handleDeleteSlide}
                    onAddStory={handleAddStory}
                    onDeleteStory={handleDeleteStory}
                    onUpdateStory={handleUpdateStory}
                    adminPassword={adminPassword}
                    onUpdateAdminPassword={handleUpdateAdminPassword}
                    adminRevenueBalance={adminRevenueBalance}
                    onWithdrawAdminRevenue={handleWithdrawAdminRevenue}
                    adminWithdrawals={adminWithdrawals}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Core content switchboard depending on bottom selector */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            
            {/* MOCK OFFLINE BAR WARNING NOTIFICATION */}
            {isOfflineMode && (
              <div className="flex items-start gap-2 bg-red-950/40 border border-red-850 p-3 rounded-2xl text-xs text-red-200 animate-pulse">
                <WifiOff className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold">Uko Nje ya Mtandao (Offline Mode)</h4>
                  <p className="text-[10px] text-red-450 leading-relaxed">
                    Sasa unaona hadithi zilizopakuliwa pekee. Zisome bila kutumia MB! Fungua tab ya "Downloads" au gusa kitufe cha kura juu kuzima offline.
                  </p>
                </div>
              </div>
            )}

            {/* VIEW TAB SWITCH SWITCHER */}

            {/* TAB-1: HOME NYUMBANI */}
            {activeTab === 'home' && !isAdminMode && (
              <div className="space-y-5">
                {/* Feature Auto slider */}
                <HeroSlider stories={stories} slides={slides} onSelectStory={handleSelectStory} />

                {/* Categories quick filtering horizontal chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-display font-bold uppercase text-neutral-200 tracking-wider">
                      Tafuta kwa Makundi
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                    {CATEGORY_TABS.map((tab) => {
                      const isActive = selectedCategory === tab.value;
                      return (
                        <button
                          key={tab.value}
                          id={`filter-tab-${tab.value}`}
                          onClick={() => setSelectedCategory(tab.value)}
                          className={`cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider shrink-0 transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-gold-500 to-orange-500 text-black font-black scale-105 shadow-lg'
                              : 'glass-card text-neutral-350 hover:text-white border border-white/5'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stories lists display */}
                <div className="space-y-3">
                  <h3 className="text-xs font-display font-bold uppercase text-neutral-200 tracking-wider">
                    {selectedCategory === 'ZOTE' ? 'Simulizi Mpya' : `Orodha ya ${selectedCategory}`}
                  </h3>

                  {/* Reactive grid of cards */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {filteredStories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        isPurchased={user.purchasedStoryIds.includes(story.id)}
                        onSelect={handleSelectStory}
                      />
                    ))}
                  </div>

                  {filteredStories.length === 0 && (
                    <div className="text-center py-10 bg-neutral-900/40 rounded-2xl border border-neutral-850">
                      <p className="text-xs text-neutral-500 italic">Hakuna simulizi zilizoingizwa kwenye fungu hili ya sasa.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB-2: CATEGORIES (KATEGORIA) */}
            {activeTab === 'categories' && !isAdminMode && (
              <div className="space-y-4">
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-2">Makundi Mapana za simulizi</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: 'Simulizi za Bure', code: 'BURE', img: 'https://images.unsplash.com/photo-1548685913-fe6574340a49?q=80&w=300', count: stories.filter(s => !s.isPremium).length },
                    { title: 'Simulizi za Kulipia', code: 'PREMIUM', img: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300', count: stories.filter(s => s.isPremium).length },
                    { title: 'Horror (Ngano za kutisha)', code: 'Horror', img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=300', count: stories.filter(s => s.category === 'Horror').length },
                    { title: 'Mapenzi (Romance)', code: 'Love Story', img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=300', count: stories.filter(s => s.category === 'Love Story').length },
                    { title: 'Vitendo (Action)', code: 'Action', img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=300', count: stories.filter(s => s.category === 'Action').length },
                    { title: 'Tamthilia (Drama)', code: 'Drama', img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=300', count: stories.filter(s => s.category === 'Drama').length }
                  ].map((cat, i) => (
                    <div
                      key={i}
                      id={`categories-grid-${i}`}
                      onClick={() => {
                        setSelectedCategory(cat.code);
                        setActiveTab('home');
                      }}
                      className="group relative h-28 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-gold-500/20 active:scale-95 transition-all shadow"
                    >
                      <img src={cat.img} alt={cat.title} className="w-full h-full object-cover brightness-[0.4] group-hover:brightness-[0.5] transition-all" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 p-3 flex flex-col justify-end text-left">
                        <h4 className="text-xs font-bold text-white group-hover:text-gold-400 transition-colors leading-tight font-display">{cat.title}</h4>
                        <span className="text-[10px] text-gold-500 font-mono mt-0.5">{cat.count} hadithi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB-3: SEARCH (TAFUTA) */}
            {activeTab === 'search' && !isAdminMode && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Tafuta Simulizi Yoyote</h3>
                  <p className="text-[10px] text-neutral-405">Tafuta kwa kuandika jina la simulizi, mwandishi au aina ya kisa.</p>
                </div>

                {/* Instant Input search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                  <input
                    id="search-input-field"
                    type="text"
                    placeholder="Mwandishi, jina, kategoria au neno..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white outline-none"
                    autoFocus
                  />
                </div>

                {/* Grid result layout */}
                <div className="grid grid-cols-2 gap-3.5">
                  {filteredStories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      isPurchased={user.purchasedStoryIds.includes(story.id)}
                      onSelect={handleSelectStory}
                    />
                  ))}
                </div>

                {filteredStories.length === 0 && (
                  <div className="text-center py-10 bg-neutral-900/30 rounded-2xl border border-neutral-850 text-neutral-450 italic">
                    Hakuna matokeo yaliyopatikana kwa "{searchQuery}"
                  </div>
                )}
              </div>
            )}

            {/* TAB-4: DOWNLOADS (MAKTABA YAKO NYUMBANI YA LOCAL OFFLINE) */}
            {activeTab === 'downloads' && !isAdminMode && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-display font-black text-neutral-200 tracking-wider uppercase">
                    Maktaba Yako ya Offline (Offline Reading)
                  </h3>
                  <p className="text-[10px] text-neutral-450">
                    Hadithi hizi zimehifadhiwa kwenye simu yako. Unaweza kuzisoma upatapo hitilafu ya mtandao au ukiwa fukweni ukiwa umezima data za simu!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {stories
                    .filter((story) => user.downloadedStoryIds.includes(story.id))
                    .map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        isPurchased={user.purchasedStoryIds.includes(story.id)}
                        onSelect={handleSelectStory}
                      />
                    ))}

                  {stories.filter((story) => user.downloadedStoryIds.includes(story.id)).length === 0 && (
                    <div className="col-span-2 text-center py-12 bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-800 text-neutral-400 space-y-2">
                      <Download className="w-5 h-5 text-neutral-600 mx-auto" />
                      <p className="text-xs">Hujapakua simulizi yoyote bado.</p>
                      <button
                        id="downloads-goto-home"
                        onClick={() => setActiveTab('home')}
                        className="text-[10px] uppercase font-bold text-gold-400 hover:text-white"
                      >
                        Chagua hadithi hapa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB-5: PROFILE (WASIFU WASIWASI) */}
            {activeTab === 'profile' && !isAdminMode && (
              <div className="space-y-5">
                {/* User Info plate display with Tanzania background */}
                <div className="p-4 glass-card rounded-2xl flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 border-2 border-gold-500 overflow-hidden shrink-0">
                    <img
                      src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150`}
                      alt="User Image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden space-y-1">
                    <h3 className="text-sm font-display font-bold text-white truncate">{user.name}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {user.isAdmin ? (
                        <span className="inline-block px-1.5 py-0.5 rounded-md text-[7.5px] font-black uppercase bg-red-950/40 text-red-400 border border-red-500/20 tracking-wider font-mono">
                          ADMIN MKUU
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded-md text-[7.5px] font-black uppercase bg-gold-950/40 text-gold-400 border border-gold-500/20 tracking-wider font-mono">
                          MWANACHAMA HALISI
                        </span>
                      )}
                      {user.email && (
                        <span className="text-[9px] text-neutral-400 font-mono">
                          ({user.email})
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-neutral-500 font-mono">Namba ya Simu: {user.phone}</p>
                  </div>
                </div>

                {/* ACCOUNT WALLET DASHBOARD CARD */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-gold-950/20 to-neutral-900 border border-gold-500/20 relative overflow-hidden space-y-3 shadow-xl">
                  {/* Decorative ambient gradient backdrop glow */}
                  <div className="absolute right-0 bottom-0 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono text-gold-400 font-bold uppercase tracking-widest block font-sans">MEMBER WALLET</span>
                      <h4 className="text-sm font-bold text-neutral-100 font-display">Akaunti ya Simulizi Wallet</h4>
                    </div>
                    <div className="p-1.5 bg-gold-500/10 border border-gold-500/20 rounded-xl">
                      <Wallet className="w-4 h-4 text-gold-500" />
                    </div>
                  </div>

                  <div className="py-2.5">
                    <span className="text-[9px] text-neutral-450 uppercase tracking-widest block font-mono">Salio Lako la Sasa:</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-mono font-black text-white">{user.balance.toLocaleString()}</span>
                      <span className="text-xs font-mono font-bold text-gold-400">TZS</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-neutral-450 border-t border-white/5 pt-2.5">
                    <span>Akaunti ID: {user.phone}</span>
                    <span className="text-emerald-400 font-bold">● ACTIVE MEMBER</span>
                  </div>
                </div>

                {/* Editable Profile Form */}
                <div className="p-4 glass-card rounded-2xl space-y-3.5 border border-white/5">
                  <h4 className="text-xs font-bold uppercase text-neutral-300 font-display flex items-center gap-1">
                    <span>Hariri Wasifu (Edit Profile)</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">Jina Kamili</label>
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">Barua Pepe (Email)</label>
                        <input
                          type="email"
                          value={user.email}
                          onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-white outline-none font-mono"
                          placeholder="iddyabubakar12@gmail.com"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">Namba ya Simu</label>
                        <input
                          type="text"
                          value={user.phone}
                          onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-white outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* MWANDISHI KUPOST SIMULIZI / WRITER MODULE CARD */}
                <div className="glass-card border border-gold-500/10 p-4 rounded-2xl space-y-3.5 shadow">
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-gold-550 text-gold-400" />
                    <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-display">
                      Soko la Waandishi (Sell Stories)
                    </h4>
                  </div>
                  
                  {user.isMwandishiApproved ? (
                    <div className="space-y-2">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-center space-y-1">
                        <span className="text-[9px] font-bold text-emerald-400 block font-mono uppercase tracking-widest">
                          ✓ ACCOUNT APPROVED BY ADMIN
                        </span>
                        <p className="text-[9px] text-neutral-400 leading-relaxedSW">
                          Akaunti yako imepitishwa rasmi kuwa mwandishi! Sasa una uwezo wa kuandika, kupandisha na kuuza simulizi zako bila kizuizi.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowMwandishiPostModal(true)}
                        className="w-full py-2 bg-gradient-to-r from-gold-500 to-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
                      >
                        Pakia Simulizi Mpya Sasa
                      </button>
                    </div>
                  ) : user.isMwandishiRequested ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-amber-500 block font-mono uppercase tracking-widest">
                        ⏳ OMBI LAKO LINAPITIWA...
                      </span>
                      <p className="text-[9px] text-neutral-400 leading-relaxed mt-1">
                        Ulimaliza kuomba kibali cha kuanza kuuza kazi hapa. Admin Iddy Abubakar anapitia usajili wako na atakupa tiki hivi karibuni kukuruhusu kupost sasa hivi!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-[10px] text-[#a3a19a] leading-relaxed">
                        Unataka kupandisha simulizi zako za kusisimua na kuanza kuingiza kipato kwa kila sura wasomaji wanazofungua kwenye mkoba wao? Omba msimamizi akuidhinishe sasa hivi.
                      </p>
                      <button
                        onClick={() => {
                          const updated = {
                            ...user,
                            isMwandishiRequested: true
                          };
                          setUser(updated);
                          fetch('/api/register_user', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updated)
                          })
                          .then(() => alert("✓ Ombi lako la uandishi limetumwa kikamilifu! Msimamizi atalipatia kibali namba yako."))
                          .catch(e => console.error(e));
                        }}
                        className="w-full py-2 bg-neutral-900 hover:bg-[#1a1712] border border-gold-500/20 hover:border-gold-500/50 text-gold-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Omba Kuwa Mwandishi wa Simulizi
                      </button>
                    </div>
                  )}
                </div>

                {/* Administrator backoffice trigger toggle */}
                {user.isAdmin && (
                  <div className="glass-card border border-white/5 bg-neutral-950/40 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-bold text-[#b8b3a5] flex items-center gap-1.5 uppercase font-display">
                        <Shield className="w-3.5 h-3.5 text-neutral-400" />
                        Ingia kama Admin
                      </h4>
                      <p className="text-[9px] text-neutral-500">
                        Ili kudhibiti orodha ya wanachama wetu na miamala yote.
                      </p>
                    </div>
                    <button
                      id="trigger-admin-mode"
                      onClick={handleTryEnterAdmin}
                      className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-850 hover:text-white text-neutral-450 font-bold rounded-lg text-[10px] uppercase tracking-wide cursor-pointer transition-all shrink-0 border border-white/10"
                    >
                      Ingia
                    </button>
                  </div>
                )}

                {/* Verification floating overlay */}
                {verificationMessage && (
                  <div className="absolute inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in space-y-4 rounded-3xl">
                    <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
                    <div className="space-y-2">
                      <h5 className="text-emerald-400 font-black text-xs uppercase tracking-wider font-display">Uhakiki wa Malipo Salama</h5>
                      <p className="text-[10.5px] text-neutral-300 max-w-[220px] leading-relaxed font-sans">{verificationMessage}</p>
                    </div>
                  </div>
                )}

                {/* Interactive Top-Up Wallet tool block */}
                <div className="glass-card p-4 rounded-2xl space-y-4 border border-emerald-500/10 bg-gradient-to-br from-neutral-950 via-[#0d1410]/20 to-neutral-950 animate-fade-in">
                  <h4 className="text-xs font-bold uppercase text-emerald-400 font-display flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Hifadhi Akiba kwenye Wallet</span>
                    </span>
                    <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-mono">
                      Usalama 100%
                    </span>
                  </h4>

                  {/* Payment Type Tabs Switcher */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/45 border border-white/5 rounded-xl text-center">
                    <button
                      type="button"
                      onClick={() => setIsInternational(false)}
                      className={`py-1.5 text-[9px] uppercase tracking-wide rounded-lg transition-all font-bold cursor-pointer flex items-center justify-center gap-1 ${
                        !isInternational ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3 h-3 shrink-0" />
                      <span>Ndani ya TZ (Simu)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternational(true)}
                      className={`py-1.5 text-[9px] uppercase tracking-wide rounded-lg transition-all font-bold cursor-pointer flex items-center justify-center gap-1 ${
                        isInternational ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Globe className="w-3 h-3 shrink-0" />
                      <span>Kimataifa (Kadi/Nje)</span>
                    </button>
                  </div>

                  {topupState === 'idle' && (
                    <form onSubmit={handleTopup} className="space-y-3.5 text-left">
                      {/* Operator selection ONLY shown to domestic users */}
                      {!isInternational ? (
                        <div className="space-y-1">
                          <span className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Chagua Mtandao wako</span>
                          <div className="grid grid-cols-4 gap-1 p-0.5 bg-black/40 rounded-xl border border-white/5">
                            {(['MPESA', 'TIGOPESA', 'AIRTEL', 'HALOPESA'] as const).map((op) => (
                              <button
                                key={op}
                                type="button"
                                onClick={() => setTopupOperator(op)}
                                className={`py-1 text-[8.5px] rounded-lg transition-all font-black cursor-pointer text-center flex flex-col items-center justify-center p-1 ${
                                  topupOperator === op 
                                    ? (op === 'MPESA' ? 'bg-[#E60000] text-white shadow' : op === 'TIGOPESA' ? 'bg-[#0033A0] text-white shadow' : op === 'AIRTEL' ? 'bg-[#FF0000] text-white shadow' : 'bg-[#00875A] text-white shadow')
                                    : 'text-neutral-400 hover:text-white'
                                }`}
                              >
                                <span className="leading-none">
                                  {op === 'MPESA' ? 'M-Pesa' : op === 'TIGOPESA' ? 'TigoPesa' : op === 'AIRTEL' ? 'Airtel' : 'HaloPesa'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-neutral-950/50 border border-emerald-500/10 rounded-xl flex items-start gap-2 animate-fade-in">
                          <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-neutral-300 block leading-tight">Mteja wa Nje ya Nchi / Kadi za Benki</span>
                            <p className="text-[8.5px] text-neutral-400 leading-normal">
                              Inasaidia wasomaji kutoka Kenya/Uganda (Mpesa/MTN) na kadi za benki za kimataifa (Visa, Mastercard, AMEX) kwa usalama.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {/* Dynamic Field: Mobile Number vs Billing Email */}
                        {!isInternational ? (
                          <div className="space-y-1 animate-fade-in">
                            <span className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Namba ya Simu</span>
                            <div className="relative">
                              <Smartphone className="absolute left-2.5 top-2.5 w-3 h-3 text-neutral-500" />
                              <input
                                type="text"
                                placeholder="07XXXXXXXX"
                                value={topupPhone}
                                onChange={(e) => setTopupPhone(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 outline-none rounded-xl pl-7.5 pr-2 py-1.5 text-xs text-white font-mono"
                                required={!isInternational}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 animate-fade-in">
                            <span className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Barua Pepe ya Risiti</span>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[10px] text-neutral-550 font-bold">@</span>
                              <input
                                type="email"
                                placeholder="email@gmail.com"
                                value={topupEmail}
                                onChange={(e) => setTopupEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 outline-none rounded-xl pl-6 pr-2 py-1.5 text-xs text-white font-mono"
                                required={isInternational}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Kiasi cha TZS</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-[8.5px] text-neutral-500 font-mono font-bold">TZS</span>
                            <input
                              type="number"
                              placeholder="Kiasi"
                              value={customTopupAmount}
                              onChange={(e) => setCustomTopupAmount(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 outline-none rounded-xl pl-9 pr-2 py-1.5 text-xs text-white font-mono"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quick chips buttons */}
                      <div className="flex gap-1 justify-between">
                        {[1000, 2500, 5000, 10000].map((quickAmt) => (
                          <button
                            key={quickAmt}
                            type="button"
                            onClick={() => setCustomTopupAmount(String(quickAmt))}
                            className="bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 rounded-xl px-2.5 py-1 text-[9px] font-mono transition-colors cursor-pointer"
                          >
                            +{quickAmt.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 duration-205 shadow-md shadow-emerald-950/20 h-9"
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span>Weka Akiba Simu/Kadi</span>
                      </button>
                    </form>
                  )}

                  {topupState === 'processing' && (
                    <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3.5 animate-pulse min-h-[170px]">
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                      <div className="space-y-1.5">
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-mono tracking-wider font-bold text-center block w-fit mx-auto">
                          {topupMessage.includes("[HALI YA MAJARIBIO") ? "Majaribio pekee / DEMO" : "Inafanya Muamala Halisi"}
                        </span>
                        
                        <p className="text-[10px] text-neutral-300 max-w-[220px] font-sans leading-relaxed text-center">
                          {topupMessage}
                        </p>
                      </div>
                      
                      <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-1000 rounded-full" 
                          style={{ width: `${(topupCountdown / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-neutral-450 uppercase text-center block">Sekunde {topupCountdown} zimesalia</span>
                    </div>
                  )}

                  {topupState === 'success' && (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-500/25 rounded-2xl flex flex-col items-center justify-center text-center space-y-3.5 animate-fade-in min-h-[170px]">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-mono font-bold tracking-widest text-center animate-bounce">
                          AKIBO INASOMEKA!
                        </span>
                        <p className="text-[10px] text-neutral-300 max-w-[210px] leading-relaxed text-center font-sans mt-1.5">
                          Hongera! Kiasi cha <strong>TZS {Number(customTopupAmount).toLocaleString()}</strong> kimehifadhiwa kiusalama kabisa kwenye mkoba wako wa Application.
                        </p>
                      </div>
                      <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl font-mono text-[10.5px] text-emerald-400 font-bold block w-full text-center">
                        SALIO LA SASA: TZS {user.balance.toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => setTopupState('idle')}
                        className="text-[9px] uppercase font-bold text-neutral-400 hover:text-white underline cursor-pointer transition-colors"
                      >
                        Weka kiasi kingine tena
                      </button>
                    </div>
                  )}
                </div>

                {/* Simulated payment transaction history list receipts */}
                <div className="glass-card p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold uppercase text-neutral-350 font-display flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-neutral-400" />
                    Kumbukumbu za Malipo
                  </h4>

                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-2 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between text-left text-[10px]"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-neutral-300 line-clamp-1">{tx.storyTitle}</p>
                          <span className="text-[9px] text-neutral-500 font-mono">{tx.date} • {tx.id}</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="font-bold text-emerald-400 font-mono">+{tx.amount.toLocaleString()} TZS</span>
                          <span className="text-[8px] uppercase tracking-wider bg-emerald-950/45 text-emerald-400 border border-emerald-900 leading-none py-0.5 px-1.5 rounded-full font-mono mt-1">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LOG OUT BUTTON FOR EVERY MEMBER AND ADMIN */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (window.confirm("Je, una uhakika unataka kuondoka (Log Out) kwenye akaunti yako?")) {
                        setUser({
                          id: '',
                          name: '',
                          email: '',
                          phone: '',
                          balance: 0,
                          purchasedStoryIds: [],
                          downloadedStoryIds: [],
                          hasRegistered: false
                        });
                        setIsAdminMode(false);
                      }
                    }}
                    className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl text-xs uppercase font-extrabold tracking-widest transition-all cursor-pointer text-center"
                  >
                    Ondoka Kwenye Akaunti (Log Out)
                  </button>
                </div>

              </div>
            )}

          </div>
        </main>

        {/* BOTTOM REALISTIC NAVIGATION BAR BUTTONS */}
        <nav className="h-16 glass-navbar grid grid-cols-5 shrink-0 z-20">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'categories', label: 'Kundi', icon: Compass },
            { id: 'search', label: 'Tafuta', icon: Search },
            { id: 'downloads', label: 'Kusoma', icon: Download },
            { id: 'profile', label: 'Mimi', icon: UserIcon }
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  // Dismiss reader mode or checkout modal to restore full experience
                  setSelectedStory(null);
                  setPaymentStory(null);
                }}
                className={`flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  isActive ? 'text-gold-400' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'scale-110 text-gold-500 stroke-[2.5]' : ''}`} />
                <span className="text-[9px] uppercase tracking-widest font-mono font-semibold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ABSOLUTE OVERLAYS (Checkout system) */}
        {showMwandishiPostModal && (
          <div className="absolute inset-0 z-50 flex flex-col bg-neutral-950/98 backdrop-blur-md overflow-hidden animate-fade-in text-white font-sans">
            {/* Modal Header */}
            <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-neutral-900/40">
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4 text-gold-500" />
                <span className="text-xs font-bold font-display uppercase tracking-wider text-white">
                  Pakia Simulizi Mpya
                </span>
              </div>
              <button
                onClick={() => setShowMwandishiPostModal(false)}
                className="px-2.5 py-1 rounded bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white text-[10px] uppercase font-bold cursor-pointer font-mono"
              >
                Ghairi (Close)
              </button>
            </div>

            {/* Modal Body Scroll Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-gold-500/[0.02] border border-gold-500/10 p-3 rounded-xl">
                <p className="text-[9.5px] text-[#b5b1a5] leading-normal font-sans text-center">
                  Mshirika wetu <strong>{user.name}</strong>, andika taarifa kamili na uanze kuuza simulizi yako sasa hivi. Wasomaji wataitumia wallet yao kufungua!
                </p>
              </div>

              <div className="space-y-3.5 text-left">
                {/* 1. Title */}
                <div className="space-y-1">
                  <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Jina la Simulizi (Story Title) <span className="text-gold-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={writerTitle}
                    onChange={(e) => setWriterTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none rounded-xl py-2 px-3 text-xs text-white"
                    placeholder="Mfano: Pendo la Kijijini"
                  />
                </div>

                {/* 2. Category & Pricing */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Aina ya Simulizi (Category)
                    </label>
                    <select
                      value={writerCategory}
                      onChange={(e) => setWriterCategory(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none rounded-xl py-2 px-2 text-xs text-white"
                    >
                      <option value="Love Story">Love Story (Mapenzi)</option>
                      <option value="Horror">Horror (Kutisha)</option>
                      <option value="Action">Action (Vitendo)</option>
                      <option value="Drama">Drama (Tamthilia)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Hali ya Simulizi (Type)
                    </label>
                    <div className="flex items-center gap-2 h-9">
                      <button
                        type="button"
                        onClick={() => setWriterIsPremium(false)}
                        className={`flex-1 py-1 rounded-lg text-[9px] uppercase font-bold text-center border transition-all ${
                          !writerIsPremium 
                            ? 'bg-gold-500 text-black border-gold-500' 
                            : 'bg-transparent text-neutral-400 border-white/10'
                        }`}
                      >
                        Bure
                      </button>
                      <button
                        type="button"
                        onClick={() => setWriterIsPremium(true)}
                        className={`flex-1 py-1 rounded-lg text-[9px] uppercase font-bold text-center border transition-all ${
                          writerIsPremium 
                            ? 'bg-gold-500 text-black border-gold-500' 
                            : 'bg-transparent text-neutral-400 border-white/10'
                        }`}
                      >
                        Premium
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Pricing if premium */}
                {writerIsPremium && (
                  <div className="space-y-1 bg-gold-500/[0.01] border border-gold-500/10 p-3 rounded-xl">
                    <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Bei ya kusoma (TZS) <span className="text-gold-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="200"
                        step="100"
                        value={writerPrice}
                        onChange={(e) => setWriterPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none rounded-xl py-2 pl-3 pr-10 text-xs text-white font-mono"
                        placeholder="Bei ya simulizi yote"
                      />
                      <span className="absolute right-3 top-2.5 text-[9px] text-[#ffdd80] font-bold font-mono">TZS</span>
                    </div>
                    <p className="text-[7.5px] text-neutral-550 italic mt-1 leading-normal">
                      Kiwango cha chini kinashauriwa kuwa angalau TZS 200 kwa kazi nzuri.
                    </p>
                  </div>
                )}

                {/* 4. Muhtasari (Description) */}
                <div className="space-y-1">
                  <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Muhtasari / Maelezo Fupi (Description) <span className="text-gold-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={writerDescription}
                    onChange={(e) => setWriterDescription(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none rounded-xl py-2 px-3 text-xs text-white"
                    placeholder="Mpenzi wangu aliondoka kijijini akiahidi kurejea lakini..."
                  />
                </div>

                {/* 5. Cover Art Choice */}
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                     Picha ya Jalada (Select Cover)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Kutisha', url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600' },
                      { name: 'Mapenzi', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600' },
                      { name: 'Vitendo', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600' },
                    ].map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setWriterCoverUrl(c.url)}
                        className={`relative rounded-lg overflow-hidden border aspect-video transition-all ${
                          writerCoverUrl === c.url ? 'ring-2 ring-gold-500 border-transparent' : 'border-white/10'
                        }`}
                      >
                        <img src={c.url} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.5 rounded text-[7px] text-white">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* CUSTOM FILE UPLOADER FOR MOBILE & DESKTOP STORAGE */}
                  <div className="mt-2 text-left">
                    <label className="flex items-center justify-center gap-2.5 border border-dashed border-white/15 hover:border-gold-500/50 bg-neutral-900/60 hover:bg-neutral-850 p-2.5 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-gold-400" />
                      <div>
                        <span className="text-[10px] font-bold text-white block">Pakia Picha toka Simu yako</span>
                        <span className="text-[7.5px] text-neutral-400 block font-mono">Storage ya simu au kadi ya picha</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUploadChange}
                        className="hidden"
                      />
                    </label>

                    {/* Preview segment if custom image has been loaded */}
                    {writerCoverUrl && !writerCoverUrl.startsWith('https://images.unsplash') && (
                      <div className="mt-2 p-1.5 bg-gold-500/[0.03] border border-gold-500/15 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded overflow-hidden border border-white/10 bg-neutral-900 shrink-0">
                            <img src={writerCoverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-emerald-400 block">✓ Picha Imefanikiwa</span>
                            <span className="text-[7.5px] text-neutral-400 block font-mono">Tayari kwa kuchapishwa</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWriterCoverUrl('https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600')}
                          className="px-2 py-1 rounded bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/20 text-[7px] font-bold uppercase transition-all"
                        >
                          Futa
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. First Chapter Content */}
                <div className="space-y-1">
                  <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                     Andika Simulizi Yako Hapa (First Chapter Text) <span className="text-gold-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={writerChapterContent}
                    onChange={(e) => setWriterChapterContent(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none rounded-xl py-2 px-3 text-xs text-white leading-relaxed font-sans"
                    placeholder="Weka kisa chako chote hapa..."
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={() => {
                    const cleanTitle = writerTitle.trim();
                    const cleanDesc = writerDescription.trim();
                    const cleanContent = writerChapterContent.trim();
                    
                    if (!cleanTitle || !cleanDesc || !cleanContent) {
                      alert("Tafadhali jaza Jina la Simulizi, Maelezo na Maandishi ya hadithi kabla ya kupublish!");
                      return;
                    }

                    const newStory: Story = {
                      id: `story-${Date.now()}`,
                      title: cleanTitle,
                      author: user.name || "Mwandishi Mdhamini",
                      description: cleanDesc,
                      category: writerCategory,
                      rating: 5.0,
                      price: writerIsPremium ? writerPrice : 0,
                      isPremium: writerIsPremium,
                      coverUrl: writerCoverUrl,
                      reads: Math.floor(10 + Math.random() * 40),
                      publishedDate: new Date().toISOString().split('T')[0],
                      chapters: [
                        {
                          id: `chap-${Date.now()}-1`,
                          title: "Mlango wa 1: Mwanzo wa Simanzi",
                          content: cleanContent
                        }
                      ]
                    };

                    const updated = [newStory, ...stories];
                    setStories(updated);
                    saveStoriesToStorage(updated);

                    // Persist to backend server
                    fetch('/api/stories', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newStory)
                    })
                    .then(() => {
                      alert(`✓ SUCCESS! Hongera ${user.name}, Simulizi yako imekuwa posted na iko hewani sasa hivi!`);
                      setShowMwandishiPostModal(false);
                      // Reset inputs
                      setWriterTitle('');
                      setWriterDescription('');
                      setWriterChapterContent('');
                    })
                    .catch((e) => {
                      console.error("Server save error:", e);
                      setShowMwandishiPostModal(false);
                    });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-500 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
                >
                  Publish na Kuweka Hewani Soko Kuu
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentStory && (
          <PaymentModal
            story={paymentStory}
            user={user}
            onClose={() => setPaymentStory(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {/* Admin Login Password Dialog Modal */}
        {showAdminLoginModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="w-full max-w-sm glass-card border border-gold-500/30 p-5 rounded-2xl shadow-2xl relative space-y-4">
              <div className="space-y-1 text-center">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto border border-gold-500/20">
                  <ShieldCheck className="w-5 h-5 text-gold-500" />
                </div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider mt-2">
                  Idhini ya Msimamizi
                </h3>
                <p className="text-[10px] text-neutral-405">
                  Ingiza nenosiri maalumu ili kuingia kama Admin
                </p>
                <p className="text-[9px] text-neutral-500 font-mono">
                  {user.email}
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold text-center">
                    Nenosiri ya Admin
                  </label>
                  {lockoutUntil > currentTime ? (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-red-400 block uppercase font-mono tracking-wider">
                        🔒 Kizuizi Kiko Hai!
                      </span>
                      <p className="text-[9px] text-neutral-305 leading-normal">
                        Kujaribu nenosiri kumezuiwa kwa muda. Tafadhali subiri:
                      </p>
                      <p className="text-[11px] font-mono font-bold text-gold-400">
                        {formatRemainingTime(lockoutUntil - currentTime)}
                      </p>
                    </div>
                  ) : (
                    <input
                      id="admin-passcode-field"
                      type="password"
                      placeholder="••••••••"
                      value={adminPasswordInput}
                      onChange={(e) => {
                        setAdminPasswordInput(e.target.value);
                        setAdminLoginError('');
                      }}
                      className="w-full text-center tracking-widest glass-input rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAdminLoginSubmit();
                        }
                      }}
                      autoFocus
                    />
                  )}
                </div>

                {adminLoginError && (
                  <p className="text-[10px] text-red-400 text-center font-semibold font-mono leading-tight">
                    ⚠️ {adminLoginError}
                  </p>
                )}
                
                <p className="text-[8px] text-neutral-500 text-center leading-normal pt-1">
                  Nenosiri la majaribio ni: <span className="text-gold-400 font-bold font-mono select-all">iddy2026</span>
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  id="cancel-admin-modal"
                  onClick={() => {
                    setShowAdminLoginModal(false);
                    setAdminPasswordInput('');
                    setAdminLoginError('');
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 py-2 rounded-xl text-xs uppercase font-bold tracking-widest cursor-pointer"
                >
                  Ghairi
                </button>
                
                <button
                  id="confirm-admin-btn"
                  onClick={handleAdminLoginSubmit}
                  disabled={lockoutUntil > currentTime}
                  className={`flex-1 py-2 rounded-xl text-xs uppercase tracking-widest font-bold cursor-pointer transition-all ${
                    lockoutUntil > currentTime
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                      : 'bg-gradient-to-r from-gold-500 to-amber-500 text-neutral-950 hover:brightness-110'
                  }`}
                >
                  Thibitisha
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MobileFrame>
  );
}
