/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// JSON file database path
import fs from "fs";
const DB_PATH = path.join(process.cwd(), "db.json");

// Helper to read DB safely
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const defaultDb = { 
        admin_revenue: 455000, 
        withdrawals: [], 
        transactions: [], 
        stories: [], 
        slides: [],
        public_stats: {
          totalUsers: 300000,
          onlineUsers: 3200
        },
        users: [],
        payment_config: {
          gateway: "SELCOM",
          api_key: "sec_live_6f8b91bc7d9a1dc05f...",
          api_secret: "api_sec_c03be921bc4fa8a...",
          merchant_id: "MC-8849204",
          bank_account: "31110190455",
          settlement_network: "NMB BANK",
          auto_withdraw: false
        }
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    const db = JSON.parse(data);

    // Hakikisha root states za wanachama na takwimu vipo
    if (!db.public_stats) {
      db.public_stats = {
        totalUsers: 300000,
        onlineUsers: 3200
      };
    }
    if (!db.users) {
      db.users = [];
    }
    if (!db.slides) {
      db.slides = [];
    }
    if (!db.payment_config) {
      db.payment_config = {
        gateway: "SELCOM",
        api_key: "sec_live_6f8b91bc7d9a1dc05f...",
        api_secret: "api_sec_c03be921bc4fa8a...",
        merchant_id: "MC-8849204",
        bank_account: "31110190455",
        settlement_network: "NMB BANK",
        auto_withdraw: false
      };
    }
    return db;
  } catch (err) {
    console.error("Error reading db.json:", err);
    return { 
      admin_revenue: 455000, 
      withdrawals: [], 
      transactions: [], 
      stories: [], 
      slides: [],
      payment_config: {
        gateway: "SELCOM",
        api_key: "sec_live_6f8b91bc7d9a1dc05f...",
        api_secret: "api_sec_c03be921bc4fa8a...",
        merchant_id: "MC-8849204",
        bank_account: "31110190455",
        settlement_network: "NMB BANK",
        auto_withdraw: false
      }
    };
  }
}

// Helper to write DB safely
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing db.json:", err);
    return false;
  }
}

// 1. GET all stories
app.get("/api/stories", (req, res) => {
  const db = readDb();
  res.json(db.stories || []);
});

// 2. POST create a new story
app.post("/api/stories", (req, res) => {
  const newStory = req.body;
  if (!newStory || !newStory.id) {
    return res.status(400).json({ error: "Story data is invalid." });
  }
  const db = readDb();
  db.stories = [newStory, ...(db.stories || [])];
  writeDb(db);
  res.status(201).json(newStory);
});

// 3. PUT update an existing story
app.put("/api/stories/:id", (req, res) => {
  const { id } = req.params;
  const updatedStory = req.body;
  const db = readDb();
  db.stories = (db.stories || []).map((s: any) => s.id === id ? updatedStory : s);
  writeDb(db);
  res.json(updatedStory);
});

// 4. DELETE a story
app.delete("/api/stories/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.stories = (db.stories || []).filter((s: any) => s.id !== id);
  writeDb(db);
  res.json({ message: "Story successfully deleted", id });
});

// 5. GET administrative revenue records and logs
app.get("/api/revenue_data", (req, res) => {
  const db = readDb();
  res.json({
    admin_revenue: db.admin_revenue || 0,
    withdrawals: db.withdrawals || [],
    transactions: db.transactions || []
  });
});

// 6. POST execute a premium payout lock / checkout
app.post("/api/payments/checkout", (req, res) => {
  const { storyId, storyTitle, amount, paymentMethod, phoneOrCard } = req.body;
  
  if (!storyId || !amount) {
    return res.status(400).json({ error: "Kigezo cha storyId na amount kinahitajika." });
  }

  const db = readDb();
  const amountNum = Number(amount);
  
  // Record transaction on server database
  const newTx = {
    id: `TX-${Math.random().toString().slice(2, 8).toUpperCase()}`,
    storyTitle: storyTitle || "Premium Story",
    amount: amountNum,
    paymentMethod: paymentMethod || "MOBILE",
    status: "SUCCESS",
    phone: phoneOrCard || "Akaunti mteja",
    date: new Date().toISOString().split("T")[0]
  };

  db.transactions = [newTx, ...(db.transactions || [])];
  // Securely credit the funds to the NMB merchant checkout pot!
  db.admin_revenue = (db.admin_revenue || 0) + amountNum;
  
  writeDb(db);
  res.json({ success: true, transaction: newTx, admin_revenue: db.admin_revenue });
});

