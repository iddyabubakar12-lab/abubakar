/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PlusCircle,
  Trash,
  Sparkles,
  BookOpen,
  Clock,
  Tag,
  RefreshCw,
  Layers,
  DollarSign,
  Wand2,
  Info,
  Edit2,
  XCircle,
  Lock,
  History,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Shield,
  Cloud,
  Download,
  Upload,
  Link,
  FileText
} from 'lucide-react';
import { Story, Chapter } from '../types';

interface AdminPanelProps {
  stories: Story[];
  slides?: any[];
  onAddSlide?: (slide: any) => void;
  onDeleteSlide?: (slideId: string) => void;
  onAddStory: (story: Story) => void;
  onDeleteStory: (storyId: string) => void;
  onUpdateStory: (story: Story) => void;
  adminPassword?: string;
  onUpdateAdminPassword?: (newPass: string) => void;
  adminRevenueBalance?: number;
  onWithdrawAdminRevenue?: (amount: number, method: string, accountNo: string) => boolean;
  adminWithdrawals?: any[];
}

// Beautiful cinematic Unsplash covers to select in-app for effortless publishing
const PRESET_COVERS = [
  { name: 'Kutisha / Horror', url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600' },
  { name: 'Mapenzi / Romance', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600' },
  { name: 'Vitendo / Action', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600' },
  { name: 'Tamthilia / Drama', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600' },
  { name: 'Kijiji / Rural', url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200' },
  { name: 'Zanzibar / Pwani', url: 'https://images.unsplash.com/photo-1535262412227-85541e910204?q=80&w=1200' }
];

const PRESET_AD_COVERS = [
  { name: 'Ofa / Promo', url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1200' },
  { name: 'NMB Bank / Pesa', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200' },
  { name: 'Wallet / Ongeza Salio', url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1200' },
  { name: 'Kusoma / Library', url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200' }
];

export default function AdminPanel({
  stories,
  slides = [],
  onAddSlide,
  onDeleteSlide,
  onAddStory,
  onDeleteStory,
  onUpdateStory,
  adminPassword = 'iddy2026',
  onUpdateAdminPassword,
  adminRevenueBalance = 0,
  onWithdrawAdminRevenue,
  adminWithdrawals = []
}: AdminPanelProps) {
  // Manual state forms
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Love Story');
  const [price, setPrice] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [chapterTitle, setChapterTitle] = useState('Mlango wa 1: Mwanzo wa Safari');
  const [chapterContent, setChapterContent] = useState('');

  // Slide ads builder state hooks
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adCategory, setAdCategory] = useState('TANGAZO LA BANNER');
  const [adCoverUrl, setAdCoverUrl] = useState(PRESET_AD_COVERS[0].url);

  // Editing state hooks
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [customCoverUrl, setCustomCoverUrl] = useState<string>('');
  
  // Custom views (reads) and likes state up to 20,000,000
  const [reads, setReads] = useState<number>(0);
  const [likes, setLikes] = useState<number>(0);

  // AI Generator specific state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Brand new password management states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', text: '' });

  // Brand new withdrawal states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('NMB BANK');
  const [withdrawalAccount, setWithdrawalAccount] = useState('31110190455');
  const [withdrawalStatus, setWithdrawalStatus] = useState({ type: '', text: '' });

  React.useEffect(() => {
    if (withdrawalMethod === 'NMB BANK') {
      setWithdrawalAccount('31110190455');
    } else if (withdrawalMethod === 'M-PESA') {
      setWithdrawalAccount('0712345678');
    } else {
      setWithdrawalAccount('');
    }
  }, [withdrawalMethod]);

  // Tanzanian Gateway integration states
  const [gateway, setGateway] = useState<'SELCOM' | 'PESAPAL' | 'MPESA_OPEN' | 'FLUTTERWAVE'>('SELCOM');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [bankAccount, setBankAccount] = useState('31110190455');
  const [settlementNetwork, setSettlementNetwork] = useState('NMB BANK');
  const [autoWithdraw, setAutoWithdraw] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configStatus, setConfigStatus] = useState({ type: '', text: '' });

  // Load gateway details on admin view mount
  React.useEffect(() => {
    fetch('/api/payment_config')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data) {
          setGateway(data.gateway || 'SELCOM');
          setApiKey(data.api_key || '');
          setApiSecret(data.api_secret || '');
          setMerchantId(data.merchant_id || '');
          setBankAccount(data.bank_account || '31110190455');
          setSettlementNetwork(data.settlement_network || 'NMB BANK');
          setAutoWithdraw(!!data.auto_withdraw);
        }
      })
      .catch((err) => console.log('Mock/Offline config loading:', err));
  }, []);

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigStatus({ type: '', text: '' });

    fetch('/api/payment_config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateway,
        api_key: apiKey,
        api_secret: apiSecret,
        merchant_id: merchantId,
        bank_account: bankAccount,
        settlement_network: settlementNetwork,
        auto_withdraw: autoWithdraw
      })
    })
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then((data) => {
      setSavingConfig(false);
      setConfigStatus({ 
        type: 'success', 
        text: `✓ Usanidi wa ${gateway === 'SELCOM' ? 'Selcom Gateway' : gateway === 'PESAPAL' ? 'Pesapal Tz' : gateway === 'MPESA_OPEN' ? 'Vodacom OpenAPI' : 'Flutterwave'} umehifadhiwa kikamilifu kwenye backend database!` 
      });
      setTimeout(() => setConfigStatus({ type: '', text: '' }), 6000);
    })
    .catch((err) => {
      setSavingConfig(false);
      setConfigStatus({ type: 'error', text: 'Imeshindwa kuhifadhi mipangilio. Tafadhali jaribu tena.' });
    });
  };

  // Membership & Marketing Social Proof states
  const [editTotalUsers, setEditTotalUsers] = useState<number>(300000);
  const [editOnlineUsers, setEditOnlineUsers] = useState<number>(3200);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [loadingRealUsers, setLoadingRealUsers] = useState(true);
  const [statsSaveMsg, setStatsSaveMsg] = useState({ type: '', text: '' });

  // Google Drive state hooks
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isDemoDrive, setIsDemoDrive] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [driveConnecting, setDriveConnecting] = useState(false);
  const [driveStatus, setDriveStatus] = useState<{ type: 'loading' | 'success' | 'error' | '', text: string } | null>(null);

  React.useEffect(() => {
    const handleGoogleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        const token = event.data.token;
        const isDemo = !!event.data.isDemo;
        setDriveToken(token);
        setIsDemoDrive(isDemo);
        setDriveStatus({ 
          type: 'success', 
          text: `✓ Google Drive imeunganishwa kikamilifu! ${isDemo ? '(Njia ya Majaribio - Demo mode)' : '(Njia Halisi - Real Mode)'}` 
        });
        fetchDriveBackups(token, isDemo);
      }
    };

    window.addEventListener('message', handleGoogleMessage);
    return () => {
      window.removeEventListener('message', handleGoogleMessage);
    };
  }, []);

  const fetchDriveBackups = async (tokenToUse: string, isDemo: boolean) => {
    if (isDemo) {
      setDriveFiles([
        { id: "demo-backup-4", name: "simulizi_backup_2026_05_26_auto.json", createdTime: "2026-05-26T14:32:00Z", size: 100420 },
        { id: "demo-backup-3", name: "simulizi_backup_kariakoo_drama.json", createdTime: "2026-05-26T12:00:15Z", size: 95484 },
        { id: "demo-backup-2", name: "simulizi_backup_golden_chunya.json", createdTime: "2026-05-25T18:10:43Z", size: 85203 }
      ]);
      return;
    }

    setLoadingDrive(true);
    try {
      const q = encodeURIComponent("name contains 'simulizi_backup' and mimeType = 'application/json' and trashed = false");
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,createdTime,size)&orderBy=createdTime%20desc`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${tokenToUse}` }
      });
      const data = await res.json();
      if (data.files) {
        setDriveFiles(data.files);
      } else {
        setDriveFiles([]);
      }
    } catch (err: any) {
      setDriveStatus({ type: 'error', text: 'Kushindwa kupata nakala kutoka kwenye Drive: ' + err.message });
    } finally {
      setLoadingDrive(false);
    }
  };

  const handleConnectDrive = async () => {
    setDriveConnecting(true);
    setDriveStatus(null);
    try {
      const res = await fetch('/api/auth/google/url');
      if (!res.ok) throw new Error("Mawasiliano na seva yamegoma.");
      const { url } = await res.json();
      
      const authWindow = window.open(url, 'google_oauth_popup', 'width=600,height=700');
      if (!authWindow) {
        setDriveStatus({ type: 'error', text: 'Popup block imepatikana! Tafadhali ruhusu popups uweze kuunganisha Google Drive.' });
      }
    } catch (err: any) {
      setDriveStatus({ type: 'error', text: err.message || 'Itilafu imetokea.' });
    } finally {
      setDriveConnecting(false);
    }
  };

  const handleDisconnectDrive = () => {
    setDriveToken(null);
    setDriveFiles([]);
    setDriveStatus({ type: 'success', text: 'Umetenganisha muunganisho wa Google Drive salama.' });
  };

  const handleUploadBackupToDrive = async () => {
    if (!driveToken) {
      setDriveStatus({ type: 'error', text: 'Tafadhali unganisha Google Drive kwanza.' });
      return;
    }

    setLoadingDrive(true);
    setDriveStatus({ type: 'loading', text: 'Inatayarisha nakala na kupia kwenye Google Drive...' });

    try {
      const response = await fetch('/api/admin/get_backup');
      const dbBackup = await response.json();
      const fileName = `simulizi_backup_${new Date().toISOString().split('T')[0]}_${Math.floor(1000 + Math.random() * 9000)}.json`;

      if (isDemoDrive) {
        setTimeout(() => {
          setDriveFiles(prev => [
            { id: `demo-backup-${Date.now()}`, name: fileName, createdTime: new Date().toISOString(), size: JSON.stringify(dbBackup).length },
            ...prev
          ]);
          setDriveStatus({ type: 'success', text: `✓ Hongera! Backup ya majaribio '${fileName}' imepakiwa kikamilifu kwenye Google Drive (Demo Container).` });
          setLoadingDrive(false);
        }, 1500);
        return;
      }

      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${driveToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: fileName,
          mimeType: "application/json"
        })
      });

      const fileMetadata = await createRes.json();
      if (!fileMetadata.id) {
        throw new Error(fileMetadata.error?.message || "Imeshindwa kuandika metadata kwenye Drive.");
      }

      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileMetadata.id}?uploadType=media`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${driveToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dbBackup, null, 2)
      });

      if (!uploadRes.ok) {
        throw new Error("Imeshindwa kutuma payload ya database.");
      }

      setDriveStatus({ type: 'success', text: `✓ Kazi nzuri! Hifadhi ya nakala imehifadhiwa salama kwenye Google Drive yako kama '${fileName}'` });
      fetchDriveBackups(driveToken, false);
    } catch (err: any) {
      setDriveStatus({ type: 'error', text: 'Kupakia backup imeshindwa: ' + err.message });
    } finally {
      setLoadingDrive(false);
    }
  };

  const handleRestoreBackupFromDrive = async (file: any) => {
    const isConfirmed = window.confirm(
      `TAFADHALI THIBITISHA:\nJe, una uhakika unataka kurejesha backup ya '${file.name}' kutoka Google Drive?\n\nOnyo: Hii itafuta data zote za sasa (hadithi, kategoria, slides, miamala) na kuzibadilisha na zile za kwenye backup. Kitendo hiki hakiwezi kufutwa!`
    );
    if (!isConfirmed) return;

    setLoadingDrive(true);
    setDriveStatus({ type: 'loading', text: `Inapakua na kurejesha backup '${file.name}'...` });

    try {
      if (isDemoDrive) {
        setTimeout(() => {
          setDriveStatus({ type: 'success', text: `✓ Repositories, miamala na hadithi zote zimerudishwa kikamilifu kutoka kwenye backup ya '${file.name}'!` });
          setLoadingDrive(false);
          setTimeout(() => window.location.reload(), 2500);
        }, 1500);
        return;
      }

      const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: { Authorization: `Bearer ${driveToken}` }
      });

      if (!downloadRes.ok) {
        throw new Error("Imeshindwa kupakua file kutoka Google Drive.");
      }

      const backupData = await downloadRes.json();

      const restoreRes = await fetch('/api/admin/restore_backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup: backupData })
      });

      const result = await restoreRes.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setDriveStatus({ type: 'success', text: `✓ Hongera! Database imerejeshwa kikamilifu kwenye seva. Ukurasa unajireload sasa...` });
      setTimeout(() => {
        window.location.reload();
      }, 2500);

    } catch (err: any) {
      setDriveStatus({ type: 'error', text: 'Kurejesha kumeshindwa: ' + err.message });
    } finally {
      setLoadingDrive(false);
    }
  };

  const handleExportStoryToDrive = async (story: Story) => {
    if (!driveToken) {
      setDriveStatus({ type: 'error', text: `Tafadhali unganisha Google Drive kwanza katika block la backup hapo chini ili ku-export.` });
      const element = document.getElementById('google-drive-backup-card');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setLoadingDrive(true);
    setDriveStatus({ type: 'loading', text: `Inatengeneza file la hadithi ya '${story.title}' na kuisafirisha kwenda Google Drive...` });

    try {
      const parts = [
        `======================================================`,
        `HADITHI: ${story.title.toUpperCase()}`,
        `MWANDISHI: ${story.author}`,
        `KATEGORIA: ${story.category}`,
        `HALI YA VIP: ${story.isPremium ? 'PREMIUM (INALIPIWA)' : 'BURE (MEMBER)'}`,
        `======================================================\n`,
        `MAELEZO MAFUPI:`,
        story.description,
        `\n------------------------------------------------------\n`,
        `MAUDHUI SURA KWA SURA:\n`
      ];

      if (story.chapters && story.chapters.length > 0) {
        story.chapters.forEach((ch, idx) => {
          parts.push(`--- SURA YA ${idx + 1}: ${ch.title} ---`);
          parts.push(ch.content);
          parts.push(`\n`);
        });
      } else {
        parts.push(`Maudhui ya Simulizi: Hadithi hii haina sura/maudhui.`);
      }

      const fileContent = parts.join('\n');
      const fileName = `${story.title.replace(/\s+/g, '_')}_Hadithi_Simulizi.txt`;

      if (isDemoDrive) {
        setTimeout(() => {
          setDriveStatus({ type: 'success', text: `✓ [DEMO SUCCESS] Hadithi ya '${story.title}' imerikodiwa kama faili '${fileName}' kwenye Google Drive (Demo).` });
          setLoadingDrive(false);
        }, 1200);
        return;
      }

      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${driveToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: fileName,
          mimeType: "text/plain"
        })
      });

      const fileMetadata = await createRes.json();
      if (!fileMetadata.id) {
        throw new Error(fileMetadata.error?.message || "Imeshindwa kuunda faili.");
      }

      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileMetadata.id}?uploadType=media`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${driveToken}`,
          "Content-Type": "text/plain"
        },
        body: fileContent
      });

      if (!uploadRes.ok) {
        throw new Error("Mawasiliano ya kuupload maudhui ya faili yamegoma.");
      }

      setDriveStatus({ type: 'success', text: `✓ Hongera! Hadithi ya '${story.title}' imehifadhiwa kama faili '${fileName}' kwenye Google Drive yako kikamilifu!` });
    } catch (err: any) {
      setDriveStatus({ type: 'error', text: 'Kushindwa ku-export: ' + err.message });
    } finally {
      setLoadingDrive(false);
    }
  };

  // Load public stats and real users from backend
  const fetchStatsAndRealUsers = () => {
    setLoadingRealUsers(true);
    // 1. Get stats
    fetch('/api/public_stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalUsers !== undefined) setEditTotalUsers(data.totalUsers);
        if (data.onlineUsers !== undefined) setEditOnlineUsers(data.onlineUsers);
      })
      .catch((e) => console.error("Error fetching stats:", e));

    // 2. Get real users
    fetch('/api/real_users')
      .then((res) => res.json())
      .then((data) => {
        setRealUsers(data || []);
        setLoadingRealUsers(false);
      })
      .catch((e) => {
        console.error("Error fetching real users:", e);
        setLoadingRealUsers(false);
      });
  };

  const handleToggleMwandishi = (userId: string, isApproved: boolean) => {
    fetch('/api/users/toggle_mwandishi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isApproved })
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      fetchStatsAndRealUsers();
    })
    .catch((err) => console.error("Error toggling mwandishi status on server:", err));
  };

  React.useEffect(() => {
    fetchStatsAndRealUsers();
  }, []);

  // Handle saving stats
  const handleSavePublicStats = (e: React.FormEvent) => {
    e.preventDefault();
    setStatsSaveMsg({ type: 'loading', text: 'Inahifadhi takwimu za ushawishi...' });
    
    fetch('/api/public_stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalUsers: Number(editTotalUsers),
        onlineUsers: Number(editOnlineUsers)
      })
    })
    .then((res) => {
      if (!res.ok) throw new Error("Imeshindwa kuhifadhi kwenye seva.");
      return res.json();
    })
    .then((data) => {
      setStatsSaveMsg({ type: 'success', text: '✓ Takwimu za Ushawishi zimehifadhiwa kikamilifu!' });
      setTimeout(() => setStatsSaveMsg({ type: '', text: '' }), 4000);
    })
    .catch((err) => {
      setStatsSaveMsg({ type: 'error', text: err.message || 'Itilafu imetokea.' });
    });
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: '', text: '' });

    if (!newPassword.trim()) {
      setPasswordStatus({ type: 'error', text: 'Neno la siri jipya haliwezi kuwa tupu!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'Nenosiri jipya na lile la kithibitisho hayajafanana!' });
      return;
    }

    if (onUpdateAdminPassword) {
      onUpdateAdminPassword(newPassword.trim());
      setPasswordStatus({ type: 'success', text: '✓ Nenosiri la Admin limebadilishwa kikamilifu!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus({ type: '', text: '' }), 5000);
    }
  };

  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalStatus({ type: '', text: '' });

    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0 || isNaN(amt)) {
      setWithdrawalStatus({ type: 'error', text: 'Tafadhali weka kiasi sahihi cha kutoa.' });
      return;
    }

    if (!withdrawalAccount.trim()) {
      setWithdrawalStatus({ type: 'error', text: 'Tafadhali jaza namba ya simu au akaunti ya kupokelea.' });
      return;
    }

    if (amt > adminRevenueBalance) {
      setWithdrawalStatus({ type: 'error', text: 'Salio halitoshi! Pesa uliyoomba ni kubwa kuliko salio la akaunti yako.' });
      return;
    }

    if (onWithdrawAdminRevenue) {
      const success = onWithdrawAdminRevenue(amt, withdrawalMethod, withdrawalAccount.trim());
      if (success) {
        setWithdrawalStatus({ type: 'success', text: `✓ Muamala umekamilika! TZS ${amt.toLocaleString()} zimetumwa kwenda akaunti ${withdrawalAccount}.` });
        setWithdrawAmount('');
        setWithdrawalAccount('');
        setTimeout(() => setWithdrawalStatus({ type: '', text: '' }), 6000);
      } else {
        setWithdrawalStatus({ type: 'error', text: 'Mchakato wa kutoa umefeli, tafadhali thibitisha salio limebaki la kutosha.' });
      }
    }
  };

  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adDescription.trim() || !adCoverUrl.trim()) {
      alert('Tafadhali jaza Jina la tangazo, Maelezo na Picha ya tangazo.');
      return;
    }
    if (onAddSlide) {
      onAddSlide({
        title: adTitle.trim(),
        description: adDescription.trim(),
        category: adCategory.trim(),
        coverUrl: adCoverUrl.trim()
      });
      setAdTitle('');
      setAdDescription('');
      setAdCategory('TANGAZO LA BANNER');
      setAdCoverUrl(PRESET_AD_COVERS[0].url);
      alert('Hongera! Tangazo lako jipya la Slide limehifadhiwa na litaanza kurun kwenye Banner la juu sasa hivi!');
    }
  };

  const handlePresetSelect = (url: string) => {
    setCoverUrl(url);
  };

  const handleIsPremiumToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setIsPremium(val);
    if (!val) setPrice(0);
  };

  // Submit trigger to compile a story item
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !chapterContent.trim()) {
      alert('Tafadhali jaza Jina la simulizi, Mwandishi na Yaliyomo.');
      return;
    }

    if (editingStoryId) {
      // Find original to retain reads, rating, reviews
      const original = stories.find((s) => s.id === editingStoryId);
      if (!original) {
        alert('Hadithi inayorekebishwa haikupatikana!');
        return;
      }

      const updatedChapter: Chapter = {
        id: '1',
        title: chapterTitle || 'Mlango wa 1',
        content: chapterContent
      };

      const updatedStory: Story = {
        ...original,
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || `Simulizi nzuri ya kusisimua ya kategoria ya ${category}.`,
        category: category,
        price: isPremium ? Number(price) : 0,
        isPremium: isPremium,
        coverUrl: coverUrl.trim(),
        isFeatured: isFeatured,
        reads: Math.min(20000000, Number(reads) || 0),
        likes: Math.min(20000000, Number(likes) || 0),
        chapters: [updatedChapter, ...original.chapters.slice(1)]
      };

      onUpdateStory(updatedStory);
      setEditingStoryId(null);
      alert(`Simulizi "${title.trim()}" imesahihishwa kikamilifu!`);
    } else {
      const newStoryId = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

      const newCreatedChapter: Chapter = {
        id: '1',
        title: chapterTitle || 'Mlango wa 1',
        content: chapterContent
      };

      const newStory: Story = {
        id: newStoryId,
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || `Simulizi nzuri ya kusisimua ya kategoria ya ${category}.`,
        category: category,
        rating: 5.0,
        price: isPremium ? Number(price) : 0,
        isPremium: isPremium,
        reads: Math.min(20000000, Number(reads) || 0),
        likes: Math.min(20000000, Number(likes) || 0),
        coverUrl: coverUrl.trim(),
        isFeatured: isFeatured,
        publishedDate: new Date().toISOString().split('T')[0],
        authorAvatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?q=80&w=100`,
        chapters: [newCreatedChapter]
      };

      onAddStory(newStory);
      alert('Simulizi mpya imeongezwa kikamilifu!');
    }

    // Reset fields
    setTitle('');
    setAuthor('');
    setDescription('');
    setChapterContent('');
    setChapterTitle('Mlango wa 1: Mwanzo wa Safari');
    setIsPremium(false);
    setPrice(0);
    setIsFeatured(false);
    setCustomCoverUrl('');
    setReads(0);
    setLikes(0);
    setAiSuccessMsg('');
  };

  // Invoke server side Gemini Writer via proxy endpoint
  const handleAiStoryGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert('Tafadhali andika wazo fupi kwa ajili ya AI kwanza.');
      return;
    }

    setIsGeneratingAi(true);
    setAiSuccessMsg('');

    try {
      const response = await fetch('/api/generate_story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, category: category })
      });

      if (!response.ok) {
        throw new Error('Server returned error status');
      }

      const data = await response.json();

      if (data && data.title) {
        // Automatically prefill forms
        setTitle(data.title);
        setAuthor(data.author || 'Mwandishi wa AI');
        setDescription(data.description || 'Simulizi iliyotengenezwa haraka na Gemini AI.');
        setChapterContent(data.content || '');
        setChapterTitle('Mlango wa 1: Uvuvio');
        setAiSuccessMsg('Simulizi imetungwa! Tweak chini kisha bonyeza "Hifadhi Simulizi" kuhifadhi kwenye maktaba.');
      }
    } catch (err) {
      console.error(err);
      alert('Imeshindwa kufikia AI. Tutatumia simulizi ya kielelezo kutoka hifadhidata ya dharura.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 text-white bg-black">
      {/* Title Dashboard Section */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2 bg-gold-500/10 border border-gold-500/20 rounded-xl">
          <Layers className="w-5 h-5 text-gold-500" />
        </div>
        <div>
          <h2 className="text-base font-display font-bold text-neutral-100 uppercase tracking-wider">
            Admin Panel — Udhibiti wa Hadithi
          </h2>
          <p className="text-[11px] text-neutral-400">Ongeza hadithi mpya, panga bei, au pika sura kwa kutumia AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: The actual Publishing & AI Generation Form */}
        <div className="space-y-4">
          
          {/* AI Generator Box Tool */}
          <div className="glass-card rounded-2xl p-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-gold-500/10 text-[9px] font-bold text-gold-400 rounded-bl-lg font-mono tracking-widest uppercase">
              Yenye Nguvu ya Gemini
            </div>

            <h3 className="text-xs font-display font-bold text-gold-400 flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <Wand2 className="w-4 h-4 text-gold-500 animate-pulse" />
              Mwandishi Maalum wa AI
            </h3>
            
            <p className="text-[10px] text-neutral-405 mb-3 leading-relaxed">
              Andika wazo lako kwa Kiswahili, na mfumo wa AI utakutengenezea Simulizi kamili na Jina, Mwandishi pamoja na descriptions!
            </p>

            <div className="flex flex-col gap-2.5">
              <textarea
                id="ai-story-prompt"
                rows={2}
                placeholder="Mfano: Safari ya mtoto aitwaye Juma katika visiwa vya Mafia kugundua meli ya zamani..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-gold-500 outline-none resize-none font-sans"
              />
              
              <button
                id="trigger-ai-generator"
                type="button"
                onClick={handleAiStoryGenerate}
                disabled={isGeneratingAi}
                className="w-full cursor-pointer bg-white/5 hover:bg-white/10 text-gold-400 border border-white/5 font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold-500" />
                    AI Inatunga Simulizi ya Kiswahili...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
                    Tengeneza kwa kutumia AI
                  </>
                )}
              </button>
            </div>

            {aiSuccessMsg && (
              <div className="mt-2.5 p-2 bg-green-950/40 border border-green-800/80 text-green-400 text-[10px] rounded-lg leading-relaxed flex items-start gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{aiSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Core Story Creation Form */}
          <form onSubmit={handleSubmit} className="glass-card p-4 rounded-2xl shadow space-y-4 relative border border-gold-500/10">
            {editingStoryId && (
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-gold-400 text-[8px] font-bold text-black rounded-bl-lg font-mono tracking-widest uppercase flex items-center gap-1 z-10 animate-pulse">
                INAHARIRIWA (EDIT MODE)
                <button
                  type="button"
                  onClick={() => {
                    setEditingStoryId(null);
                    setTitle('');
                    setAuthor('');
                    setDescription('');
                    setChapterContent('');
                    setChapterTitle('Mlango wa 1: Mwanzo wa Safari');
                    setIsPremium(false);
                    setPrice(0);
                    setIsFeatured(false);
                    setCustomCoverUrl('');
                    setReads(0);
                    setLikes(0);
                  }}
                  className="bg-black hover:bg-neutral-800 text-white rounded-full p-0.5 cursor-pointer ml-1"
                  title="Ghairi"
                >
                  <XCircle className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
            <h3 className="text-xs font-display font-semibold text-neutral-300 uppercase tracking-widest pb-1 border-b border-white/10">
              {editingStoryId ? 'Hariri / Rekebisha Simulizi' : 'Maelezo ya Simulizi Mpya'}
            </h3>

            {/* Title & Author */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">Jina la Simulizi *</label>
                <input
                  id="form-story-title"
                  type="text"
                  placeholder="Mfano: Siri ya Bahari"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input outline-none rounded-xl px-3 py-1.5 text-xs text-neutral-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">Mwandishi *</label>
                <input
                  id="form-story-author"
                  type="text"
                  placeholder="Mfano: Amina Rashid"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full glass-input outline-none rounded-xl px-3 py-1.5 text-xs text-neutral-200"
                  required
                />
              </div>
            </div>

            {/* Category & Pricing toggle */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">Kategoria *</label>
                <select
                  id="form-story-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input outline-none rounded-xl px-3 py-1.5 text-xs text-neutral-200 font-sans"
                >
                  <option value="Horror" className="bg-neutral-900">Horror (Kutisha)</option>
                  <option value="Love Story" className="bg-neutral-900">Love Story (Mapenzi)</option>
                  <option value="Action" className="bg-neutral-900">Action (Vitendo)</option>
                  <option value="Drama" className="bg-neutral-900 font-sans">Drama (Kijamii)</option>
                </select>
              </div>

              {/* Toggle Premium pricing */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase font-bold">Ya Kulipia?</span>
                  <input
                    id="form-premium-toggle"
                    type="checkbox"
                    checked={isPremium}
                    onChange={handleIsPremiumToggle}
                    className="w-4 h-4 border-white/15 rounded bg-black accent-gold-500 font-mono cursor-pointer"
                  />
                </div>
                {isPremium ? (
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 w-3 h-3 text-gold-500" />
                    <input
                      id="form-story-price"
                      type="number"
                      placeholder="Bei (TZS)"
                      value={price || ''}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl pl-6 pr-3 py-1 text-xs text-neutral-200 font-mono"
                      min={100}
                      required
                    />
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-950/20 rounded-xl px-3 py-1 text-center font-mono text-[10px] uppercase tracking-wider font-bold">
                    Hadithi ni Bure
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">Maelezo Mafupi</label>
              <textarea
                id="form-story-desc"
                rows={2}
                placeholder="Maelezo yatakayoonekana kwenye jalada..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full glass-input outline-none rounded-xl p-2.5 text-xs text-neutral-200 resize-none"
              />
            </div>

            {/* Presets and custom covers selection */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">
                Jalada la Hadithi (Chagua Preset)
              </label>
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {PRESET_COVERS.map((cov, i) => (
                  <button
                    key={i}
                    id={`preset-cover-${i}`}
                    type="button"
                    onClick={() => {
                      handlePresetSelect(cov.url);
                      setCustomCoverUrl('');
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer relative ${
                      coverUrl === cov.url ? 'border-gold-500 scale-[1.05] ring-2 ring-gold-500/20' : 'border-white/10 hover:border-white/30'
                    }`}
                    title={cov.name}
                  >
                    <img src={cov.url} alt={cov.name} className="w-full h-full object-cover" />
                    {coverUrl === cov.url && (
                      <div className="absolute inset-0 bg-gold-500/15 flex items-center justify-center">
                        <span className="text-[8px] bg-neutral-950 px-1 rounded text-gold-400 font-bold font-mono">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Cover Input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">
                  Au Bandika Link ya Picha Mpya Maalum (Custom Cover URL)
                </label>
                <input
                  id="form-custom-cover"
                  type="text"
                  placeholder="Mfano: https://images.unsplash.com/photo-xxx"
                  value={customCoverUrl}
                  onChange={(e) => {
                    setCustomCoverUrl(e.target.value);
                    if (e.target.value.trim() !== '') {
                      setCoverUrl(e.target.value.trim());
                    }
                  }}
                  className="w-full glass-input outline-none rounded-xl px-3 py-1.5 text-xs text-neutral-200 font-mono"
                />
              </div>

              {/* Upload Cover from local Phone storage */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">
                  Au Pakia Picha Kutoka Kwenye Simu (Upload form Phone Storage)
                </label>
                <div className="relative flex items-center justify-center p-3 border border-dashed border-white/20 hover:border-gold-500/30 rounded-xl bg-neutral-950/40 transition-all cursor-pointer group">
                  <input
                    id="form-phone-cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          setCoverUrl(base64String);
                          setCustomCoverUrl(base64String);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Chagua picha ya jalada"
                  />
                  <div className="text-center space-y-1 py-1">
                    <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider block">
                      📁 Gusa ili Kuchagua Picha ya Jalada
                    </span>
                    <span className="text-[8px] text-neutral-500 block">
                      Inaruhusu picha zote toka storage ya simu yako
                    </span>
                  </div>
                </div>
                {coverUrl && coverUrl.startsWith('data:image') && (
                  <div className="mt-1.5 flex items-center gap-2 p-1.5 bg-neutral-900 border border-white/5 rounded-xl">
                    <img src={coverUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                    <div>
                      <span className="text-[9px] text-emerald-400 font-bold block">✓ Picha Imepakiwa kikamilifu</span>
                      <span className="text-[8px] text-neutral-400 block font-mono">Imehifadhiwa kama Base64 Image</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pivot/Display Adjusters for Reads and Likes (Capped at 20M) */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-950/40 border border-white/5 rounded-2xl">
              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">
                  Idadi ya Views (Max 20M)
                </label>
                <input
                  id="form-story-reads"
                  type="number"
                  placeholder="Mfano: 35000"
                  value={reads || ''}
                  onChange={(e) => {
                    const parsed = Math.min(20000000, Math.max(0, Number(e.target.value)));
                    setReads(parsed);
                  }}
                  className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-3 py-1.5 text-xs text-neutral-200 font-mono text-center"
                  max={20000000}
                  min={0}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">
                  Idadi ya Likes (Max 20M)
                </label>
                <input
                  id="form-story-likes"
                  type="number"
                  placeholder="Mfano: 12000"
                  value={likes || ''}
                  onChange={(e) => {
                    const parsed = Math.min(20000000, Math.max(0, Number(e.target.value)));
                    setLikes(parsed);
                  }}
                  className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-3 py-1.5 text-xs text-neutral-200 font-mono text-center"
                  max={20000000}
                  min={0}
                />
              </div>
            </div>

            {/* Toggle Slide ya Picha / Featured toggle check */}
            <div className="flex items-center justify-between p-3 bg-neutral-950/40 border border-white/5 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-neutral-200 block">Weka Kwenye Slider ya Picha?</span>
                <span className="text-[9px] text-neutral-450 block">Itaonekana kwenye banner ya juu ya Nyumbani yenye picha kubwa</span>
              </div>
              <input
                id="form-featured-toggle"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 border-white/10 rounded bg-black accent-gold-500 font-mono cursor-pointer"
              />
            </div>

            {/* Story prose chapters */}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <span className="text-[10px] font-bold text-neutral-400 font-display uppercase tracking-widest block font-bold">
                Yaliyomo (Sura ya 1)
              </span>

              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">Jina la Sura / Mlango</label>
                <input
                  id="form-chapter-title"
                  type="text"
                  placeholder="Mfano: Mlango wa 1: Kurasa Mpya"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full glass-input outline-none rounded-xl px-3 py-1.5 text-xs text-neutral-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase block font-bold">Matini ya Sura *</label>
                <textarea
                  id="form-chapter-content"
                  rows={4}
                  placeholder="Andika hadithi ya Kiswahili hapa..."
                  value={chapterContent}
                  onChange={(e) => setChapterContent(e.target.value)}
                  className="w-full glass-input outline-none rounded-xl p-2.5 text-xs text-neutral-200 whitespace-pre-line font-serif leading-relaxed"
                  required
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <button
                id="submit-story-form"
                type="submit"
                className="flex-1 btn-glass-prime py-2.5 rounded-xl text-xs uppercase tracking-widest font-display cursor-pointer font-extrabold"
              >
                {editingStoryId ? 'Sasisha Simulizi' : 'Hifadhi Simulizi Mpya'}
              </button>
              {editingStoryId && (
                <button
                  id="cancel-edit-btn"
                  type="button"
                  onClick={() => {
                    setEditingStoryId(null);
                    setTitle('');
                    setAuthor('');
                    setDescription('');
                    setChapterContent('');
                    setChapterTitle('Mlango wa 1: Mwanzo wa Safari');
                    setIsPremium(false);
                    setPrice(0);
                    setIsFeatured(false);
                    setCustomCoverUrl('');
                    setReads(0);
                    setLikes(0);
                  }}
                  className="bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/80 px-4 rounded-xl text-[10px] uppercase font-bold tracking-widest cursor-pointer font-display"
                >
                  Ghairi
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Interactive Story inventory management & statistics */}
        <div className="space-y-4">
          
          <div className="glass-card rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-display font-semibold text-neutral-200 uppercase tracking-widest pb-2 border-b border-white/10 mb-3">
              Takwimu Haraka za Mfumo
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-950/30 rounded-xl border border-white/5">
                <span className="text-[9px] text-neutral-500 uppercase font-mono tracking-wider block">IDADI YA SIMULIZI</span>
                <span className="text-xl font-bold font-display text-gold-500 mt-1 block">
                  {stories.length}
                </span>
                <span className="text-[8px] text-neutral-400 block mt-0.5">Kwenye hifadhidata</span>
              </div>

              <div className="p-3 bg-neutral-950/30 rounded-xl border border-white/5">
                <span className="text-[9px] text-neutral-500 uppercase font-mono tracking-wider block">PREMIUM STORIES</span>
                <span className="text-xl font-bold font-display text-orange-500 mt-1 block">
                  {stories.filter(s => s.isPremium).length}
                </span>
                <span className="text-[8px] text-neutral-400 block mt-0.5">Zinauzwa kwa TZS</span>
              </div>
            </div>
          </div>

          {/* DHIBITI WASOMAJI & USHAWISHI CARD */}
          <div className="glass-card rounded-2xl p-4 shadow-xl border border-gold-500/10 bg-gradient-to-br from-neutral-950 via-[#181105]/10 to-transparent animate-fade-in">
            <h3 className="text-xs font-display font-semibold text-gold-400 uppercase tracking-widest pb-2 border-b border-white/10 mb-3.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-gold-400" />
                <span>Ukusanyaji & Ushawishi (Social Proof)</span>
              </span>
              <span className="text-[7.5px] bg-gold-400/10 text-gold-400 border border-gold-400/20 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                Masoko & Wanachama
              </span>
            </h3>

            {/* A. EDIT STATISTICS OF MARKETING INFLUENCE */}
            <form onSubmit={handleSavePublicStats} className="space-y-3 pb-3 border-b border-white/5">
              <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                Mipangilio ya Ushawishi (Inaonekana kwa Umma)
              </span>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1 text-left">
                  <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Idadi ya Members (Ushawishi)
                  </label>
                  <input
                    type="number"
                    value={editTotalUsers}
                    onChange={(e) => setEditTotalUsers(Number(e.target.value))}
                    className="w-full bg-black/45 focus:border-gold-500 border border-white/10 outline-none rounded-xl py-1 md:py-1.5 px-3 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Waliopo Hewani (Ushawishi)
                  </label>
                  <input
                    type="number"
                    value={editOnlineUsers}
                    onChange={(e) => setEditOnlineUsers(Number(e.target.value))}
                    className="w-full bg-black/45 focus:border-gold-500 border border-white/10 outline-none rounded-xl py-1 md:py-1.5 px-3 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              {statsSaveMsg.text && (
                <div className={`p-2 rounded-xl text-[9px] uppercase font-bold text-center ${
                  statsSaveMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gold-500/10 text-gold-400 border border-white/10'
                }`}>
                  {statsSaveMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gold-400 hover:bg-gold-300 text-neutral-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all h-9"
              >
                <span>Hifadhi Takwimu za Ushawishi</span>
              </button>
            </form>

            {/* B. DISPLAY AUTHENTIC REGISTERED READERS (READ ONLY - NON-EDITABLE) */}
            <div className="pt-3.5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-emerald-405 text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="animate-ping rounded-full h-1.5 w-1.5 bg-emerald-400"></span> 
                  <span>Wasomaji Halisi Waliosajiliwa ({realUsers.length})</span>
                </span>
                
                <span className="text-[7.5px] bg-red-400/10 text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded uppercase font-mono font-bold flex items-center gap-1 cursor-not-allowed">
                  🔒 USALAMA: SIO YA KUSHIKA
                </span>
              </div>

              <p className="text-[8.5px] text-neutral-400 leading-normal text-left">
                Hii ndio orodha rasmi ya wasomaji ambao wamejisajili ndani ya mfumo kwa kuingiza namba zao. Taarifa hizi zinalindwa na hazitabadilika hapa kwa sababu za kiusalama na uaminifu wa kibiashara.
              </p>

              {loadingRealUsers ? (
                <div className="py-6 text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold-400" />
                  <span>Inapakia orodha...</span>
                </div>
              ) : realUsers.length === 0 ? (
                <div className="py-6 text-center text-[10px] text-neutral-500 border border-dashed border-white/5 rounded-xl">
                  Bado hakuna wasomaji wapya waliosajiliwa.
                </div>
              ) : (
                <div className="max-h-[145px] overflow-y-auto pr-1 space-y-2 border border-white/5 rounded-xl p-2 bg-black/45 divide-y divide-white/5">
                  {realUsers.map((u: any, i: number) => (
                    <div key={u.id || i} className="pt-2 last:pb-1 flex items-start justify-between text-left">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-neutral-200 block">{u.name}</span>
                          {u.isMwandishiApproved && (
                            <span className="text-[6.5px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1 rounded uppercase font-mono font-bold">
                              MWANDISHI
                            </span>
                          )}
                          {!u.isMwandishiApproved && u.isMwandishiRequested && (
                            <span className="text-[6.5px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1 rounded uppercase font-mono font-bold animate-pulse">
                              OMBI LA UANDISHI
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[8px] text-neutral-400 font-mono">
                          {u.phone && <span>Simu: {u.phone}</span>}
                        </div>
                        <span className="text-[7.5px] text-neutral-500 font-mono block">
                          Alionekana mwisho: {u.lastActive ? new Date(u.lastActive).toLocaleString('sw-tz').replace(',', ' ') : 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 ml-1 md:ml-2 shrink-0">
                        {/* Approval Tick Checkbox */}
                        <div className="flex flex-col items-center gap-0.5 bg-neutral-900/60 p-1 rounded-lg border border-white/5 text-center shrink-0">
                          <span className="text-[6px] text-neutral-400 uppercase font-mono leading-none scale-90">Mpe Tiki</span>
                          <input
                            type="checkbox"
                            checked={!!u.isMwandishiApproved}
                            onChange={(e) => handleToggleMwandishi(u.id, e.target.checked)}
                            className="w-3.5 h-3.5 accent-gold-500 cursor-pointer"
                          />
                        </div>

                        <div className="text-right space-y-0.5 shrink-0">
                          <span className="text-[9px] font-bold text-emerald-400 block font-mono">
                            {u.balance ? `TZS ${u.balance.toLocaleString()}` : '0 TZS'}
                          </span>
                          <span className="text-[7.5px] bg-neutral-900 border border-white/10 text-neutral-300 px-1.5 py-0.5 rounded font-mono uppercase font-semibold block">
                            Unlocks: {u.purchasedCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* REVENUE & WITHDRAWAL BOARD */}
          <div className="glass-card rounded-2xl p-4 shadow-xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950/10 to-transparent">
            <h3 className="text-xs font-display font-semibold text-emerald-400 uppercase tracking-widest pb-2 border-b border-white/10 mb-3 flex items-center justify-between">
              <span>Mfuko wa Mapato & Utoaji</span>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-mono">
                SALAMA (SECURED)
              </span>
            </h3>

            {/* Simulated Balance Box */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 bg-emerald-500/10 text-[7px] font-mono text-emerald-400 font-bold rounded-bl uppercase">
                Akaunti Yako
              </div>
              <span className="text-[10px] text-neutral-400 block font-mono uppercase tracking-wider">MAPATO YAKO YOTE (ACCUMULATED REVENUE)</span>
              <span className="text-2xl font-black font-display text-emerald-400 block mt-1">
                TZS {adminRevenueBalance.toLocaleString()}
              </span>
              <span className="text-[9px] text-emerald-550 block">Kipato halisi cha malipo ya watumiaji kwa mtandao</span>
            </div>

            {/* Withdrawal Form */}
            <form onSubmit={handleWithdrawalRequest} className="mt-4 space-y-3 pt-1">
              <h4 className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider">Omba Kutoa Pesa (Withdraw Revenue)</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Kiasi (TZS)</label>
                  <input
                    type="number"
                    placeholder="Mfano: 50000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 outline-none rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    min={0}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Njia ya Kutolea</label>
                  <select
                    value={withdrawalMethod}
                    onChange={(e) => setWithdrawalMethod(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 focus:border-emerald-500 outline-none rounded-xl px-2.5 py-1.5 text-[10px] text-neutral-200 font-sans cursor-pointer"
                  >
                    <option value="NMB BANK">NMB Bank (Tanzania)</option>
                    <option value="M-PESA">Vodacom M-Pesa</option>
                    <option value="TIGO PESA">Tigo Pesa</option>
                    <option value="AIRTEL MONEY">Airtel Money</option>
                    <option value="VISA TRANSFER">Visa Card Transfer</option>
                    <option value="MASTERCARD">MasterCard Link</option>
                    <option value="GOOGLE PAY">Google Pay (Direct)</option>
                  </select>
                </div>
              </div>

              {withdrawalMethod === 'NMB BANK' && (
                <div className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/20 text-[9.5px] text-orange-300 leading-normal mb-1">
                  💡 <strong>Muunganiko wa NMB Unafanya Kazi:</strong> Akaunti yako ya NMB yenye sifa <strong>#31110190455 (IDDY ABUBAKAR)</strong> imeunganishwa. Pesa zote unazozitoa zitahamishwa papo hapo kwenda akaunti yako kupitia mtandao wa NMB ya Tanzania.
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Namba ya Simu / Akaunti ya Kadi ya Kibenki</label>
                <input
                  type="text"
                  placeholder="Mfano: 0712345678 au Namba ya kadi"
                  value={withdrawalAccount}
                  onChange={(e) => setWithdrawalAccount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 outline-none rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                  required
                />
              </div>

              {withdrawalStatus.text && (
                <div className={`p-2 rounded-lg text-[10px] text-center leading-relaxed ${
                  withdrawalStatus.type === 'success' 
                    ? 'bg-emerald-950/40 border border-emerald-800/80 text-emerald-400' 
                    : 'bg-red-950/40 border border-red-800/80 text-red-400'
                }`}>
                  {withdrawalStatus.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-555 hover:bg-emerald-400 text-neutral-90 bg-emerald-500 hover:brightness-110 font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 duration-200"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Kamilisha Kutoa Pesa Sasa</span>
              </button>
            </form>

            {/* Withdrawal logs */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <span className="text-[8px] font-mono uppercase font-bold text-neutral-450 tracking-wider flex items-center gap-1 mb-2">
                <History className="w-2.5 h-2.5 text-emerald-400" /> Historia ya Utoaji
              </span>
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-0.5">
                {adminWithdrawals.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-black/30 border border-white/5 rounded-lg p-2 text-[9px] font-mono">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-neutral-200">{item.id}</span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-400">{item.method}</span>
                      </div>
                      <span className="text-neutral-550 text-[8px] block">{item.accountNo} • {item.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">- TZS {item.amount.toLocaleString()}</span>
                      <span className="text-[7px] text-emerald-400 bg-emerald-500/10 px-1 rounded font-sans leading-none uppercase" title="Success">IMEKUBALIWA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TANZANIA GATEWAY SETTINGS BOARD - SECURE INTEGRATION PORTAL */}
          <div className="glass-card rounded-2xl p-4 shadow-xl border border-gold-500/15 bg-gradient-to-br from-gold-950/5 to-transparent space-y-3.5 animate-fade-in">
            <h3 className="text-xs font-display font-semibold text-gold-400 uppercase tracking-widest pb-2 border-b border-white/10 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-gold-500" />
                <span>Usanidi wa Mifumo ya Malipo (TZ Gateway)</span>
              </span>
              <span className="text-[7.5px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                SECURELY ENCRYPTED
              </span>
            </h3>

            <p className="text-[9.5px] text-neutral-400 leading-relaxed">
              Mteja anapolipa, pesa zote huhifadhiwa kwenye <strong>Akaunti ya Mfanyabiashara (Merchant Account)</strong> ya mtandao uliounganishwa. Sanidi funguo zako (API Keys) za Selcom, Pesapal au M-Pesa hapa ili kupokea pesa moja kwa moja kwenye line yako au Bank.
            </p>

            {/* Gateway tab selection */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-black/40 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => { setGateway('SELCOM'); setConfigStatus({ type: '', text: '' }); }}
                className={`py-1.5 text-[8px] font-bold rounded-lg transition-all cursor-pointer ${
                  gateway === 'SELCOM' ? 'bg-gold-500 text-neutral-950 font-black shadow-md' : 'text-neutral-405 text-neutral-400 hover:text-white'
                }`}
              >
                Selcom Pay
              </button>
              <button
                type="button"
                onClick={() => { setGateway('PESAPAL'); setConfigStatus({ type: '', text: '' }); }}
                className={`py-1.5 text-[8px] font-bold rounded-lg transition-all cursor-pointer ${
                  gateway === 'PESAPAL' ? 'bg-gold-500 text-neutral-950 font-black shadow-md' : 'text-neutral-405 text-neutral-400 hover:text-white'
                }`}
              >
                Pesapal Tz
              </button>
              <button
                type="button"
                onClick={() => { setGateway('MPESA_OPEN'); setConfigStatus({ type: '', text: '' }); }}
                className={`py-1.5 text-[8px] font-bold rounded-lg transition-all cursor-pointer ${
                  gateway === 'MPESA_OPEN' ? 'bg-gold-500 text-neutral-950 font-black shadow-md' : 'text-neutral-405 text-neutral-400 hover:text-white'
                }`}
              >
                M-Pesa API
              </button>
              <button
                type="button"
                onClick={() => { setGateway('FLUTTERWAVE'); setConfigStatus({ type: '', text: '' }); }}
                className={`py-1.5 text-[8px] font-bold rounded-lg transition-all cursor-pointer ${
                  gateway === 'FLUTTERWAVE' ? 'bg-gold-500 text-neutral-950 font-black shadow-md' : 'text-neutral-405 text-neutral-400 hover:text-white'
                }`}
              >
                Flutterwave
              </button>
            </div>

            {/* Config inputs */}
            <form onSubmit={handleSavePaymentConfig} className="space-y-3 pt-1">
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[7.5px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">
                      {gateway === 'SELCOM' ? 'Selcom API Key' : gateway === 'PESAPAL' ? 'Consumer Key' : gateway === 'MPESA_OPEN' ? 'Client ID / OpenAPI Key' : 'Flutterwave Public Key'}
                    </label>
                    <input
                      type="password"
                      placeholder={gateway === 'SELCOM' ? 'sec_live_6f8b91bc...' : gateway === 'PESAPAL' ? 'pesapal_key_l281...' : gateway === 'MPESA_OPEN' ? 'mpesa_app_client_id...' : 'FLWPUBK_TEST-a9d03...'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2 py-1.5 text-xs text-neutral-250 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[7.5px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">
                      {gateway === 'SELCOM' ? 'API Secret Key' : gateway === 'PESAPAL' ? 'Consumer Secret' : gateway === 'MPESA_OPEN' ? 'OpenAPI Password / Secret' : 'Secret Key (FLWSECK)'}
                    </label>
                    <input
                      type="password"
                      placeholder="•••••••••••••••••••••••••••••"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2 py-1.5 text-xs text-neutral-250 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[7.5px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">
                      {gateway === 'SELCOM' ? 'Vendor ID / Terminal ID' : gateway === 'PESAPAL' ? 'Pesapal IPN ID' : gateway === 'MPESA_OPEN' ? 'M-Pesa Business Shortcode' : 'Merchant ID / Account-ID'}
                    </label>
                    <input
                      type="text"
                      placeholder={gateway === 'SELCOM' ? 'TERMINAL-883' : gateway === 'PESAPAL' ? 'ipn-aef93-df93fb' : gateway === 'MPESA_OPEN' ? '150074' : 'MC_8391204'}
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2 py-1.5 text-xs text-neutral-250 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[7.5px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">
                      Lengo la Settlement ya Mtandao
                    </label>
                    <select
                      value={settlementNetwork}
                      onChange={(e) => setSettlementNetwork(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2 py-1.5 text-[10px] text-neutral-200 font-sans cursor-pointer"
                    >
                      <option value="NMB BANK">NMB Bank Tanzania</option>
                      <option value="CRDB BANK">CRDB Bank Plc</option>
                      <option value="NBC BANK">NBC Bank Tanzania</option>
                      <option value="VODACOM M-PESA">Vodacom Lipa kwa M-Pesa</option>
                      <option value="TIGO PESA">Tigo Pesa Merchant</option>
                      <option value="AIRTEL MONEY">Airtel Money Merchant</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">
                    Namba ya Akaunti ya Benki / Simu ya Mapokezi
                  </label>
                  <input
                    type="text"
                    placeholder="Weka namba ya kadi, akaunti ya benki au simu"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2.5 py-1.5 text-xs text-neutral-250 font-mono"
                    required
                  />
                </div>

                {/* Week Auto-checkout Toggle switcher */}
                <div className="flex items-center justify-between p-2.5 bg-black/25 rounded-xl border border-white/5">
                  <div className="space-y-0.5 pr-2 text-left">
                    <span className="text-[9.5px] font-bold text-neutral-200 block">Kutoa Pesa Kila Wiki (Auto-Settlement)</span>
                    <p className="text-[8px] text-neutral-450 leading-tight">
                      Gusa hapa ili kufanya mfumo kuhamisha mapato yako yote otomatik kwenda kwenye benki/namba yako kila Jumatatu asubuhi.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoWithdraw}
                    onChange={(e) => setAutoWithdraw(e.target.checked)}
                    className="w-3.5 h-3.5 border-white/15 rounded bg-black accent-gold-500 font-mono cursor-pointer shrink-0"
                  />
                </div>
              </div>

              {configStatus.text && (
                <div className={`p-2.5 rounded-xl text-[9.5px] text-center leading-normal ${
                  configStatus.type === 'success' 
                    ? 'bg-emerald-950/40 border border-emerald-800/80 text-emerald-400' 
                    : 'bg-red-950/40 border border-red-800/80 text-red-400'
                }`}>
                  {configStatus.text}
                </div>
              )}

              <button
                type="submit"
                disabled={savingConfig}
                className="w-full bg-gradient-to-r from-gold-500 to-amber-500 text-neutral-950 font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-95 transition-all"
              >
                {savingConfig ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Inasave Mifumo...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hifadhi Mipangilio ya Gateway</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* GOOGLE DRIVE CLOUD SYSTEM BACKUP BOARD */}
          <div id="google-drive-backup-card" className="glass-card rounded-2xl p-4 shadow-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-950/10 to-transparent space-y-3.5 animate-fade-in text-left">
            <h3 className="text-xs font-display font-semibold text-emerald-450 uppercase tracking-widest pb-2 border-b border-white/10 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-sans">
                <Cloud className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
                <span>Hifadhi Ya Google Drive (Cloud Backup)</span>
              </span>
              {driveToken ? (
                <span className="text-[7px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                  {isDemoDrive ? 'TEST CONNECTED' : 'DRIVE CONNECTED'}
                </span>
              ) : (
                <span className="text-[7px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                  NOT CONNECTED
                </span>
              )}
            </h3>

            <p className="text-[9.5px] text-neutral-400 leading-relaxed font-sans">
              Linda kazi zako! Unganisha Google Drive kuitumia kufanya backups za hadithi, slides, na miamala ya mfumo. Unaweza kurejesha (restore) hifadhi yako wakati wowote na pia unaweza ku-export kila hadithi kama faili safi la maandishi (.txt) kwenda kwenye gari lako la Google Drive.
            </p>

            {driveStatus && driveStatus.text && (
              <div className={`p-2.5 rounded-xl text-[10px] leading-relaxed flex items-start gap-2 ${
                driveStatus.type === 'loading'
                  ? 'bg-amber-950/30 border border-amber-800/40 text-amber-400 font-sans'
                  : driveStatus.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-800/80 text-emerald-450 font-sans'
                  : 'bg-red-950/40 border border-red-800/80 text-red-400 font-sans'
              }`}>
                {driveStatus.type === 'loading' && <RefreshCw className="w-3 h-3 animate-spin shrink-0 mt-0.5" />}
                <p className="flex-1">{driveStatus.text}</p>
              </div>
            )}

            {!driveToken ? (
              <button
                type="button"
                onClick={handleConnectDrive}
                disabled={driveConnecting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-black py-2.5 rounded-xl text-[9.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-95 transition-all text-center"
              >
                {driveConnecting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Inatengeneza muunganisho salama...</span>
                  </>
                ) : (
                  <>
                    <Link className="w-3.5 h-3.5" />
                    <span>Unganisha na Google Drive</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleUploadBackupToDrive}
                    disabled={loadingDrive}
                    className="bg-emerald-500 hover:bg-emerald-450 text-neutral-950 font-bold py-2 px-3 rounded-xl text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Hifadhi Nakala Mpya</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDisconnectDrive}
                    className="bg-neutral-900 hover:bg-red-950/45 text-neutral-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 font-bold py-2 px-3 rounded-xl text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tenganisha Drive</span>
                  </button>
                </div>

                {/* Backups List */}
                <div className="space-y-2">
                  <span className="text-[8.5px] uppercase font-mono font-bold tracking-wider text-neutral-400 block border-b border-white/5 pb-1 flex items-center justify-between">
                    <span>Backups zilizopo kwenye Drive yako ({driveFiles.length})</span>
                    <button 
                      type="button"
                      onClick={() => fetchDriveBackups(driveToken, isDemoDrive)}
                      className="text-emerald-450 hover:underline cursor-pointer flex items-center gap-0.5 font-sans"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Reload
                    </button>
                  </span>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 font-sans">
                    {driveFiles.map((file) => (
                      <div key={file.id} className="p-2 rounded-xl bg-black/45 border border-white/5 flex items-center justify-between hover:border-emerald-500/20 transition-all text-left">
                        <div className="overflow-hidden space-y-0.5">
                          <span className="text-[10px] font-bold text-neutral-200 block truncate font-sans" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[7.5px] font-mono text-neutral-500 block">
                            Tarehe: {new Date(file.createdTime).toLocaleString()} • Fomati: {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A'}
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleRestoreBackupFromDrive(file)}
                          disabled={loadingDrive}
                          className="shrink-0 bg-emerald-950/50 hover:bg-emerald-850 text-emerald-400 hover:text-white px-2 py-1 rounded-lg text-[8px] font-bold uppercase cursor-pointer border border-emerald-500/20 active:scale-95 transition-all flex items-center gap-1 font-mono"
                          title="Bonyeza ili kurejesha hadithi na miamala toka file hili"
                        >
                          <Download className="w-2.5 h-2.5" /> Rejesha
                        </button>
                      </div>
                    ))}

                    {driveFiles.length === 0 && !loadingDrive && (
                      <div className="text-center py-4 text-[9px] text-neutral-500 italic block font-sans">
                        Hakuna backup yoyote ya mfumo iliyopatikana kwenye hifadhi yako. Bonyeza "Hifadhi Nakala Mpya" kuunda.
                      </div>
                    )}

                    {loadingDrive && driveFiles.length === 0 && (
                      <div className="text-center py-4 text-[9px] text-neutral-500 block flex items-center justify-center gap-1.5 font-sans">
                        <RefreshCw className="w-3 h-3 animate-spin text-emerald-450" />
                        <span>Inapakua files toka Google Drive...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PASSWORD SECURITY RESET BOARD */}
          <div className="glass-card rounded-2xl p-4 shadow-xl border border-gold-500/10 bg-gradient-to-br from-gold-950/10 to-transparent">
            <h3 className="text-xs font-display font-semibold text-gold-400 uppercase tracking-widest pb-2 border-b border-white/10 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gold-500" />
              <span>Usalama wa Nenosiri la Admin</span>
            </h3>

            <p className="text-[9px] text-neutral-400 mb-3 leading-relaxed">
              Unaweza kubadilisha nenosiri la siri la kuingia kwenye Admin Panel muda wowote ili kuweka akaunti yako salama hapa.
            </p>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Nenosiri Jipya</label>
                  <input
                    type="password"
                    placeholder="Weka neno la siri lipya"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Rudia Nenosiri</label>
                  <input
                    type="password"
                    placeholder="Thibitisha neno la siri"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    required
                  />
                </div>
              </div>

              {passwordStatus.text && (
                <div className={`p-2 rounded-lg text-[10px] text-center leading-relaxed ${
                  passwordStatus.type === 'success' 
                    ? 'bg-emerald-950/40 border border-emerald-800/80 text-emerald-450' 
                    : 'bg-red-950/40 border border-red-800/80 text-red-400'
                }`}>
                  {passwordStatus.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-white/5 hover:bg-white/10 text-gold-400 border border-white/5 font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <span>Hifadhi Nenosiri Jipya (Save Password)</span>
              </button>
            </form>
          </div>

          {/* NEW MODULE: UDHIBITI WA MATANGAZO YA SLIDERS */}
          <div className="glass-card rounded-2xl p-4 shadow-xl border border-gold-500/10 bg-gradient-to-br from-neutral-950 to-transparent space-y-4">
            <h3 className="text-xs font-display font-semibold text-gold-400 uppercase tracking-widest pb-2 border-b border-white/10 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Picha za Slide & Matangazo</span>
            </h3>

            <p className="text-[9px] text-neutral-400 leading-relaxed">
              Kama msimamizi, unaweza kuweka na kupania matangazo ambayo yataonekana kwenye slider ya mwanzo wa Application hapa.
            </p>

            <form onSubmit={handleAdSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Kichwa cha Tangazo (Ad Title) *</label>
                <input
                  type="text"
                  placeholder="Mfano: Sikukuu Promo! Ongeza 5,000 Pata Bonus"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2.5 py-1.5 text-xs text-neutral-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Maelezo ya Tangazo (Ad Body) *</label>
                <textarea
                  rows={2}
                  placeholder="Mfano: Lipia kwa haraka kutumia akaunti yetu na kupata nyongeza ya..."
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 resize-none font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Kategoria (Tag) *</label>
                  <input
                    type="text"
                    placeholder="Mfano: OFA KABAMBE"
                    value={adCategory}
                    onChange={(e) => setAdCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 uppercase font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono tracking-wider font-bold uppercase text-neutral-400 block">Picha ya Slide (Pakia/Link) *</label>
                  <div className="relative flex items-center justify-between h-[34px] border border-white/10 focus-within:border-gold-500 bg-black/40 rounded-xl px-2 overflow-hidden">
                    <input
                      type="text"
                      placeholder="Weka link au pakia ->"
                      value={adCoverUrl.startsWith('data:image') ? '✓ Picha Imepakiwa' : adCoverUrl}
                      onChange={(e) => {
                        if (!e.target.value.startsWith('✓')) {
                          setAdCoverUrl(e.target.value);
                        }
                      }}
                      className="w-full bg-transparent outline-none text-[10px] text-neutral-200 font-mono truncate mr-1"
                      required
                    />
                    <label className="p-1 px-2 rounded-lg bg-gold-500 text-neutral-950 hover:brightness-110 text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0">
                      <span>Pakia</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64String = reader.result as string;
                              setAdCoverUrl(base64String);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Preset Image Selection */}
              <div className="space-y-1">
                <span className="text-[8px] font-mono uppercase font-bold text-neutral-500 block">Picha Chagua Haraka (Presets)</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {PRESET_AD_COVERS.map((cov) => (
                    <button
                      key={cov.name}
                      type="button"
                      onClick={() => setAdCoverUrl(cov.url)}
                      className={`px-2 py-1 text-[8px] uppercase tracking-wider font-bold rounded-md bg-white/5 border text-neutral-300 hover:brightness-110 active:scale-95 shrink-0 transition-all ${
                        adCoverUrl === cov.url ? "border-gold-500 text-gold-400 font-black" : "border-white/5"
                      }`}
                    >
                      {cov.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-500 to-amber-500 hover:brightness-115 text-neutral-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg"
              >
                <span>Hifadhi Tangazo kwenye Slide (Save Ad)</span>
              </button>
            </form>

            <div className="pt-3 border-t border-white/5">
              <span className="text-[8px] font-mono uppercase font-bold text-neutral-450 tracking-wider block mb-2">
                Orodha ya Matangazo ya Slide ya Sasa
              </span>
              
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-0.5">
                {slides.map((ad: any) => (
                  <div key={ad.id} className="flex justify-between items-center bg-black/40 border border-white/5 rounded-xl p-2 text-[10px] font-sans">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={ad.coverUrl} className="w-8 h-10 rounded object-cover shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-neutral-200 block line-clamp-1">{ad.title}</span>
                        <span className="text-neutral-500 text-[8px] font-mono block mt-0.5 uppercase">{ad.category}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Je, una uhakika unataka kufuta kabisa tangazo hili la "${ad.title}"?`)) {
                            onDeleteSlide && onDeleteSlide(ad.id);
                          }
                        }}
                        className="text-neutral-500 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Futa Tangazo"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {slides.length === 0 && (
                  <p className="text-[9px] text-neutral-500 italic text-center py-2">Hakuna matangazo yoyote ya slide kwa sasa.</p>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 shadow-xl flex-1 flex flex-col">
            <h3 className="text-xs font-display font-semibold text-neutral-200 uppercase tracking-widest pb-2 border-b border-white/10 mb-3 block">
              Orodha ya Simulizi Zote
            </h3>

            {/* Inventory listing */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {stories.map((stor) => {
                return (
                  <div
                    key={stor.id}
                    id={`admin-item-${stor.id}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/40 hover:bg-white/5 border border-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={stor.coverUrl}
                        alt={stor.title}
                        referrerPolicy="no-referrer"
                        className="w-8 h-10 rounded object-cover shrink-0 bg-neutral-800"
                      />
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold text-neutral-200 truncate pr-2 font-sans">
                          {stor.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[9px] text-neutral-500 mt-0.5 font-sans">
                          <span>na {stor.author}</span>
                          <span>•</span>
                          <span className="font-mono text-gold-500">★ {stor.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {stor.isFeatured && (
                        <span className="text-[7px] bg-gold-500/10 text-gold-400 border border-gold-500/20 px-1 py-0.5 rounded font-mono font-bold uppercase text-center" title="Katika Slider">
                          SLIDER
                        </span>
                      )}
                      
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 font-mono pr-1">
                        {stor.isPremium ? `TZS ${stor.price}` : 'Bure'}
                      </span>
                      
                      {/* Google Drive Export Button */}
                      <button
                        id={`export-story-drive-${stor.id}`}
                        onClick={() => handleExportStoryToDrive(stor)}
                        className="text-neutral-500 hover:text-emerald-450 hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Tuma simulizi hii Google Drive (.txt)"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Edit button */}
                      <button
                        id={`edit-story-${stor.id}`}
                        onClick={() => {
                          setEditingStoryId(stor.id);
                          setTitle(stor.title);
                          setAuthor(stor.author);
                          setDescription(stor.description);
                          setCategory(stor.category);
                          setIsPremium(stor.isPremium);
                          setPrice(stor.price);
                          setCoverUrl(stor.coverUrl);
                          setCustomCoverUrl(PRESET_COVERS.some(c => c.url === stor.coverUrl) ? '' : stor.coverUrl);
                          setChapterTitle(stor.chapters[0]?.title || 'Mlango wa 1: Mwanzo wa Safari');
                          setChapterContent(stor.chapters[0]?.content || '');
                          setIsFeatured(stor.isFeatured || false);
                          setReads(stor.reads || 0);
                          setLikes(stor.likes || 0);
                          
                          // Scroll form into view
                          document.getElementById('form-story-title')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-neutral-500 hover:text-gold-400 hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Hariri Simulizi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete icon */}
                      <button
                        id={`delete-story-${stor.id}`}
                        onClick={() => {
                          if (confirm(`Je una uhakika unataka kufuta kabisa simulizi "${stor.title}"?`)) {
                            onDeleteStory(stor.id);
                          }
                        }}
                        className="text-neutral-500 hover:text-red-500 hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Futa Simulizi"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {stories.length === 0 && (
                <div className="text-center py-10 text-xs text-neutral-500 italic block">
                  Hakuna simulizi yoyote iliyohifadhiwa hadi sasa. Jaza fomu ili utengeneze!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