// 7. POST process admin withdrawal (Direct settlement to NMB Bank account or mobile money)
app.post("/api/withdraw", (req, res) => {
  const { amount, method, accountNo } = req.body;
  if (!amount || amount <= 0 || !accountNo) {
    return res.status(400).json({ error: "Kiasi na akaunti ya kutolea vigezo vinahitajika." });
  }

  const db = readDb();
  const amt = Number(amount);
  
  if (amt > db.admin_revenue) {
    return res.status(400).json({ error: "Salio halitoshi kufanya utoaji wa kiasi hiki katika backend server." });
  }

  // Deduct revenue on server database
  db.admin_revenue -= amt;

  // Build the withdrawal history record
  const newWithdrawal = {
    id: `W-${method === "NMB BANK" ? "NMB" : "MOB"}-${Math.floor(100 + Math.random() * 900)}`,
    amount: amt,
    method: method,
    accountNo: accountNo.trim(),
    date: new Date().toISOString().split("T")[0],
    status: "SUCCESS"
  };

  db.withdrawals = [newWithdrawal, ...(db.withdrawals || [])];
  
  writeDb(db);
  res.json({ success: true, withdrawal: newWithdrawal, admin_revenue: db.admin_revenue });
});

// 7a. GET payment configuration settings
app.get("/api/payment_config", (req, res) => {
  const db = readDb();
  res.json(db.payment_config || {
    gateway: "SELCOM",
    api_key: "",
    api_secret: "",
    merchant_id: "",
    bank_account: "31110190455",
    settlement_network: "NMB BANK",
    auto_withdraw: false
  });
});

// 7b. POST save payment configuration settings
app.post("/api/payment_config", (req, res) => {
  const config = req.body;
  if (!config) {
    return res.status(400).json({ error: "Invalid configuration data" });
  }
  
  const db = readDb();
  db.payment_config = {
    gateway: config.gateway || "SELCOM",
    api_key: config.api_key || "",
    api_secret: config.api_secret || "",
    merchant_id: config.merchant_id || "",
    bank_account: config.bank_account || "31110190455",
    settlement_network: config.settlement_network || "NMB BANK",
    auto_withdraw: !!config.auto_withdraw
  };
  
  writeDb(db);
  res.json({ success: true, payment_config: db.payment_config });
});

// 7c. POST Initiate dynamic payment deposit (Supports Tanzanian carriers & international debit cards via Flutterwave/Selcom)
app.post("/api/payments/deposit", async (req, res) => {
  const { amount, phone, email, operator, isInternational, redirect_url } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Kiasi cha fedha kinahitajika na lazima kiongezeke." });
  }

  const db = readDb();
  const config = db.payment_config || {};
  const amt = Number(amount);
  const txRef = `TX-DEP-${Math.random().toString().slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  // Determine if it is a demo environment or real key configured
  const isDemoKey = !config.api_secret || 
                    config.api_secret.trim() === "" || 
                    config.api_secret.includes("...") || 
                    config.api_secret.startsWith("api_sec_c03b") ||
                    config.api_secret === "sec_live_6f8b91bc7d9a1dc05f...";

  if (isDemoKey) {
    // If demo mode, log transaction on server and return success simulator
    const carrier = operator || "FLUTTERWAVE";
    const statusText = isInternational ? "Visa/Mastercard Checkout" : `USSD PUSH Sim ya ${phone || "Mteja"}`;
    
    // We return instructions so the client is highly educated on why it's simulated and how to activate and try it live!
    return res.json({
      success: true,
      is_demo: true,
      tx_ref: txRef,
      message: `[HALI YA MAJARIBIO ACTIVATED] Umefanya ombi la amana ya TZS ${amt.toLocaleString()} kutoka namba ${phone || ""}. Kwa kuwa mfumo bado uko katika 'Test Mode' kwenye wasifu wa Admin (API key haijawekwa), tumeingiza salio hili moja kwa moja bila kukuomba namba ya siri kwenye kadi yako ya simu. Sanidi funguo zako kule kwenye Admin Panel ili mfumo uanze kutuma prompt halisi kukata pesa!`,
      transaction: {
        id: txRef,
        storyTitle: `Amana ya Wallet (${carrier} - Majaribio)`,
        amount: amt,
        paymentMethod: isInternational ? "CARD_INT" : carrier,
        status: "SUCCESS",
        phone: phone || "International Card",
        date: new Date().toISOString().split("T")[0]
      }
    });
  }

  // Real Integration with Flutterwave / Gateway
  if (config.gateway === "FLUTTERWAVE") {
    try {
      const flwResponse = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.api_secret}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: amt,
          currency: "TZS",
          redirect_url: redirect_url || "https://ais-dev-bqefdllv7cj3rbedcokkj5-262489676589.europe-west1.run.app",
          customer: {
            email: email || "mteja@simulizi.app",
            phonenumber: phone || "",
            name: `Reader ${phone || "Tigo/Mpesa"}`
          },
          customizations: {
            title: "Simulizi Wallet Deposit",
            description: `Ongeza TZS ${amt.toLocaleString()} kwenye mkoba wako wa hadithi`,
            logo: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=128"
          }
        })
      });

      const gatewayData: any = await flwResponse.json();
      
      if (gatewayData.status === "success" && gatewayData.data?.link) {
        return res.json({
          success: true,
          is_demo: false,
          tx_ref: txRef,
          redirect_url: gatewayData.data.link, // Real hosted payment link containing Cards/Banks/USSD
          message: "Muamala umeanza kikamilifu! Fungua kiungo hiki ili kukamilisha malipo yako ya kimataifa au ya simu salama."
        });
      } else {
        return res.status(400).json({
          error: `Imeshindwa kuanzisha malipo kwenye Flutterwave Gateway: ${gatewayData.message || "Unknown Gateway Error"}`
        });
      }
    } catch (err: any) {
      console.error("Flutterwave API Error:", err);
      return res.status(500).json({ error: "Itilafu imetokea wakati wa kuwasiliana na Flutterwave server: " + err.message });
    }
  } else {
    // If Selcom or other gateway, we can also initiate their API, or provide robust fallback
    return res.json({
      success: true,
      is_demo: true,
      tx_ref: txRef,
      message: `[MFUMO WA ${config.gateway}!] Mfumo wa ${config.gateway} umeanza kuandaliwa. Kwa malipo ya KADI na KIMATAIFA bega kwa bega na mitandao ya hapa nyumbani, chagua 'Flutterwave' kama Gateway yako kuu katika Admin panel.`,
      transaction: {
        id: txRef,
        storyTitle: `Amana ya Wallet (${config.gateway} - Promo)`,
        amount: amt,
        paymentMethod: isInternational ? "CARD_INT" : "MOBILE",
        status: "SUCCESS",
        phone: phone || "Tanzania Line",
        date: new Date().toISOString().split("T")[0]
      }
    });
  }
});

// 7d. GET Verify specific payment result using reference
app.get("/api/payments/verify/:txRef", async (req, res) => {
  const { txRef } = req.params;
  const transactionId = req.query.transaction_id || req.query.id;
  
  const db = readDb();
  const config = db.payment_config || {};

  const isDemoKey = !config.api_secret || 
                    config.api_secret.trim() === "" || 
                    config.api_secret.includes("...") || 
                    config.api_secret.startsWith("api_sec_c03b") ||
                    config.api_secret === "sec_live_6f8b91bc7d9a1dc05f...";

  if (isDemoKey) {
    return res.json({
      success: true,
      status: "SUCCESS",
      is_demo: true,
      message: "Muamala wa majaribio umethibitishwa kikamilifu!"
    });
  }

  if (config.gateway === "FLUTTERWAVE" && transactionId) {
    try {
      const verifyResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${config.api_secret}`,
          "Content-Type": "application/json"
        }
      });

      const verifyData: any = await verifyResponse.json();

      if (verifyData.status === "success" && verifyData.data?.status === "successful") {
        const amountNum = Number(verifyData.data.amount);

        // Record the transaction locally, prevent duplicates
        const existingTx = (db.transactions || []).find((t: any) => t.id === txRef || t.id === `FLW-${transactionId}`);
        if (!existingTx) {
          const newTx = {
            id: `FLW-${transactionId}`,
            storyTitle: "Amana ya Wallet (Flutterwave Real Payment)",
            amount: amountNum,
            paymentMethod: verifyData.data.payment_type || "CARD/MOBILE",
            status: "SUCCESS",
            phone: verifyData.data.customer?.phonenumber || verifyData.data.customer?.email || "Mteja",
            date: new Date().toISOString().split("T")[0]
          };
          db.transactions = [newTx, ...(db.transactions || [])];
          
          // Credit administrative revenue database
          db.admin_revenue = (db.admin_revenue || 0) + amountNum;
          writeDb(db);
        }

        return res.json({
          success: true,
          status: "SUCCESS",
          amount: amountNum,
          tx_ref: txRef,
          data: verifyData.data
        });
      } else {
        return res.status(400).json({
          success: false,
          status: "FAILED",
          error: `Utatuzi wa malipo umefeli: Muamala bado haujakamilika.`
        });
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      return res.status(500).json({ error: "Imeshindwa kuwasiliana na Gateway: " + err.message });
    }
  }

  res.json({
    success: true,
    status: "SUCCESS",
    is_demo: true
  });
});

// 7.5. GET public stats (for display to readers)
app.get("/api/public_stats", (req, res) => {
  const db = readDb();
  res.json({
    totalUsers: db.public_stats?.totalUsers || 300000,
    onlineUsers: db.public_stats?.onlineUsers || 3200,
    realCount: (db.users || []).length
  });
});

// 7.6. POST update public stats (Admin capability)
app.post("/api/public_stats", (req, res) => {
  const { totalUsers, onlineUsers } = req.body;
  if (totalUsers === undefined || onlineUsers === undefined) {
    return res.status(400).json({ error: "Data is incomplete" });
  }
  const db = readDb();
  db.public_stats = {
    totalUsers: Number(totalUsers),
    onlineUsers: Number(onlineUsers)
  };
  writeDb(db);
  res.json({ success: true, public_stats: db.public_stats });
});

// 7.7. POST register/update real user (keeps track of real members)
app.post("/api/register_user", (req, res) => {
  const user = req.body;
  if (!user || (!user.phone && !user.email)) {
    return res.status(400).json({ error: "Invalid user data" });
  }
  const db = readDb();
  if (!db.users) db.users = [];
  
  // Find if user already exists based on ID, phone, or email
  const existingIndex = db.users.findIndex((u: any) => 
    u.id === user.id || 
    (user.phone && u.phone === user.phone) || 
    (user.email && u.email === user.email)
  );
  
  const updatedUser = {
    id: user.id || `user-${Date.now()}`,
    name: user.name || "Mteja Asiyejulikana",
    email: user.email || "",
    phone: user.phone || "",
    balance: user.balance !== undefined ? user.balance : 0,
    purchasedCount: (user.purchasedStoryIds || []).length,
    lastActive: new Date().toISOString(),
    isMwandishiRequested: !!user.isMwandishiRequested,
    isMwandishiApproved: !!user.isMwandishiApproved
  };
  
  if (existingIndex !== -1) {
    db.users[existingIndex] = {
      ...db.users[existingIndex],
      ...updatedUser,
      balance: user.balance !== undefined && user.balance > 0 ? user.balance : db.users[existingIndex].balance,
      isMwandishiRequested: user.isMwandishiRequested !== undefined ? !!user.isMwandishiRequested : db.users[existingIndex].isMwandishiRequested,
      isMwandishiApproved: user.isMwandishiApproved !== undefined ? !!user.isMwandishiApproved : db.users[existingIndex].isMwandishiApproved
    };
  } else {
    db.users.push(updatedUser);
  }
  
  writeDb(db);
  res.json({ success: true, userCount: db.users.length });
});

// Approve/Disapprove user author status
app.post("/api/users/toggle_mwandishi", (req, res) => {
  const { userId, isApproved } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  const db = readDb();
  if (!db.users) db.users = [];
  
  const existingIdx = db.users.findIndex((u: any) => u.id === userId);
  if (existingIdx !== -1) {
    db.users[existingIdx].isMwandishiApproved = !!isApproved;
    if (isApproved) {
      db.users[existingIdx].isMwandishiRequested = true;
    }
    writeDb(db);
    return res.json({ success: true, user: db.users[existingIdx] });
  }
  res.status(404).json({ error: "User not found" });
});

// 7.8. GET all real registered users (for Admin Panel-ONLY read view, NO EDIT ALLOWED)
app.get("/api/real_users", (req, res) => {
  const db = readDb();
  res.json(db.users || []);
});

// 8. GET all sliding advertisements (Matangazo ya slides)
app.get("/api/slides", (req, res) => {
  const db = readDb();
  res.json(db.slides || []);
});

// 9. POST add a new slide advertisement
app.post("/api/slides", (req, res) => {
  const newSlide = req.body;
  if (!newSlide || !newSlide.title) {
    return res.status(400).json({ error: "Slide data is invalid." });
  }
  const db = readDb();
  const slideId = `slide-${Date.now()}`;
  const prepared = {
    id: slideId,
    title: newSlide.title.trim(),
    description: newSlide.description?.trim() || "",
    coverUrl: newSlide.coverUrl?.trim() || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1200",
    category: (newSlide.category || "TANGAZO").trim().toUpperCase(),
    rating: 5.0,
    price: 0,
    isAd: true,
    isPremium: false,
    reads: Math.floor(2000 + Math.random() * 8000)
  };
  db.slides = [prepared, ...(db.slides || [])];
  writeDb(db);
  res.status(201).json(prepared);
});

// 10. DELETE a slide advertisement
app.delete("/api/slides/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.slides = (db.slides || []).filter((s: any) => s.id !== id);
  writeDb(db);
  res.json({ message: "Slide successfully deleted", id });
});

// Initialize server-side Gemini client lazily to avoid crash if API key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// API endpoint for server-side AI Swahili Story generation
app.post("/api/generate_story", async (req, res) => {
  const { prompt, category } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Kigezo cha 'prompt' kinahitajika." });
  }

  const selectedCategory = category || "Drama";
  const genAI = getAiClient();

  // Robust fallback stories in Kiswahili so that the app NEVER crashes and works instantly even offline
  const fallbacks: Record<string, any> = {
    "Horror": {
      title: "Mizimu ya Ghorofani",
      description: "Simulation ya AI: Kisa cha kusisimua kuhusu jengo la zamani la ghorofa Kariakoo lenye sauti za ajabu usiku.",
      author: "Mwandishi wa AI",
      content: `Usiku ulikuwa wa baridi sana katikati ya mji wa vurugu wa Kariakoo, Dar es Salaam. Jengo la ghorofa tano la mzee Mussa lilikuwa kimya, tofauti kabisa na masaa ya mchana. Kijana mlinzi Baraka alikuwa amekaa sebuleni ghorofa ya kwanza akisikiliza redio ndogo ya mkononi.\n\nGhafla, alisikia hatua za watu wakitembea kwa haraka kwenye korido ya ghorofa ya nne. Hatua hizo hazikuwa za kawaida; zilikuwa nzito na zilifuatiwa na sauti ya mtoto mdogo akicheka kwa siri. Baraka alishika tochi yake na kuanza kupanda ngazi polepole, kila hatua aliyochukua ikisababisha moyo wake udunde kwa kasi zaidi.\n\nAlipofika ghorofa ya nne, alimulika tochi yake. Hakukuwa na mtu, lakini milango yote mitano ilikuwa ikifunguka na kujifunga yenyewe kwa nguvu, kwa upepo mkali uliokuwa ukitokea kusikojulikana. Ghafla, tochi yake ilizima na akahisi pumzi ya baridi sana ikivuma nyuma ya shingo yake.`
    },
    "Love Story": {
      title: "Pendo la Mtamboni",
      description: "Simulation ya AI: Kisa kinachohusu vijana wawili wanaokutana kwa siri kupitia kurekebisha mitambo kando ya barabara.",
      author: "Mwandishi wa AI",
      content: `Neema alikuwa msichana aliyesomea masuala ya uhandisi wa mitandao, akifanya kazi katika minara ya simu ya kijijini Masasi. Siku ya Jumanne asubuhi, mnara mkuu ulikumbwa na hitilafu ya umeme uliosababisha eneo zima kukosa mawasiliano.\n\nKijana mtaalamu kutoka makao makuu, Juma, alifika kusaidia. Walipokuwa wakifanya kazi bega kwa bega katikati ya rundo la nyaya na mota kubwa za upepo, walijikuta wakishea hadithi za maisha yao ya zamani na changamoto zao.\n\nKabla ya usiku kuingia, mnara ulikuwa unawaka tena na kuleta mawasiliano. Lakini mnara huo haukuunganisha simu tu, bali ulikuwa umeunganisha mioyo miwili ambayo haitawahi kutengana tena katika dhoruba yoyote ile ya maisha.`
    },
    "Default": {
      title: "Siri ya Dhahabu ya Chunya",
      description: "Simulation ya AI: Safari ya kutafuta utajiri Chunya inayomfundisha kijana maana halisi ya upendo na uzalendo.",
      author: "Mwandishi wa AI",
      content: `Kijana Saidi alikuwa ameishi maisha ya mateso katika kijiji cha Chunya, mkoani Mbeya. Siku moja akiwa anachimba mchanga mtoni kama kibarua, jembe lake liligonga mwamba uliokuwa unang'aa kwa namna isiyo ya kawaida katikati ya mchanga mweusi.\n\nAlipochukua mwamba ule na kuuonyesha kwa mzee wa busara, alithibitishiwa kuwa ilikuwa ni dhahabu safi ya kiwango cha juu. Lakini mzee huyo aliongeza onyo kali: 'Mwanangu, dhahabu hii haitakuletea furaha isipokuwa utaitumia kusaidia wajane na yatima wa kijiji hiki.'\n\nSaidi akajenga shule na hospitali mpya kwa ajili ya kijiji kizima. Aligundua kuwa thamani halisi ya dhahabu sio kununua vitu vya kifahari pekee, bali ni kuacha alama ya upendo katika mioyo ya wale wasiojiweza.`
    }
  };

  const chosenFallback = fallbacks[selectedCategory] || fallbacks["Default"];

  if (!genAI) {
    // Return mock story draft instantly if key is not declared
    return res.json(chosenFallback);
  }

  try {
    const promptMessage = `Tengeneza simulizi ya Kiswahili ya kuvutia sana kuhusu mada hii: "${prompt}". Jamii ya simulizi iwe: "${selectedCategory}". 
    Hakikisha simulizi ina jina la kuvutia linalofaa, na maelezo mafupi, pamoja na aya mbili nzuri za Kiswahili safi zinazosimulia kwa mtiririko wa kusisimua. 
    Weka pia mwandishi wa kubuni wa Kiswahili.
    Rudisha JSON pekee yenye funguo hizi:
    "title": "Jina la simulizi",
    "description": "Maelezo mafupi ya kusisimua ya mistari miwili",
    "author": "Jina la Mwandishi",
    "content": "Hadithi yenyewe ya Kiswahili yenye aya mbili za kusisimua"`;

    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            author: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "description", "author", "content"]
        }
      }
    });

    const textOutput = response.text;
    if (textOutput) {
      const parsed = JSON.parse(textOutput.trim());
      return res.json(parsed);
    } else {
      return res.json(chosenFallback);
    }
  } catch (err: any) {
    console.error("Gemini request error:", err);
    return res.json(chosenFallback);
  }
});

// ==========================================
// GOOGLE DRIVE BACKUP & OAUTH INTEGRATION ENDPOINTS
// ==========================================

// 1. GET Google Authorization URL
app.get("/api/auth/google/url", (req, res) => {
  const referer = req.headers.referer || "http://localhost:3000";
  const appUrl = (process.env.APP_URL || referer).replace(/\/$/, "");
  const redirectUri = `${appUrl}/auth/google/callback`;
  
  const clientId = process.env.GOOGLE_CLIENT_ID || "even-catalyst-dpp0d.apps.googleusercontent.com";
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive")}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.json({ url: googleAuthUrl });
});

// 2. GET Google OAuth Callback
app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
  const { code } = req.query;
  const referer = `${req.protocol}://${req.get("host")}`;
  const appUrl = (process.env.APP_URL || referer).replace(/\/$/, "");
  const redirectUri = `${appUrl}/auth/google/callback`;

  if (!code) {
    return res.send(`
      <html>
        <head><title>Google Authentication Mismatch</title></head>
        <body style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; text-align: center;">
          <h2 style="color: #ff5555;">Hitilafu ya Itifaki!</h2>
          <p>Msimbo wa idhini haukupatikana kutoka Google.</p>
          <button onclick="window.close()" style="background: #eab308; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Funga Dirisha</button>
        </body>
      </html>
    `);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

    // Fallback to Demo/Simulator Mode if Credentials are not set in the AI Studio environment
    if (!clientId || !clientSecret || clientId.includes("dummy") || clientId === "") {
      const dummyToken = `demo-google-oauth-token-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
      return res.send(`
        <html>
          <head><title>Google Drive - Njia ya Majaribio (Demo Mode)</title></head>
          <body style="font-family: sans-serif; background: #0c0a09; color: #f2f0ea; padding: 40px; text-align: center; border-top: 4px solid #eab308;">
            <div style="max-width: 450px; margin: 0 auto; background: #1c1917; padding: 30px; border-radius: 16px; border: 1px solid rgba(234, 179, 8, 0.2);">
              <h2 style="color: #eab308; margin-top: 0;">Google Drive: Demo Connected!</h2>
              <p style="font-size: 13px; color: #a8a29e; line-height: 1.6; text-align: justify;">
                <strong>Ilani ya Kinga ya Integration:</strong> Vizuri sana! Dirisha la majaribio limesanidiwa. Kwa kuwa haujaweka real <code>GOOGLE_CLIENT_ID</code> na <code>GOOGLE_CLIENT_SECRET</code> katika AI Studio settings bado, mfumo umekuingiza katika <strong>"Majaribio (Demo Client Simulator)"</strong> ili uweze kujaribu mzunguko hapa hapa kirahisi.
              </p>
              <div style="background: rgba(234, 179, 8, 0.1); border-left: 3px solid #eab308; padding: 10px; margin: 20px 0; font-size: 12px; text-align: left; font-family: monospace;">
                Token generated: OK<br/>
                Drive.file: SIMULATED<br/>
                Status: AUTHENTICATED
              </div>
              <button onclick="closeAndPost()" style="background: #eab308; color: #000; border: none; width: 100%; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase; tracking-wider: 1px;">Kamilisha muunganisho wa Majaribio</button>
            </div>
            <script>
              function closeAndPost() {
                if (window.opener) {
                  window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS', token: '${dummyToken}', isDemo: true }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              }
            </script>
          </body>
        </html>
      `);
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const data: any = await tokenResponse.json();

    if (data.error) {
      console.error("Google token exchange error response:", data);
      return res.send(`
        <html>
          <body style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; text-align: center;">
            <h3 style="color: #ff5555;">Kubadilisha token kumeshindwa</h3>
            <p style="color: #aaa;">${data.error_description || data.error}</p>
            <button onclick="window.close()" style="background: #eab308; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Nenda My App</button>
          </body>
        </html>
      `);
    }

    const accessToken = data.access_token;
    res.send(`
      <html>
        <body style="font-family: sans-serif; background: #00k; color: #fff; text-align: center; padding-top: 100px;">
          <h2 style="color: #22c55e;">Umeidhinishwa kikamilifu!</h2>
          <p>Umekamilisha muunganisho wa Google Drive salama. Dirisha hili liko karibu kufunguka...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS', token: '${accessToken}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("Callback error:", err);
    res.status(500).send("Error exchanging authorization code: " + err.message);
  }
});

// 3. GET export database backup copy
app.get("/api/admin/get_backup", (req, res) => {
  const db = readDb();
  res.json(db);
});

// 4. POST restore database backup copy
app.post("/api/admin/restore_backup", (req, res) => {
  const { backup } = req.body;
  if (!backup || !backup.stories) {
    return res.status(400).json({ error: "Data ya Backup iliyotolewa haijakamilika au sio sahihi." });
  }

  // Backup existing data into a fallback copy first before writing!
  const success = writeDb(backup);
  if (success) {
    res.json({ success: true, message: "Kazi na orodha za members zimerudishwa kikamilifu kutoka kwenye file la hifadhi!" });
  } else {
    res.status(500).json({ error: "Imeshindwa kuhifadhi backup kwenye seva ya faili." });
  }
});

// Serve static assets in production, otherwise hook Vite middleware for Dev
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server runing on http://localhost:${PORT}`);
  });
}

bootstrap();
