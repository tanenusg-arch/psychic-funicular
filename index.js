
function apply_discount_deduplication(packages) {
  if (!packages || !Array.isArray(packages)) return packages;
  
  packages.forEach(pkg => {
    const originalName = String(pkg.display_name || pkg.name || pkg.title || "");
    let normalized = originalName
      .replace(/\s*UC\s*\(discounted\)/ig, '')
      .replace(/\s*Diamonds?\s*\(discounted\)/ig, '')
      .replace(/\s*\(discounted\)/ig, '')
      .trim();
    pkg.display_name = normalized;
    pkg.is_discounted = originalName.toLowerCase().includes('(discounted)');
  });

  const grouped = {};
  packages.forEach(pkg => {
    const key = pkg.display_name.toLowerCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(pkg);
  });

  const chosenPackages = new Set();
  for (const key in grouped) {
    const group = grouped[key];
    const discounted = group.filter(p => p.is_discounted);
    if (discounted.length > 0) {
      discounted.forEach(p => chosenPackages.add(p));
    } else {
      group.forEach(p => chosenPackages.add(p));
    }
  }

  const filtered = packages.filter(pkg => chosenPackages.has(pkg));
  
  filtered.sort((a, b) => {
    const numA = parseFloat((String(a.display_name || "").match(/[\d\.]+/) || [])[0]);
    const numB = parseFloat((String(b.display_name || "").match(/[\d\.]+/) || [])[0]);
    
    const isValidA = !isNaN(numA);
    const isValidB = !isNaN(numB);

    if (isValidA && isValidB && numA !== numB) {
      return numA - numB;
    }

    const priceA = parseFloat(a.unit_price ?? a.price ?? a.amount ?? a.cost ?? 0);
    const priceB = parseFloat(b.unit_price ?? b.price ?? b.amount ?? b.cost ?? 0);
    
    return priceA - priceB;
  });

  return filtered;
}

function sort_game_packages(gameCode, packages) {
  if (!packages || !Array.isArray(packages)) return packages;
  const lowerCode = (gameCode || "").toLowerCase();
  if (lowerCode.includes("freefire") || lowerCode.includes("free_fire")) {
    function getFFCategory(pkg) {
      const name = (
        pkg.display_name || pkg.name || pkg.title ||
        pkg.catalogue_name ||
        ""
      ).toLowerCase();
      if (name.includes("level up") || name.includes("levelup")) return 3;
      if (
        name.includes("membership") ||
        name.includes("booyah") ||
        name.includes("pass") ||
        name.includes("lite")
      )
        return 2;
      return 1;
    }

    packages.sort((a, b) => {
      const catA = getFFCategory(a);
      const catB = getFFCategory(b);
      if (catA !== catB) return catA - catB;

      if (catA === 3) {
        const matchA = (a.name || a.title || "").match(/level\s*(\d+)/i);
        const matchB = (b.name || b.title || "").match(/level\s*(\d+)/i);
        if (matchA && matchB) {
          return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
        }
      }

      const priceA = parseFloat(
        a.unit_price ?? a.price ?? a.amount ?? a.cost ?? 0,
      );
      const priceB = parseFloat(
        b.unit_price ?? b.price ?? b.amount ?? b.cost ?? 0,
      );
      return priceA - priceB;
    });
  }
  return packages;
}

/* =================================================================== */

/* COMPLETE INDEX.JS – Long Polling (no webhook) */
/* All modules included */

/* =================================================================== */
const { Telegraf } = require("telegraf");
const axios = require("axios");
const winston = require("winston");
const { v4: uuidv4 } = require("uuid");
const { initializeApp, getApps, getApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  increment,
  limit,
  runTransaction,
  getCountFromServer,
  writeBatch,
} = require("firebase/firestore");
require("dotenv").config();
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} - ${level.toUpperCase()} - ${message}`,
    ),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "bot_debug.log" }),
  ],
});
const BOT_TOKEN = "8804113450:AAEN1D5pTcKRNBH0n4hgj7OJThOX8HDXCPM";
const G2BULK_API_KEY =
  "e3c640d2c6a2b013f04d9ba4140aea95bf579a4b098a3e6979f594b8de624031";
const G2BULK_BASE_URL = "https://api.g2bulk.com/v1";
const ADMIN_USERNAME = "@Dev_LecteR";
const ADMIN_CHAT_ID = [8453713398, 8636992436, 6153912689];
const UPDATES_CHANNEL = "@Exynosshop";
const SUPPORT_WEBSITE = "";
const TELEBIRR_PHONE = "0938130328";
const MIN_DEPOSIT_BIRR = 50;
const MIN_WITHDRAW_BIRR = 100;
const VERIFY_API_BASE_URL = "https://verifyapi.leulzenebe.pro";
const VERIFY_API_KEY =
  "sk_live_d82a6778a32490185e6eed0fbc2a00da0be3fe2467a4d8d3";
const EXPECTED_RECEIVER_NAME = "Atsede Gabreigzaber Tsagaye";
const CACHE_TTL = 600;
const PROOF_CHANNEL_ID = -1004442339437;
const REPORT_CHANNEL_ID = PROOF_CHANNEL_ID;
const EXCHANGE_RATE = 193.0;
const ID_CHECK = "5382350120815713040";
const ID_CROSS = "5240241223632954241";
const ID_CONFIRM = "5857044938755149915";
const ID_CANCEL = "5240241223632954241";
const ID_BACK = "5391090636961099009";
const ID_DEPOSIT = "5224641412787630992";
const ID_WITHDRAW = "5987880246865565644";
const ID_PROFILE = "5904630315946611415";
const ID_ORDER = "5258024802010026053";
const ID_HELP = "6305243923056954377";
const ID_HOME = "5920332557466997677";
const ID_STAR = "5954135079662916434";
const ID_PREMIUM = "5789440723292000849";
const ID_TELEBIRR = "5796366529855494419";
const ID_GAME = "6170064612008924065";
const ID_MORE = "5397916757333654639";
const ID_SUPPORT = "6028346797368283073";
const ID_WALLET = "5769126056262898415";
const ID_SUCCESS = "6170055790146098906";
const ID_FAIL = "5260293700088511294";
const ID_INFO = "5936017305585586269";
const ID_WARNING = "5447644880824181073";
const ID_USER = "5920052658743283381";
const ID_CALENDAR = "5039534051816375152";
const ID_MONEY = "5224257782013769471";
const ID_SETTINGS = ID_INFO;
const ID_MEGAPHONE = ID_MORE;
const ID_ADD = ID_MORE;
const ID_LIST = ID_ORDER;
const ID_DELETE = ID_CANCEL;
const ID_TOGGLE = ID_INFO;
const ID_BAN = ID_CROSS;
const ID_UNBAN = ID_CHECK;
const ID_SEARCH = ID_ORDER;
const ID_CLOCK = ID_CALENDAR;
const ID_MAIL = ID_SUPPORT;
function emoji_tag(emoji_id, fallback) {
  return "";
}
const EMOJI_CHECK = "✅";
const EMOJI_CROSS = "❌";
const EMOJI_CONFIRM = "✅";
const EMOJI_CANCEL = "❌";
const EMOJI_BACK = "🔙";
const EMOJI_DEPOSIT = "📥";
const EMOJI_WITHDRAW = "📤";
const EMOJI_PROFILE = "👤";
const EMOJI_ORDER = "🛒";
const EMOJI_HELP = "❓";
const EMOJI_HOME = "🏠";
const EMOJI_STAR = "⭐";
const EMOJI_PREMIUM = "💎";
const EMOJI_TELEBIRR = "💸";
const EMOJI_GAME = "🎮";
const EMOJI_MORE = "➕";
const EMOJI_SUPPORT = "🎧";
const EMOJI_WALLET = "👛";
const EMOJI_SUCCESS = "✅";
const EMOJI_FAIL = "❌";
const EMOJI_INFO = "ℹ️";
const EMOJI_WARNING = "⚠️";
const EMOJI_USER = "👤";
const EMOJI_CALENDAR = "📅";
const EMOJI_MONEY = "💰";
const EMOJI_BAN = "🚫";
const EMOJI_UNBAN = "✅";
const EMOJI_TOGGLE = "🔄";
const EMOJI_SETTINGS = "⚙️";
const EMOJI_MEGAPHONE = "📢";
const EMOJI_ADD = "➕";
const EMOJI_LIST = "📋";
const EMOJI_DELETE = "🗑️";
const EMOJI_CLOCK = "⏱️";
const EMOJI_MAIL = "✉️";
const EMOJI_SEARCH = "🔍";
function api_price_to_birr(
  api_price,
  markup_amount = 0.0,
  is_telegram = false,
) {
  return is_telegram
    ? api_price * 1.0 + markup_amount
    : api_price * EXCHANGE_RATE + markup_amount;
}
function parse_amount(s) {
  if (!s || typeof s !== "string") return null;
  const clean = s.trim().toLowerCase().replace(/,/g, "");
  if (clean.endsWith("k")) {
    const val = parseFloat(clean.slice(0, -1));
    return isNaN(val) ? null : Math.floor(val * 1000);
  }
  if (clean.endsWith("m")) {
    const val = parseFloat(clean.slice(0, -1));
    return isNaN(val) ? null : Math.floor(val * 1000000);
  }
  if (clean.endsWith("b")) {
    const val = parseFloat(clean.slice(0, -1));
    return isNaN(val) ? null : Math.floor(val * 1000000000);
  }
  const val = parseFloat(clean);
  return isNaN(val) ? null : Math.floor(val);
}
function parse_telegram_name(name) {
  if (!name || typeof name !== "string") return null;
  const s = name.toLowerCase().trim();
  const starsMatch = s.match(/(\S+)\s*stars?/);
  if (starsMatch) {
    const amount = parse_amount(starsMatch[1]);
    if (amount !== null) return ["stars", amount];
  }
  const premiumMatch = s.match(/(\S+)\s*(?:months?|month|year|yr)\s*premium/);
  if (premiumMatch) {
    let amount = parse_amount(premiumMatch[1]);
    if (amount !== null) {
      if (s.includes("year") || s.includes("yr")) amount *= 12;
      return ["premium", amount];
    }
  }
  return null;
}
function format_telegram_display(name, birr_price) {
  const parsed = parse_telegram_name(name);
  if (parsed) {
    const [type, amount] = parsed;
    if (type === "stars")
      return `${amount} stars - ${Math.floor(birr_price)}ETB`;
    if (type === "premium")
      return `${amount} Months premium - ${Math.floor(birr_price)}ETB`;
  }
  return `${name} - ${Math.floor(birr_price)}ETB`;
}
function get_clean_telegram_name(name) {
  const parsed = parse_telegram_name(name);
  if (parsed) {
    const [type, amount] = parsed;
    if (type === "stars") return `${amount} stars`;
    if (type === "premium") return `${amount} Months premium`;
  }
  return name;
}
function extract_last4(account) {
  if (!account) return "";
  const digits = String(account).replace(/\D/g, "");
  return digits.length >= 4 ? digits.slice(-4) : digits;
}
function format_deposit_id(dep_id) {
  const num = parseInt(dep_id, 10);
  return `EX${num + 100}`;
}
function format_withdrawal_id(wth_id) {
  const str = String(wth_id);
  if (str.startsWith("WTH-")) return str;
  if (/^\d+$/.test(str)) return `EX${parseInt(str, 10) + 200}`;
  return str;
}
function parse_formatted_id(formatted, type) {
  if (!formatted) return null;
  const match = formatted
    .trim()
    .toUpperCase()
    .match(/^EX(\d+)$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (type === "deposit") return String(num - 100);
  if (type === "withdrawal") return String(num - 200);
  
  // Legacy logic fallback if type isn't provided or we just want to guess
  if (num >= 101 && num <= 199) return String(num - 100);
  if (num >= 201 && num <= 299) return String(num - 200);
  return null;
}
function generate_withdrawal_id() {
  const random_part = Array.from(
    { length: 8 },
    () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)],
  ).join("");
  const numeric_part = String(Math.floor(Date.now()) % 10000);
  return `WTH-${random_part}-${numeric_part}`;
}
function get_main_keyboard() {
  return {
    keyboard: [
      [{ text: "🎮 Service" }, { text: "📥 Deposit" }],
      [{ text: "🛒 My Orders" }, { text: "📤 Withdraw" }],
      [{ text: "🤝 Referral" }, { text: "🎁 Redeem" }],
      [{ text: "🎧 Support" }],
    ],
    resize_keyboard: true,
  };
}
async function sendMainMenu(ctx, db, messageIdToEdit = null) {
  const userId = ctx.from.id;
  const user_data = await db.get_user_profile(userId);
  const reg_date =
    user_data && user_data.registered_at
      ? user_data.registered_at.slice(0, 10)
      : "N/A";
  const caption =
    `${EMOJI_HOME} <b>Welcome, ${ctx.from.first_name}!</b>\n\n` +
    `${EMOJI_PROFILE} <b>User Profile</b>\n` +
    `${EMOJI_USER} <b>Name:</b> ${user_data ? user_data.first_name : "N/A"}\n` +
    `${EMOJI_USER} <b>Username:</b> @${user_data ? user_data.username : "N/A"}\n` +
    ` <b>ID:</b> <code>${userId}</code>\n` +
    `${EMOJI_CALENDAR} <b>Joined:</b> ${reg_date}\n\n` +
    `${EMOJI_MONEY} <b>Balance:</b> ${Math.floor(user_data ? user_data.balance || 0 : 0)} ETB\n` +
    `${EMOJI_MONEY} <b>Referral Earned:</b> ${Math.floor(user_data ? user_data.referral_balance || 0 : 0)} ETB\n\n` +
    ` Top‑up Telegram Stars & Premium at the best rates.\n` +
    ` Tap a button below:`;
  const startImage = "https://img-mom.bitibiti.workers.dev/img/AgACAgQAAxkBAAI0DGqR0w1siah7qK2YGF7dsFPwfJ6KAAIbEWsbTqCJULZuq835vTT-AQADAgADeAADPQQ";
  try {
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      await ctx.deleteMessage().catch(() => {});
    }
  } catch (e) {}
  await ctx.replyWithPhoto(startImage, {
    caption: caption,
    parse_mode: "HTML",
    reply_markup: get_main_keyboard(),
  });
}
function get_profile_keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "My Profile", callback_data: "profile_show", style: "primary" },
        {
          text: "🤝 Referral",
          callback_data: "profile_referral",
          style: "primary",
        },
      ],
      [
        {
          text: "🎁 Redeem",
          callback_data: "profile_redeem",
          style: "primary",
        },
      ],
      [
        {
          text: "Back to Main",
          callback_data: "back_to_main",
          style: "danger",
        },
      ],
    ],
  };
}
function get_service_inline_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "Games", callback_data: "svc_games", style: "success" }],
      [
        {
          text: "Telegram",
          callback_data: "svc_telegram_menu",
          style: "primary",
        },
      ],
      [
        {
          text: "Back to main menu",
          callback_data: "back_to_main",
          style: "danger",
        },
      ],
    ],
  };
}
function get_telegram_service_keyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: "Stars",
          callback_data: "svc_telegram_stars",
          style: "primary",
        },
      ],
      [
        {
          text: "Premium",
          callback_data: "svc_telegram_premium",
          style: "primary",
        },
      ],
      [{ text: "🔙 Back", callback_data: "menu_service", style: "danger" }],
    ],
  };
}
function get_free_fire_region_games(games) {
  return (games || []).filter((g) => {
    const n = normalize_game_name(g).toLowerCase();
    const c = normalize_game_code(g).toLowerCase();
    return (
      n.includes("free fire") ||
      n.includes("freefire") ||
      c.includes("free_fire") ||
      c.includes("freefire")
    );
  });
}
function get_free_fire_regions_keyboard(games) {
  const regions = get_free_fire_region_games(games).map((game) => ({
    text: normalize_game_name(game),
    callback_data: `svc_game:${normalize_game_code(game)}`,
    style: "primary",
  }));
  const rows = [];
  for (let i = 0; i < regions.length; i += 2)
    rows.push(regions.slice(i, i + 2));
  rows.push([{ text: "🔙 Back", callback_data: "svc_games", style: "danger" }]);
  return { inline_keyboard: rows };
}
function game_is_popular(game) {
  const n = normalize_game_name(game).toLowerCase();
  return (
    n.includes("pubg") || n.includes("free fire") || n.includes("freefire")
  );
}
function game_display_name(game) {
  return normalize_game_name(game);
}
function find_popular_game(games, kind) {
  const list = games || [];
  return list.find((g) => {
    const n = normalize_game_name(g).toLowerCase();
    const c = normalize_game_code(g).toLowerCase();
    if (kind === "pubg") return n.includes("pubg") || c.includes("pubg");
    return (
      n.includes("free fire") ||
      n.includes("freefire") ||
      c.includes("free_fire") ||
      c.includes("freefire")
    );
  });
}
function get_games_keyboard(games, page = 0, pageSize = 8) {
  const popular = [];
  const more = [];
  let hasFreeFire = false;
  let hasPUBG = false;
  for (const game of games || []) {
    const code = normalize_game_code(game);
    const name = normalize_game_name(game).toLowerCase();
    if (
      !code ||
      code.length > 50 ||
      code.toLowerCase().includes("telegram") ||
      name.includes("telegram")
    )
      continue;
    if (name.includes("pubg") || code.toLowerCase().includes("pubg")) {
      hasPUBG = true;
    } else if (
      name.includes("free fire") ||
      name.includes("freefire") ||
      code.toLowerCase().includes("free_fire") ||
      code.toLowerCase().includes("freefire")
    ) {
      hasFreeFire = true;
    } else {
      more.push(game);
    }
  }
  const rows = [];
  if (hasFreeFire || hasPUBG) {
    if (hasPUBG) {
      rows.push([
        {
          text: "🎮 PUBG Mobile",
          callback_data: "svc_game_popular:pubg",
          style: "primary",
        },
      ]);
    }
    if (hasFreeFire) {
      rows.push([
        {
          text: "🔥 Free Fire",
          callback_data: "freefire_regions",
          style: "primary",
        },
      ]);
    }
  }
  rows.push([
    { text: "➕ More Games", callback_data: "games_more:0", style: "primary" },
  ]);
  rows.push([
    { text: "🔙 Back", callback_data: "menu_service", style: "danger" },
  ]);
  return { inline_keyboard: rows };
}
function get_more_games_keyboard(games, page = 0, pageSize = 8) {
  const more = (games || []).filter((g) => {
    const code = normalize_game_code(g),
      name = normalize_game_name(g).toLowerCase();
    return (
      code &&
      code.length <= 50 &&
      !code.toLowerCase().includes("telegram") &&
      !name.includes("telegram") &&
      !game_is_popular(g)
    );
  });
  const totalPages = Math.max(1, Math.ceil(more.length / pageSize));
  page = Math.max(0, Math.min(page, totalPages - 1));
  const slice = more.slice(page * pageSize, page * pageSize + pageSize);
  const rows = [];
  for (const game of slice)
    rows.push([
      {
        text: game_display_name(game),
        callback_data: `svc_game:${normalize_game_code(game)}`,
        style: "primary",
      },
    ]);
  const nav = [];
  if (page > 0)
    nav.push({ text: "⬅️ Previous", callback_data: `games_more:${page - 1}` });
  if (page < totalPages - 1)
    nav.push({ text: "➡️ Next", callback_data: `games_more:${page + 1}` });
  nav.push({ text: "Search", callback_data: "games_search" });
  rows.push(nav);
  rows.push([
    { text: "Back to Games", callback_data: "svc_games", style: "danger" },
  ]);
  return { inline_keyboard: rows };
}
function normalize_game_name(game) {
  return String(
    game?.name || game?.title || game?.game_name || game?.code || "Game",
  ).trim();
}
function normalize_game_code(game) {
  return String(
    game?.code || game?.game_code || game?.slug || game?.name || "",
  ).trim();
} /* ---------- State Constants ---------- */
const STATE_NONE = "none";
const STATE_SELECT_PKG = "select_pkg";
const STATE_ENTER_UID = "enter_uid";
const STATE_CONFIRM = "confirm";
const STATE_PAYMENT_METHOD = "pay_method";
const STATE_PAYMENT_TXN_ID = "pay_txn_id";
const STATE_DEPOSIT_AMOUNT = "dep_amount";
const STATE_DEPOSIT_TRANSACTION_ID = "dep_txn_id";
const STATE_WITHDRAW_ACCOUNT = "wth_account";
const STATE_WITHDRAW_NICKNAME = "wth_nickname";
const STATE_WITHDRAW_AMOUNT = "wth_amount";
const STATE_WITHDRAW_CONFIRM = "wth_confirm";
const STATE_SERVICE_SELECT = "svc_select";
const STATE_PROFILE_REDEEM = "profile_redeem";
const STATE_ADMIN_MAIN = "admin_main";
const STATE_ADMIN_CREATE_CODE = "admin_create_code";
const STATE_ADMIN_DELETE_CODE = "admin_delete_code";
const STATE_ADMIN_BROADCAST = "admin_broadcast";
const STATE_ADMIN_REFERRAL_INPUT = "admin_refer_input";
const STATE_ADMIN_BAN = "admin_ban";
const STATE_ADMIN_UNBAN = "admin_unban";
const STATE_ADMIN_SETBALANCE = "admin_setbalance";
const STATE_ADMIN_SEARCH_BY_ID = "admin_search_by_id";
const STATE_ADMIN_GAME_MARKUP = "admin_game_markup";
const STATE_ADMIN_GAME_PRICE_INPUT = "admin_game_price_input";
const STATE_ADMIN_GLOBAL_MARKUP = "admin_global_markup";
const STATE_ADMIN_SET_PRICE_INPUT = "admin_set_price_input";
const STATE_ADMIN_STARS_MARKUP = "admin_stars_markup";
const STATE_ADMIN_PREMIUM_MARKUP = "admin_premium_markup";
const REFERRAL_REWARD = 0.5;
function get_deposit_keyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: "💸 Telebirr",
          callback_data: "dep_method:telebirr",
          style: "primary",
        },
              ],
      [{ text: "❌ Cancel", callback_data: "cancel_action", style: "danger" }],
    ],
  };
}
function get_confirmation_keyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: "Confirm Order",
          callback_data: "order_confirm",
          style: "success",
        },
      ],
      [{ text: "🔙 Back", callback_data: "order_back", style: "danger" }],
    ],
  };
}
function get_support_keyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: "Chat with Admin",
          url: `https://t.me/${ADMIN_USERNAME.replace("@", "")}`,
        },
      ],
      [
        {
          text: "Back to Main",
          callback_data: "back_to_main",
          style: "danger",
        },
      ],
    ],
  };
}
function get_admin_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "📊 Dashboard", callback_data: "admin_dashboard" }],
      [
        { text: "📥 Deposits", callback_data: "admin_deposits" },
        { text: "📤 Withdrawals", callback_data: "admin_withdrawals" },
      ],
      [
        { text: "🎟️ Promo Codes", callback_data: "admin_promo" },
        { text: "👥 Users", callback_data: "admin_user_manage" },
      ],
      [{ text: "Settings / Markup", callback_data: "admin_settings" }],
      [{ text: "Close", callback_data: "admin_close" }],
    ],
  };
}
function get_admin_promo_keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "Create Code", callback_data: "admin_promo_create" },
        { text: "📋 List Codes", callback_data: "admin_promo_list" },
      ],
      [{ text: "Delete Code", callback_data: "admin_promo_delete" }],
      [{ text: "🔙 Back", callback_data: "admin_back" }],
    ],
  };
}
function get_admin_settings_keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "Game Prices", callback_data: "admin_game_products" },
        { text: "Telegram Prices", callback_data: "admin_set_product_price" },
      ],
      [
        { text: "Set Stars Markup", callback_data: "admin_stars_markup" },
        { text: "Set Premium Markup", callback_data: "admin_premium_markup" },
      ],
      [
        {
          text: "Toggle Maintenance",
          callback_data: "admin_toggle_maintenance",
        },
        { text: "Toggle Reports", callback_data: "admin_toggle_reports" },
      ],
      [{ text: "🔙 Back", callback_data: "admin_back" }],
    ],
  };
}
function get_user_manage_keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "Broadcast", callback_data: "admin_broadcast" },
        { text: "Referral Lookup", callback_data: "admin_referral" },
      ],
      [
        { text: "Ban User", callback_data: "admin_ban" },
        { text: "Unban User", callback_data: "admin_unban" },
      ],
      [
        { text: "Set Balance", callback_data: "admin_set_balance" },
        { text: "Search by ID", callback_data: "admin_search_by_id" },
      ],
      [{ text: "🔙 Back", callback_data: "admin_back" }],
    ],
  };
}
function get_search_by_id_keyboard() {
  return {
    inline_keyboard: [
      [{ text: "Search Order", callback_data: "admin_search_id:order" }],
      [{ text: "Search Deposit", callback_data: "admin_search_id:deposit" }],
      [
        {
          text: "Search Withdrawal",
          callback_data: "admin_search_id:withdrawal",
        },
      ],
      [{ text: "🔙 Back", callback_data: "admin_user_manage" }],
    ],
  };
}
let userSessions = {};
function getUserSession(userId) {
  if (!userSessions[userId]) {
    userSessions[userId] = { state: STATE_NONE, data: {} };
  }
  return userSessions[userId];
}
function clearUserSession(userId) {
  if (userSessions[userId]) {
    userSessions[userId].state = STATE_NONE;
    userSessions[userId].data = {};
  }
}
let verify_attempts = {};
let pending_decline = {};
const IMG_TRANSACTION_ID =
  "https://img-mom.bitibiti.workers.dev/img/AgACAgQAAxkBAAIz_GqReSeH5xb_VFJkDyy89TWDKECCAAKfEGsbTqCJUJLAtuR8JLU8AQADAgADeQADPQQ";
class G2BulkAPIClient {
  constructor(base_url, api_key, cache_ttl) {
    this.base_url = base_url;
    this.api_key = api_key;
    this.cache_ttl = cache_ttl;
    this._cache = {};
  }
  async _request(endpoint, method = "GET", data = null) {
    const url = `${this.base_url}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.api_key}`,
      "X-API-Key": this.api_key,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    try {
      const response = await axios({
        method,
        url,
        headers,
        data,
        timeout: 30000,
      });
      return response.data;
    } catch (e) {
      logger.error(`API Error on ${endpoint}: ${e.message}`);
      if (e.response && e.response.data) {
        return e.response.data;
      }
      return { success: false, message: e.message };
    }
  }
  async get_games() {
    const now = Date.now();
    if (
      this._cache["games"] &&
      (now - this._cache["games"].ts) / 1000 < this.cache_ttl
    ) {
      return this._cache["games"].data;
    }
    const data = await this._request("/games");
    if (data && data.success) {
      this._cache["games"] = { ts: now, data: data };
    }
    return data;
  }
  async get_category_products(category_id) {
    const cache_key = `cat_prod_${category_id}`;
    const now = Date.now();
    if (
      this._cache[cache_key] &&
      (now - this._cache[cache_key].ts) / 1000 < this.cache_ttl
    ) {
      return this._cache[cache_key].data;
    }
    const data = await this._request(`/category/${category_id}`);
    if (data && data.success) {
      this._cache[cache_key] = { ts: now, data: data };
    }
    return data;
  }

  async get_game_catalogue(game_code) {
    const cache_key = `cat_${game_code}`;
    const now = Date.now();
    if (
      this._cache[cache_key] &&
      (now - this._cache[cache_key].ts) / 1000 < this.cache_ttl
    ) {
      return this._cache[cache_key].data;
    }
    const data = await this._request(`/games/${game_code}/catalogue`);
    if (data && data.success) {
      this._cache[cache_key] = { ts: now, data: data };
    }
    return data;
  }
  async check_player_id(
    game_code,
    player_id,
    server_id = null,
    charname = null,
  ) {
    const endpoint = `/games/checkPlayerId`;
    const payload = { game: game_code, user_id: String(player_id) };
    if (server_id) payload.server_id = String(server_id);
    if (charname) payload.charname = String(charname);
    logger.info(`Checking player ID: ${JSON.stringify(payload)}`);
    const res = await this._request(endpoint, "POST", payload);
    logger.info(`Player ID Check Result: ${JSON.stringify(res)}`);
    if (res && res.error === "Endpoint not found") return { success: true };
    return res;
  }
  async purchase_product(product_id, quantity = 1) {
    const payload = { quantity: quantity };
    const res = await this._request(
      `/products/${product_id}/purchase`,
      "POST",
      payload,
    );
    return res;
  }

  async place_order(
    game_code,
    package_id,
    player_id,
    server_id = null,
    user_ip = null,
  ) {
    let catalogue_name = package_id;
    const cat = await this.get_game_catalogue(game_code);
    if (cat && cat.catalogues) {
      const pkg = cat.catalogues.find(
        (p) => String(p.id || p.name) === String(package_id),
      );
      if (pkg && pkg.name) catalogue_name = pkg.name;
    }
    const payload = { catalogue_name, player_id: String(player_id) };
    if (server_id) payload.server_id = String(server_id);
    if (user_ip) payload.user_ip = String(user_ip);
    return await this._request(`/games/${game_code}/order`, "POST", payload);
  }
}
async function verify_payment(
  transaction_id,
  method = "telebirr",
  expected_amount = null,
) {
  try {
    const url = `${VERIFY_API_BASE_URL}/verify-telebirr`;
    const response = await axios.post(
      url,
      { reference: transaction_id, expected_name: EXPECTED_RECEIVER_NAME },
      {
        headers: {
          "x-api-key": VERIFY_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );
    logger.info("Verify API Success Data: " + JSON.stringify(response.data));
    const resData = response.data || {}; /* Check Credited Party Name */
    const creditedPartyName =
      resData.data && resData.data.creditedPartyName
        ? resData.data.creditedPartyName.toUpperCase().trim()
        : "";
    if (creditedPartyName !== "SINTAYEHU DEBELA ANGESA") {
      return {
        success: false,
        error:
          "Invalid recipient. Payment must be sent to SINTAYEHU DEBELA ANGESA.",
        server_error: false,
      };
    } /* Check 15 Minute limit */
    const paymentDateStr =
      resData.data && resData.data.paymentDate
        ? resData.data.paymentDate
        : null;
    if (paymentDateStr) {
      /* paymentDate format: "28-08-2026 09:27:19" */
      const parts = paymentDateStr.split(" ");
      if (parts.length === 2) {
        const dParts = parts[0].split("-");
        const tParts = parts[1].split(":");
        if (dParts.length === 3 && tParts.length === 3) {
          const pDateUTC = Date.UTC(
            parseInt(dParts[2]),
            parseInt(dParts[1]) - 1,
            parseInt(dParts[0]),
            parseInt(tParts[0]),
            parseInt(tParts[1]),
            parseInt(tParts[2]),
          );
          const actualUTC =
            pDateUTC - 3 * 60 * 60 * 1000; /* Telebirr is EAT (UTC+3) */
          const nowUTC = Date.now();
          if (nowUTC - actualUTC > 15 * 60 * 1000) {
            return {
              success: false,
              error:
                "Payment is older than 15 minutes and is strictly rejected.",
              server_error: false,
            };
          }
        }
      }
    } /* Extract amount */
    let amount = resData.amount;
    if (
      amount === undefined &&
      resData.data &&
      resData.data.amount !== undefined
    )
      amount = resData.data.amount;
    if (
      amount === undefined &&
      resData.transaction &&
      resData.transaction.amount !== undefined
    )
      amount = resData.transaction.amount;
    if (
      amount === undefined &&
      resData.data &&
      resData.data.settledAmount !== undefined
    ) {
      amount = String(resData.data.settledAmount).replace(/[^0-9.]/g, "");
    }
    if (amount !== undefined && !isNaN(parseFloat(amount))) {
      amount = parseFloat(amount);
      if (expected_amount && amount < expected_amount) {
        return {
          success: false,
          error: `Payment amount (${amount} ETB) is lower than expected (${expected_amount} ETB).`,
          server_error: false,
        };
      }
      return { success: true, data: { amount: amount } };
    } else {
      const msg =
        resData.message ||
        resData.error ||
        resData.msg ||
        resData.detail ||
        "Invalid transaction or amount not found in API response.";
      return { success: false, error: msg, server_error: false };
    }
  } catch (e) {
    let errMsg = "Could not verify automatically.";
    if (e.response && e.response.data) {
      const data = e.response.data;
      if (data.title && String(data.title).includes("502")) {
        errMsg =
          "Verification API is currently down (502 Bad Gateway). The API provider's server is offline.";
      } else if (data.message) errMsg = data.message;
      else if (data.error) errMsg = data.error;
      else if (data.detail) errMsg = data.detail;
      else if (typeof data === "string") {
        if (data.includes("502 Bad Gateway") || data.includes("502")) {
          errMsg = "Verification API is currently down (502 Bad Gateway).";
        } else if (!data.startsWith("<!DOCTYPE") && !data.startsWith("<html")) {
          errMsg = data.trim();
        }
      } else {
        try {
          errMsg = JSON.stringify(data);
        } catch (_) {}
      }
    } else if (e.message) {
      errMsg = e.message;
    }
    if (typeof errMsg === "string") {
      errMsg = errMsg
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
    const isServerError = !e.response || e.response.status >= 500;
    if (isServerError && errMsg === "Could not verify automatically.") {
      errMsg =
        "The verification server is temporarily unavailable. Please try again later.";
    }
    logger.error(`Verify API error for ${transaction_id}: ${errMsg}`);
    return { success: false, error: errMsg, server_error: isServerError };
  }
}
let config;
try {
  config = require('./firebase-applet-config.json');
} catch (e) {
  try {
    config = require('../../firebase-applet-config.json');
  } catch (e2) {
    console.error("Could not find firebase-applet-config.json in either ./ or ../../");
    process.exit(1);
  }
}
const firebaseApp = !getApps().length ? initializeApp(config) : getApp();
const _db = getFirestore(firebaseApp, config.firestoreDatabaseId || '(default)');

class FirestoreDatabase {
  constructor() {
    this.db = _db;
  }

  async load_settings(appSettingsObj) {
    const d = await getDoc(doc(this.db, 'settings', 'appSettings'));
    if (d.exists()) {
      Object.assign(appSettingsObj, d.data());
    } else {
      await setDoc(doc(this.db, 'settings', 'appSettings'), appSettingsObj);
    }
  }

  async save_setting(key, value, appSettingsObj) {
    appSettingsObj[key] = value;
    await setDoc(doc(this.db, 'settings', 'appSettings'), { [key]: value }, { merge: true });
  }

  async register_user(userId, username, first_name, last_name) {
    const userRef = doc(this.db, 'users', String(userId));
    const d = await getDoc(userRef);
    if (!d.exists()) {
      await setDoc(userRef, {
        id: String(userId),
        username: username || '',
        first_name: first_name || '',
        last_name: last_name || '',
        balance: 0,
        referral_balance: 0,
        is_banned: 0,
        registered_at: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  async is_banned(userId) {
    const d = await getDoc(doc(this.db, 'users', String(userId)));
    return d.exists() && d.data().is_banned === 1;
  }

  async ban_user(userId) {
    await setDoc(doc(this.db, 'users', String(userId)), { is_banned: 1 }, { merge: true });
    return true;
  }

  async unban_user(userId) {
    await setDoc(doc(this.db, 'users', String(userId)), { is_banned: 0 }, { merge: true });
    return true;
  }

  async get_user_profile(userId) {
    const d = await getDoc(doc(this.db, 'users', String(userId)));
    return d.exists() ? d.data() : null;
  }

  async get_all_users() {
    const snap = await getDocs(collection(this.db, 'users'));
    return snap.docs.map(d => d.data());
  }

  async update_balance(userId, amount) {
    const ref = doc(this.db, 'users', String(userId));
    await runTransaction(this.db, async (t) => {
      const d = await t.get(ref);
      if (d.exists()) {
        const newBal = (d.data().balance || 0) + amount;
        t.update(ref, { balance: newBal });
      }
    });
  }

  async set_balance(userId, amount) {
    await setDoc(doc(this.db, 'users', String(userId)), { balance: amount }, { merge: true });
  }

  async get_username(userId) {
    const d = await getDoc(doc(this.db, 'users', String(userId)));
    if (d.exists()) {
      const data = d.data();
      return data.username || data.first_name || String(userId);
    }
    return String(userId);
  }

  async create_promo_code(code, amount, max_uses) {
    await setDoc(doc(this.db, 'admin_codes', code), {
      code,
      reward_amount: amount,
      max_uses,
      uses: 0,
      created_at: new Date().toISOString()
    });
    return true;
  }

  async list_promo_codes() {
    const snap = await getDocs(collection(this.db, 'admin_codes'));
    return snap.docs.map(d => d.data());
  }

  async delete_promo_code(code) {
    await deleteDoc(doc(this.db, 'admin_codes', code));
    return true;
  }

  async use_promo_code(code, userId) {
    const ref = doc(this.db, 'admin_codes', code);
    const historyRef = doc(this.db, 'users', String(userId), 'promo_history', code);
    
    return await runTransaction(this.db, async (t) => {
      const histDoc = await t.get(historyRef);
      if (histDoc.exists()) return "already_used";
      
      const d = await t.get(ref);
      if (!d.exists()) return "invalid";
      
      const data = d.data();
      if (data.uses >= data.max_uses) return "exhausted";
      
      t.update(ref, { uses: increment(1) });
      t.set(historyRef, { used_at: new Date().toISOString() });
      
      const userRef = doc(this.db, 'users', String(userId));
      t.set(userRef, { balance: increment(data.reward_amount) }, { merge: true });
      
      return "success";
    });
  }

  async create_referral(referrer_id, referred_id, reward) {
    const ref = doc(this.db, 'users', String(referrer_id));
    const newRef = doc(this.db, 'referrals', String(referred_id));
    
    const d = await getDoc(newRef);
    if (!d.exists()) {
      await setDoc(newRef, {
        referrer_id: String(referrer_id),
        referred_id: String(referred_id),
        reward,
        created_at: new Date().toISOString()
      });
      await setDoc(ref, {
        referral_balance: increment(reward)
      }, { merge: true });
    }
  }

  async get_referral_stats(userId) {
    const q = query(collection(this.db, 'referrals'), where('referrer_id', '==', String(userId)));
    const snap = await getDocs(q);
    let total_earned = 0;
    snap.docs.forEach(d => total_earned += (d.data().reward || 0));
    return { count: snap.size, total_earned };
  }

  async get_referral_list(userId) {
    const q = query(collection(this.db, 'referrals'), where('referrer_id', '==', String(userId)));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ referred_user_id: d.data().referred_id, reward: d.data().reward }));
  }

  async can_place_order(userId, max_daily_orders) {
    const today = new Date().toISOString().slice(0, 10);
    const q = query(collection(this.db, 'orders'), where('telegram_id', '==', String(userId)));
    const snap = await getDocs(q);
    const count = snap.docs.filter(d => d.data().created_at?.startsWith(today)).length;
    return count < max_daily_orders;
  }

  async get_next_numeric_id(collectionName) {
    const ref = doc(this.db, 'counters', collectionName);
    return await runTransaction(this.db, async (t) => {
      const d = await t.get(ref);
      let nextId = 1;
      if (d.exists()) nextId = (d.data().lastId || 0) + 1;
      t.set(ref, { lastId: nextId });
      return nextId;
    });
  }

  async create_order(userId, game, package_name, api_price, charged_price, status, reference) {
    const numId = await this.get_next_numeric_id('orders');
    const orderId = `ORD-${100000 + numId}`;
    await setDoc(doc(this.db, 'orders', orderId), {
      id: orderId,
      order_id: orderId,
      numeric_id: numId,
      telegram_id: String(userId),
      game,
      package_name,
      api_price,
      charged_price,
      status,
      reference: reference || "",
      created_at: new Date().toISOString()
    });
    return orderId;
  }

  async get_user_orders(userId, limitCount = 5) {
    const q = query(
      collection(this.db, 'orders'),
      where('telegram_id', '==', String(userId)),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return { ...data, order_id: data.id };
    });
  }

  async get_order_by_id(order_id) {
    const d = await getDoc(doc(this.db, 'orders', order_id));
    if (d.exists()) {
        const data = d.data();
        return { ...data, order_id: data.id };
    }
    return null;
  }

  async get_order_by_numeric_id(numeric_id) {
    const q = query(collection(this.db, 'orders'), where('numeric_id', '==', numeric_id), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
        const data = snap.docs[0].data();
        return { ...data, order_id: data.id };
    }
    return null;
  }

  async create_deposit(user_id, method, amount, currency, txn_id) {
    if (amount === undefined) throw new Error('Cannot create deposit with undefined amount');
    const numId = await this.get_next_numeric_id('deposits');
    const id = String(numId);
    await setDoc(doc(this.db, 'deposits', id), {
      id,
      numeric_id: numId,
      user_id: String(user_id),
      method,
      amount,
      currency,
      transaction_id: txn_id,
      status: "pending",
      admin_note: "",
      created_at: new Date().toISOString()
    });
    return id;
  }

  async get_deposit_by_id(dep_id) {
    const d = await getDoc(doc(this.db, 'deposits', String(dep_id)));
    return d.exists() ? d.data() : null;
  }

  async approve_deposit(deposit_id, note = "") {
    const ref = doc(this.db, 'deposits', String(deposit_id));
    return await runTransaction(this.db, async (t) => {
      const d = await t.get(ref);
      if (d.exists() && d.data().status === "pending") {
        t.update(ref, { status: "approved", admin_note: note });
        const userRef = doc(this.db, 'users', d.data().user_id);
        t.set(userRef, { balance: increment(d.data().amount) }, { merge: true });
        return true;
      }
      return false;
    });
  }

  async reject_deposit(deposit_id, note) {
    const ref = doc(this.db, 'deposits', String(deposit_id));
    return await runTransaction(this.db, async (t) => {
      const d = await t.get(ref);
      if (d.exists() && d.data().status === "pending") {
        t.update(ref, { status: "rejected", admin_note: note });
        return true;
      }
      return false;
    });
  }

  async get_pending_deposits() {
    const q = query(collection(this.db, 'deposits'), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }

  async is_transaction_used(txn_id) {
    const q = query(collection(this.db, 'transactions'), where('transaction_id', '==', String(txn_id)), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async record_transaction_use(txn_id, user_id, amount) {
    await setDoc(doc(this.db, 'transactions', String(txn_id)), {
      transaction_id: String(txn_id),
      user_id: String(user_id),
      amount,
      used_at: new Date().toISOString()
    });
  }

  async create_withdrawal(user_id, method, amount, currency, account, nickname, fee) {
    const numId = await this.get_next_numeric_id('withdrawals');
    const id = String(1000 + numId);
    await setDoc(doc(this.db, 'withdrawals', id), {
      id,
      numeric_id: numId,
      user_id: String(user_id),
      method,
      amount,
      currency,
      account,
      nickname,
      fee,
      status: "pending",
      admin_note: "",
      approved_by: "",
      rejected_by: "",
      created_at: new Date().toISOString()
    });
    await this.update_balance(user_id, -(amount + fee));
    return id;
  }

  async get_withdrawal_by_id(wth_id) {
    const d = await getDoc(doc(this.db, 'withdrawals', String(wth_id)));
    return d.exists() ? d.data() : null;
  }

  async approve_withdrawal(withdrawal_id, note, admin_id) {
    const ref = doc(this.db, 'withdrawals', String(withdrawal_id));
    return await runTransaction(this.db, async (t) => {
      const d = await t.get(ref);
      if (d.exists() && d.data().status === "pending") {
        t.update(ref, { status: "approved", admin_note: note, approved_by: String(admin_id) });
        return true;
      }
      return false;
    });
  }

  async reject_withdrawal(withdrawal_id, note, admin_id) {
    const ref = doc(this.db, 'withdrawals', String(withdrawal_id));
    return await runTransaction(this.db, async (t) => {
      const d = await t.get(ref);
      if (d.exists() && d.data().status === "pending") {
        t.update(ref, { status: "rejected", admin_note: note, rejected_by: String(admin_id) });
        const userRef = doc(this.db, 'users', d.data().user_id);
        t.set(userRef, { balance: increment(d.data().amount + d.data().fee) }, { merge: true });
        return true;
      }
      return false;
    });
  }

  async get_pending_withdrawals() {
    const q = query(collection(this.db, 'withdrawals'), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }

  async get_dashboard_stats() {
    let stats = {
      total_users: 0,
      total_orders: 0,
      total_deposits: 0,
      total_deposit_amount: 0,
      pending_deposits: 0,
      total_withdrawals: 0,
      total_withdrawal_amount: 0,
      pending_withdrawals: 0,
      revenue_today: 0
    };
    try {
      const usersSnap = await getCountFromServer(collection(this.db, 'users'));
      stats.total_users = usersSnap.data().count;

      const ordersSnap = await getCountFromServer(collection(this.db, 'orders'));
      stats.total_orders = ordersSnap.data().count;

      const today = new Date().toISOString().slice(0, 10);
      const qOrders = query(collection(this.db, 'orders'), where('status', '==', 'completed'));
      const todayOrders = await getDocs(qOrders);
      todayOrders.docs.forEach(d => {
          const o = d.data();
          if (o.created_at && o.created_at.startsWith(today)) {
              stats.revenue_today += (o.charged_price || 0) - (o.api_price || 0);
          }
      });

      const depsSnap = await getDocs(collection(this.db, 'deposits'));
      stats.total_deposits = depsSnap.size;
      depsSnap.docs.forEach(d => {
        const dep = d.data();
        if (dep.status === 'approved') stats.total_deposit_amount += (dep.amount || 0);
        if (dep.status === 'pending') stats.pending_deposits++;
      });

      const wthSnap = await getDocs(collection(this.db, 'withdrawals'));
      stats.total_withdrawals = wthSnap.size;
      wthSnap.docs.forEach(d => {
        const w = d.data();
        if (w.status === 'approved') stats.total_withdrawal_amount += (w.amount || 0);
        if (w.status === 'pending') stats.pending_withdrawals++;
      });

    } catch (e) {
        console.error("Dashboard stats error:", e);
    }
    return stats;
  }

  async get_game_markup(game_code) {
    const d = await getDoc(doc(this.db, 'game_overrides', String(game_code)));
    if (d.exists() && d.data().markup_percentage !== undefined) {
        return d.data().markup_percentage;
    }
    return global.appSettings ? global.appSettings.DEFAULT_MARKUP_PERCENT : 15.0;
  }

  async set_game_markup(game_code, markup_percent) {
    await setDoc(doc(this.db, 'game_overrides', String(game_code)), { markup_percentage: markup_percent });
  }

  async set_game_product_price_override(game_code, product_id, price) {
    const id = `${game_code}__${product_id}`;
    if (price === null) {
      await deleteDoc(doc(this.db, 'product_overrides', id));
    } else {
      await setDoc(doc(this.db, 'product_overrides', id), {
        id, game_code, product_id, price_override: price, type: "game"
      });
    }
  }

  async get_all_product_overrides() {
    const snap = await getDocs(collection(this.db, 'product_overrides'));
    return snap.docs.map(d => d.data());
  }

  async get_product_price_override(product_id) {
    const q = query(collection(this.db, 'product_overrides'), where('product_id', '==', String(product_id)), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
        return snap.docs[0].data().price_override;
    }
    return null;
  }

  async set_product_price_override(product_id, price, type = "stars") {
    const id = String(product_id);
    if (price === null) {
      await deleteDoc(doc(this.db, 'product_overrides', id));
    } else {
      await setDoc(doc(this.db, 'product_overrides', id), {
        id, product_id: id, price_override: price, type
      });
    }
  }
}

let appSettings = {
  DEFAULT_MARKUP_PERCENT: 15.0,
  TELEGRAM_STARS_MARKUP: 10.0,
  TELEGRAM_PREMIUM_MARKUP: 50.0,
  MAINTENANCE_MODE: false,
  MAX_DAILY_ORDERS: 5,
  REPORT_EVENTS: true,
  MAX_DEPOSIT_LIMIT: 5000.0,
  MAX_WITHDRAW_LIMIT: 5000.0,
  WITHDRAWAL_FEE_PERCENT: 0.05,
};
class CatalogService {
  constructor(api_client, db) {
    this.api_client = api_client;
    this.db = db;
    this._telegram_cache = null;
    this._telegram_ts = 0;
  }
  clear_cache() {
    this._telegram_cache = null;
    this._telegram_ts = 0;
  }
  async get_telegram_catalogue(force = false) {
    const now = Date.now();
    if (
      !force &&
      this._telegram_cache &&
      (now - this._telegram_ts) / 1000 < CACHE_TTL
    ) {
      return this._telegram_cache;
    }
    const games_res = await this.api_client.get_games();
    let telegram_code = null;
    const games =
      games_res && games_res.success ? games_res.games || games_res.data : [];
    if (games) {
      const tg = games.find(
        (g) =>
          (g.name && g.name.toLowerCase().includes("telegram")) ||
          (g.code && g.code.toLowerCase().includes("telegram")),
      );
      if (tg) telegram_code = tg.code;
    }
    if (!telegram_code) telegram_code = "Telegram";
    const cat_res = await this.api_client.get_game_catalogue(telegram_code);
    let packages = [];
    if (cat_res && cat_res.success)
      packages = cat_res.catalogues || cat_res.data || [];
    const overrides = new Map();
    for (const ov of await this.db.get_all_product_overrides()) {
      if (ov.price_override !== undefined && ov.price_override !== null) {
        overrides.set(
          String(ov.product_id || ov.id),
          parseFloat(ov.price_override),
        );
      }
    }
    const mapped = packages.map((pkg) => {
      const product_id = pkg.id || pkg.code || pkg.name;
      const override = overrides.get(String(product_id));
      return { ...pkg, _game_code: telegram_code, _override_price: override };
    });
    this._telegram_cache = mapped;
    this._telegram_ts = now;
    return mapped;
  }
  async get_telegram_stars_packages() {
    const packages = await this.get_telegram_catalogue();
    return packages.filter((p) => {
      const n = (p.name || p.title || p.catalogue_name || "").toLowerCase();
      return n.includes("star") || n.includes("stars");
    });
  }
  async get_telegram_premium_plans() {
    const packages = await this.get_telegram_catalogue();
    return packages.filter((p) => {
      const n = (p.name || p.title || p.catalogue_name || "").toLowerCase();
      return n.includes("premium") || n.includes("month") || n.includes("year");
    });
  }
  async get_telegram_stars_markup() {
    return appSettings.TELEGRAM_STARS_MARKUP;
  }
  async get_telegram_premium_markup() {
    return appSettings.TELEGRAM_PREMIUM_MARKUP;
  }
}
async function clear_last_photo(ctx, session) {
  if (session.data.last_photo_msg_id) {
    try {
      await ctx.telegram.deleteMessage(
        ctx.chat.id,
        session.data.last_photo_msg_id,
      );
    } catch (e) {}
    session.data.last_photo_msg_id = null;
  }
}
async function sendOrEditPhoto(ctx, photoUrl, caption, extra) {
  const session = getUserSession(ctx.from.id);
  const fullExtra = { parse_mode: "HTML", ...extra };
  if (
    ctx.callbackQuery &&
    ctx.callbackQuery.message &&
    ctx.callbackQuery.message.photo
  ) {
    try {
      if (fullExtra.reply_markup && fullExtra.reply_markup.keyboard) {
        fullExtra.reply_markup = { inline_keyboard: [] };
      }
      await ctx.editMessageMedia(
        {
          type: "photo",
          media: photoUrl,
          caption: caption,
          parse_mode: "HTML",
        },
        fullExtra,
      );
      session.data.last_photo_msg_id = ctx.callbackQuery.message.message_id;
      return;
    } catch (e) {}
  }
  await clear_last_photo(ctx, session);
  try {
    const msg = await ctx.replyWithPhoto(photoUrl, {
      caption,
      parse_mode: "HTML",
      ...extra,
    });
    session.data.last_photo_msg_id = msg.message_id;
  } catch (e) {
    await sendNewMessage(ctx, caption, extra);
  }
}
async function sendNewMessage(ctx, text, extra = {}) {
  const session = getUserSession(ctx.from.id);
  await clear_last_photo(ctx, session);
  try {
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      await ctx.deleteMessage().catch(() => {});
    }
  } catch (e) {}
  return await ctx.reply(text, { parse_mode: "HTML", ...extra });
}
async function sendOrEdit(ctx, text, extra = {}) {
  const session = getUserSession(ctx.from.id);
  const fullExtra = { parse_mode: "HTML", ...extra };
  if (
    ctx.callbackQuery &&
    ctx.callbackQuery.message &&
    !ctx.callbackQuery.message.photo
  ) {
    try {
      if (fullExtra.reply_markup && fullExtra.reply_markup.keyboard) {
        fullExtra.reply_markup = { inline_keyboard: [] };
      }
      return await ctx.editMessageText(text, fullExtra);
    } catch (e) {
      if (e.description && e.description.includes("message is not modified"))
        return;
    }
  }
  return await sendNewMessage(ctx, text, extra);
}
async function maintenance_check(ctx) {
  if (appSettings.MAINTENANCE_MODE && !ADMIN_CHAT_IDS.includes(ctx.from.id)) {
    await sendNewMessage(
      ctx,
      `${EMOJI_WARNING} <b>Maintenance Mode</b>\n\nThe bot is currently undergoing maintenance. Please try again later.`,
    );
    return false;
  }
  return true;
}
async function check_channel_membership(ctx) {
  if (!UPDATES_CHANNEL) return true;
  try {
    const member = await ctx.telegram.getChatMember(
      UPDATES_CHANNEL,
      ctx.from.id,
    );
    if (["member", "administrator", "creator"].includes(member.status))
      return true;
  } catch (e) {}
  const kb = {
    inline_keyboard: [
      [
        {
          text: "Join Channel",
          url: `https://t.me/${UPDATES_CHANNEL.replace("@", "")}`,
        },
      ],
      [{ text: "I have joined", callback_data: "back_to_main" }],
    ],
  };
  await sendNewMessage(
    ctx,
    `${EMOJI_WARNING} <b>Channel Required</b>\n\nYou must join our updates channel to use this bot.`,
    { reply_markup: kb },
  );
  return false;
}
async function register_user_implicit(ctx, db, bot) {
  const user = ctx.from;
  const is_new = await db.register_user(
    user.id,
    user.username,
    user.first_name,
    user.last_name,
  );
  if (is_new) {
    const uMention = `<a href="tg://user?id=${user.id}">${user.first_name || "User"}</a>`;
    await report_event(
      bot,
      `${EMOJI_USER} <b>New User Registered</b>\n${uMention} (ID: <code>${user.id}</code>)`,
    );
  }
  return is_new;
}
async function report_event(bot, text) {
  if (!appSettings.REPORT_EVENTS) return;
  try {
    await bot.telegram.sendMessage(REPORT_CHANNEL_ID, text, {
      parse_mode: "HTML",
    });
  } catch (e) {}
}
async function place_order_flow(
  ctx,
  session,
  db,
  api_client,
  bot,
  method,
  reference = null,
  verified_amount = null,
) {
  const user = ctx.from;
  const package_id = session.data.selected_pkg_id;
  const game_code =
    session.data.game_code || session.data.telegram_game_code || "Telegram";
  const player_id = session.data.player_id;
  const server_id = session.data.server_id || null;
  const charged_price = session.data.charged_price;
  const api_price = session.data.api_price;
  if (method === "wallet") await db.update_balance(user.id, -charged_price);
  else if (verified_amount > charged_price)
    await db.update_balance(user.id, verified_amount - charged_price);
  try {
    let api_res;
    if (session.data.flow_type === "voucher") {
      api_res = await api_client.purchase_product(package_id, 1);
    } else {
      api_res = await api_client.place_order(
        game_code,
        package_id,
        player_id,
        server_id,
        "127.0.0.1",
      );
    }
    const success =
      api_res &&
      (api_res.success === true ||
        api_res.success === "true" ||
        api_res.status === "completed" ||
        api_res.status === "processing" ||
        api_res.message === "success" ||
        api_res.status === 200 ||
        api_res.code === 200);
    const status = success ? "completed" : "failed";
    const orderId = await db.create_order(
      user.id,
      session.data.game_name,
      session.data.package_display_name || session.data.package_name,
      api_price,
      charged_price,
      status,
      reference,
    );
    if (success) {
      let extra = "";
      if (
        api_res &&
        Array.isArray(api_res.delivery_items) &&
        api_res.delivery_items.length > 0
      ) {
        extra =
          "\n\n<b>Your Codes:</b>\n<code>" +
          api_res.delivery_items.join("\n") +
          "</code>";
      }
      await sendNewMessage(
        ctx,
        `${EMOJI_SUCCESS} <b>Order Successful!</b>\n\nYour order for <b>${session.data.package_display_name || session.data.package_name}</b> has been placed.\n Order ID: <code>${orderId}</code>${extra}`,
        { reply_markup: get_main_keyboard() },
      );
      await report_event(
        bot,
        `${EMOJI_SUCCESS} <b>New Order Placed</b>\n` +
          `${EMOJI_USER} User: <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n` +
          `${EMOJI_GAME} Product: ${session.data.game_name}\n` +
          `${EMOJI_ORDER} Package: ${session.data.package_display_name || session.data.package_name}\n` +
          `${EMOJI_USER} Target: <code>${player_id}</code>\n` +
          `${EMOJI_MONEY} Paid: ${Math.floor(charged_price)} ETB (${method})\n` +
          ` Order ID: <code>${orderId}</code>`,
      );
      try {
        await bot.telegram.sendMessage(
          PROOF_CHANNEL_ID,
          `${EMOJI_SUCCESS} <b>Order Delivered</b>\n` +
            `${EMOJI_GAME} Game: <b>${session.data.game_name}</b>\n` +
            `${EMOJI_ORDER} Item: <b>${session.data.package_display_name || session.data.package_name}</b>\n` +
            `${EMOJI_USER} User: ${user.first_name || "User"}\n` +
            ` Order ID: <code>${orderId}</code>\n` +
            `${EMOJI_CALENDAR} ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "Bot", url: `https://t.me/${bot.botInfo.username}` }],
              ],
            },
          },
        );
      } catch (_) {}
    } else {
      if (method === "wallet") await db.update_balance(user.id, charged_price);
      else
        await db.update_balance(
          user.id,
          charged_price,
        ); /* Refund the full charged price */
      const err_msg =
        api_res && api_res.message
          ? api_res.message
          : "Unknown error from provider.";
      await sendNewMessage(
        ctx,
        `${EMOJI_CROSS} <b>Order Failed</b>\n\nProvider returned an error: ${err_msg}\nYour funds have been refunded to your wallet.`,
        { reply_markup: get_main_keyboard() },
      );
      await report_event(
        bot,
        `${EMOJI_FAIL} <b>Order Failed</b>\n` +
          `${EMOJI_USER} User: <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n` +
          `${EMOJI_GAME} Product: ${session.data.game_name}\n` +
          `${EMOJI_ORDER} Package: ${session.data.package_display_name || session.data.package_name}\n` +
          `${EMOJI_CROSS} Error: ${err_msg}`,
      );
    }
  } catch (e) {
    if (method === "wallet") await db.update_balance(user.id, charged_price);
    else await db.update_balance(user.id, charged_price);
    await sendNewMessage(
      ctx,
      `${EMOJI_CROSS} <b>System Error</b>\n\nFailed to place order: ${e.message}\nFunds have been refunded to your wallet.`,
      { reply_markup: get_main_keyboard() },
    );
  }
  clearUserSession(user.id);
}

/* ---------- Main Function ---------- */

const ADMIN_CHAT_IDS = ADMIN_CHAT_ID;
async function main(app) {
  const db = new FirestoreDatabase();
  await db.load_settings(appSettings);
  logger.info(" Initial settings loaded from Firestore.");
  const api_client = new G2BulkAPIClient(
    G2BULK_BASE_URL,
    G2BULK_API_KEY,
    CACHE_TTL,
  );
  const catalog_service = new CatalogService(api_client, db);
  const bot = new Telegraf(BOT_TOKEN); /* Background settings sync */
  setInterval(async () => {
    try {
      await db.load_settings(appSettings);
    } catch (e) {
      logger.error(`Failed to sync settings: ${e.message}`);
    }
  }, 5000);
  /* ---------- Register all commands and handlers ---------- */
  bot.command("cancel", async (ctx) => {
    const userId = ctx.from.id;
    clearUserSession(userId);
    await sendMainMenu(ctx, db);
  });
  bot.hears(/^(cancel|❌ cancel|🔙 back)/i, async (ctx) => {
    const userId = ctx.from.id;
    clearUserSession(userId);
    await sendMainMenu(ctx, db);
  });

  bot.command("start", async (ctx) => {
    const user = ctx.from;
    if (!user) return;
    if (!(await maintenance_check(ctx))) return;
    if (!(await check_channel_membership(ctx))) return;
    if (await db.is_banned(user.id)) {
      await sendNewMessage(ctx, `${EMOJI_CROSS} You are banned.`);
      return;
    }
    await register_user_implicit(ctx, db, bot);
    const parts = (ctx.message.text || "").split(" ");
    if (parts.length > 1 && parts[1].startsWith("ref")) {
      try {
        const referrer_id = parseInt(parts[1].slice(3), 10);
        if (referrer_id !== user.id) {
          const success = await db.create_referral(
            referrer_id,
            user.id,
            REFERRAL_REWARD,
          );
          if (success) {
            const userMention = `<a href="tg://user?id=${user.id}">${user.first_name || "User"}</a>`;
            try {
              await bot.telegram.sendMessage(
                referrer_id,
                `${EMOJI_USER} ${userMention} joined using your referral link! You earned ${REFERRAL_REWARD} ETB!`,
                { parse_mode: "HTML" },
              );
            } catch (_) {}
          }
        }
      } catch (_) {}
    }
    await sendMainMenu(ctx, db);
  });
  bot.command("admin", async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) {
      await sendNewMessage(ctx, `${EMOJI_CROSS} Unauthorized.`);
      return;
    }
    const session = getUserSession(ctx.from.id);
    session.state = STATE_ADMIN_MAIN;
    await sendNewMessage(ctx, `${EMOJI_SUCCESS} Access granted.`, {
      reply_markup: get_admin_keyboard(),
    });
  });
  bot.command("broadcast", async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const text = ctx.message.text.replace(/^\/broadcast\s*/, "").trim();
    if (!text) {
      await sendNewMessage(ctx, "Usage: /broadcast <message>");
      return;
    }
    const users = await db.get_all_users();
    let success = 0;
    for (const uid of users) {
      try {
        await bot.telegram.sendMessage(uid, text);
        success++;
      } catch (_) {}
    }
    await sendNewMessage(
      ctx,
      `${EMOJI_SUCCESS} Broadcast sent to ${success}/${users.length} users.`,
    );
  });
  bot.command("gencode", async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const args = ctx.message.text.trim().split(/\s+/).slice(1);
    if (!args.length) {
      await sendNewMessage(ctx, "Usage: /gencode <amount> [max_uses] [code]");
      return;
    }
    const amount = parseFloat(args[0]);
    if (isNaN(amount)) {
      await sendNewMessage(ctx, `${EMOJI_CROSS} Invalid amount.`);
      return;
    }
    const max_uses = args.length > 1 ? parseInt(args[1], 10) : 1;
    const code =
      args.length > 2
        ? args[2].toUpperCase()
        : uuidv4().slice(0, 8).toUpperCase();
    const success = await db.create_promo_code(code, amount, max_uses);
    if (success)
      await sendNewMessage(
        ctx,
        `${EMOJI_SUCCESS} Code <b>${code}</b> created for ${Math.floor(amount)} ETB, uses: ${max_uses}`,
      );
    else await sendNewMessage(ctx, `${EMOJI_CROSS} Code already exists.`);
  });
  bot.command("listcodes", async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const codes = await db.list_promo_codes();
    if (!codes.length) {
      await sendNewMessage(ctx, `${EMOJI_INFO} No promo codes found.`);
      return;
    }
    let msg = `${EMOJI_MONEY} <b>Active Promo Codes</b>\n\n`;
    for (const c of codes)
      msg += `<code>${c.code}</code>: ${Math.floor(c.amount)} ETB | ${c.used_count}/${c.max_uses} used\n`;
    await sendNewMessage(ctx, msg);
  });
  bot.command("delcode", async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const args = ctx.message.text.trim().split(/\s+/).slice(1);
    if (!args.length) {
      await sendNewMessage(ctx, "Usage: /delcode <code>");
      return;
    }
    const code = args[0].toUpperCase();
    await db.delete_promo_code(code);
    await sendNewMessage(ctx, `${EMOJI_SUCCESS} Code <b>${code}</b> deleted.`);
  });
  bot.command("refer", async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const args = ctx.message.text.trim().split(/\s+/).slice(1);
    if (!args.length) {
      await sendNewMessage(ctx, "Usage: /refer <user_id>");
      return;
    }
    const user_id = parseInt(args[0], 10);
    if (isNaN(user_id)) {
      await sendNewMessage(ctx, `${EMOJI_CROSS} Invalid ID.`);
      return;
    }
    const [total, rewarded, total_reward] =
      await db.get_referral_stats(user_id);
    const referrals = await db.get_referral_list(user_id);
    let msg = `${EMOJI_INFO} <b>Referral Stats for ID <code>${user_id}</code></b>\n\n`;
    msg += `${EMOJI_USER} Total invited: <b>${total}</b>\n`;
    msg += `${EMOJI_MONEY} Rewarded: <b>${rewarded}</b>\n`;
    msg += `${EMOJI_MONEY} Total earned: <b>${Math.floor(total_reward)} ETB</b>\n\n`;
    if (referrals.length) {
      msg += "<b>Recent invites:</b>\n";
      for (const r of referrals) {
        const status_icon = r.reward_given ? EMOJI_SUCCESS : EMOJI_CLOCK;
        msg += ` ${status_icon} <code>${r.referred_id}</code> (${r.status}) – ${(r.created_at || "").slice(0, 10)}\n`;
      }
    } else {
      msg += "<i>No invites yet.</i>";
    }
    await sendNewMessage(ctx, msg);
  });
  bot.command("listgames", async (ctx) => {
    if (!ADMIN_CHAT_IDS.includes(ctx.from.id)) return;
    const games_res = await api_client.get_games();
    const games = (games_res && (games_res.games || games_res.data)) || [];
    if (!games.length) {
      await sendNewMessage(ctx, "No games found.");
      return;
    }
    let msg = `${EMOJI_GAME} <b>Game Codes</b>\n\n`;
    for (const g of games) msg += `<code>${g.code}</code> – ${g.name}\n`;
    await sendNewMessage(ctx, msg);
  });
  /* ---------- Callback Query Handler ---------- */
  bot.on("callback_query", async (ctx) => {
    try {
      const data = ctx.callbackQuery.data;
      const userId = ctx.from.id;
      const session = getUserSession(userId);
      await ctx.answerCbQuery().catch(() => {});
      if (await db.is_banned(userId)) {
        await sendNewMessage(ctx, `${EMOJI_CROSS} You are banned.`);
        return;
      }
      if (data === "cancel_action") {
        await clear_last_photo(ctx, session);
        clearUserSession(userId);
        delete verify_attempts[userId];
        if (ctx.callbackQuery) {
          await ctx.answerCbQuery("Action cancelled.").catch(() => {});
        }
        await sendMainMenu(ctx, db);
        return;
      }
      if (data === "back_to_main") {
        clearUserSession(userId);
        await sendMainMenu(ctx, db, ctx.callbackQuery.message.message_id);
        return;
      }
      /* ---------- Profile ---------- */
      if (data === "menu_profile") {
        const user_data = await db.get_user_profile(userId);
        if (!user_data || !Object.keys(user_data).length) {
          await sendNewMessage(ctx, `${EMOJI_WARNING} Profile sync delayed.`, {
            reply_markup: get_main_keyboard(),
          });
          return;
        }
        const reg_date = (user_data.registered_at || "").slice(0, 10);
        const profile_text =
          `${EMOJI_PROFILE} <b>User Profile</b>\n\n` +
          `${EMOJI_USER} <b>Name:</b> ${user_data.first_name || "N/A"}\n` +
          `${EMOJI_USER} <b>Username:</b> @${user_data.username || "N/A"}\n` +
          ` <b>ID:</b> <code>${user_data.telegram_id || userId}</code>\n` +
          `${EMOJI_MONEY} <b>Balance:</b> ${Math.floor(user_data.balance)} ETB\n` +
          `${EMOJI_MONEY} <b>Referral Balance:</b> ${Math.floor(user_data.referral_balance)} ETB\n` +
          `${EMOJI_CALENDAR} <b>Registered:</b> ${reg_date}\n` +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          `${EMOJI_ORDER} <b>Completed Orders:</b> ${user_data.total_orders}\n` +
          `${EMOJI_MONEY} <b>Total Spent:</b> ${Math.floor(user_data.total_spent)} ETB\n`;
        await sendNewMessage(ctx, profile_text, {
          reply_markup: get_profile_keyboard(),
        });
        return;
      }
      if (data === "menu_orders") {
        const orders = await db.get_user_orders(userId, 5);
        let text;
        if (!orders.length) text = `${EMOJI_ORDER} <b>No orders yet.</b>`;
        else {
          text = `${EMOJI_ORDER} <b>Last 5 Orders:</b>\n\n`;
          for (const order of orders) {
            text +=
              `${EMOJI_ORDER} <b>Order ID:</b> <code>${order.order_id}</code>\n` +
              `${EMOJI_GAME} <b>Product:</b> ${order.game}\n` +
              `${EMOJI_MONEY} <b>Package:</b> ${order.package_name}\n` +
              `${EMOJI_MONEY} <b>Charged:</b> ${Math.floor(order.charged_price)} ETB\n` +
              `${EMOJI_SUCCESS} <b>Status:</b> ${order.status}\n` +
              `${EMOJI_CALENDAR} <b>Date:</b> ${(order.created_at || "").slice(0, 10)}\n` +
              "━━━━━━━━━━━━━━━━━━━━━━\n";
          }
        }
        await sendNewMessage(ctx, text, { reply_markup: get_main_keyboard() });
        return;
      }
      if (data === "menu_support") {
        clearUserSession(userId);
        const help_msg =
          `${EMOJI_SUPPORT} <b>Support & Help</b>\n\n` +
          "<b> Quick start:</b>\n" +
          "1. Use the <b>inline buttons</b> in the message below the keyboard to navigate.\n" +
          "2. Most flows guide you step by step — just follow the prompts.\n\n" +
          `${EMOJI_MONEY} <b>Deposit (Telebirr):</b>\n` +
          "1. Tap <b>Deposit</b> in the main menu.\n" +
          "2. Choose <b>Telebirr (ETB)</b>.\n" +
          `3. Enter the amount (min ${MIN_DEPOSIT_BIRR} ETB, max ${appSettings.MAX_DEPOSIT_LIMIT} ETB).\n` +
          "4. Send the money to the number shown.\n" +
          "5. After paying, <b>type the Transaction ID</b>.\n" +
          "6. Once verified, the ETB is added to your balance automatically.\n\n" +
          `${EMOJI_MONEY} <b>Withdraw (Telebirr):</b>\n` +
          "1. Tap <b>Withdraw</b> in the main menu.\n" +
          "2. Enter your Telebirr phone number and a nickname.\n" +
          `3. Enter the amount (min ${MIN_WITHDRAW_BIRR} ETB, max ${appSettings.MAX_WITHDRAW_LIMIT} ETB).\n` +
          "4. Confirm — admin will review and send the money.\n\n" +
          `${EMOJI_STAR} <b>Telegram Services:</b>\n` +
          "1. Tap <b>Service</b> in the main menu.\n" +
          "2. Choose <b>Telegram Stars</b> or <b>Telegram Premium</b>.\n" +
          "3. Pick a package.\n" +
          "4. Enter your Telegram <b>@username</b> (must start with @).\n" +
          "5. Choose payment method: <b>Wallet</b> (deduct from balance) or <b>Telebirr</b>.\n" +
          "6. For external payments, you'll see the account details and amount to pay, then provide the transaction reference.\n" +
          " If you pay more than the order total, the extra is added to your wallet balance.\n\n" +
          `${EMOJI_USER} <b>Referral:</b>\n` +
          `Tap Referral in Profile to get your invite link. Each friend earns you ${REFERRAL_REWARD} ETB instantly.\n\n` +
          `Need more help? Contact ${ADMIN_USERNAME}`;
        await sendNewMessage(ctx, help_msg, {
          reply_markup: get_support_keyboard(),
        });
        return;
      }
      if (data === "profile_referral") {
        const [total, rewarded, total_reward] =
          await db.get_referral_stats(userId);
        const me = await bot.telegram.getMe();
        const ref_link = `https://t.me/${me.username}?start=ref${userId}`;
        const msgText =
          `${EMOJI_USER} <b>Your Referral Stats</b>\n\n` +
          `${EMOJI_USER} <b>Your Link:</b> <code>${ref_link}</code>\n` +
          `${EMOJI_USER} <b>Total Invites:</b> ${total}\n` +
          `${EMOJI_MONEY} <b>Rewarded:</b> ${rewarded}\n` +
          `${EMOJI_MONEY} <b>Total Earned:</b> ${Math.floor(total_reward)} ETB\n` +
          `${EMOJI_MONEY} <b>Reward per invite:</b> ${REFERRAL_REWARD} ETB (instant, not withdrawable)\n\n` +
          "<i>Share your link. Each new user who joins gives you an instant reward!</i>";
        const kb = {
          inline_keyboard: [
            [{ text: "Back to Main Menu", callback_data: "back_to_main" }],
          ],
        };
        await sendOrEdit(ctx, msgText, { reply_markup: kb });
        return;
      }
      if (data === "profile_redeem") {
        session.state = STATE_PROFILE_REDEEM;
        const msgText = `${EMOJI_MONEY} <b>Enter your promo code:</b>`;
        const kb = {
          inline_keyboard: [
            [{ text: "❌ Cancel", callback_data: "cancel_action" }],
          ],
        };
        await sendOrEdit(ctx, msgText, { reply_markup: kb });
        return;
      }
      async function render_package_page(ctx, session, page) {
        const buttons = session.data.pkg_buttons || [];
        const isOnePerRow = session.data.isOnePerRow || false;
        const isPaginated = session.data.isPaginated || false;
        const backBtn = session.data.pkg_back || "svc_games";
        const pageSize = 10;
        const totalPages = Math.max(1, Math.ceil(buttons.length / pageSize));
        page = Math.max(0, Math.min(page, totalPages - 1));
        let slice = buttons;
        if (isPaginated) {
          slice = buttons.slice(page * pageSize, page * pageSize + pageSize);
        }
        const grid = [];
        if (isOnePerRow) {
          for (let btn of slice) grid.push([btn]);
        } else {
          for (let i = 0; i < slice.length; i += 2)
            grid.push(slice.slice(i, i + 2));
        }
        if (isPaginated && totalPages > 1) {
          const nav = [];
          if (page > 0)
            nav.push({
              text: "⬅️ Previous",
              callback_data: `pkg_page:${page - 1}`,
            });
          if (page < totalPages - 1)
            nav.push({
              text: "➡️ Next",
              callback_data: `pkg_page:${page + 1}`,
            });
          if (nav.length) grid.push(nav);
        }
        grid.push([
          { text: "🔙 Back", callback_data: backBtn, style: "danger" },
        ]);
        session.state = STATE_SELECT_PKG;
        await sendOrEdit(ctx, `${EMOJI_ORDER} <b>Select a package:</b>`, {
          reply_markup: { inline_keyboard: grid },
        });
      }
      async function open_game_catalogue(
        ctx,
        session,
        db,
        api_client,
        gameCode,
        gameName,
      ) {
        await clear_last_photo(ctx, session);
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>${gameName}</b>\n\nLoading packages...`,
        );
        try {
          const res = await api_client.get_game_catalogue(gameCode);
          if (!res || !res.success)
            throw new Error((res && res.message) || "No catalogue returned");
          let packages = res.catalogues || res.data || [];
          packages = sort_game_packages(gameCode, packages);
          if (!packages.length)
            throw new Error("No packages available for this game.");
          const markup = await db.get_game_markup(gameCode);
          const overrides = new Map();
          for (const ov of await db.get_all_product_overrides()) {
            if (
              ov.price_override !== undefined &&
              ov.price_override !== null &&
              ov.game_code === gameCode
            )
              overrides.set(
                String(ov.product_id || ov.id),
                parseFloat(ov.price_override),
              );
          }
          packages = apply_discount_deduplication(packages);
          session.data.active_packages = packages;
          session.data.game_markup = markup;
          session.data.package_raw_names = {};
          const buttons = [];
          for (let idx = 0; idx < packages.length; idx++) {
            const pkg = packages[idx];
            const rawName = String(
              pkg.display_name || pkg.name || pkg.title ||
                pkg.catalogue_name ||
                pkg.code ||
                `Package ${idx + 1}`,
            );
            const productId = String(pkg.id || pkg.code || rawName);
            const apiPrice = parseFloat(
              pkg.unit_price ?? pkg.price ?? pkg.amount ?? pkg.cost ?? 0,
            );
            const override = overrides.get(productId);
            const charged =
              override !== undefined
                ? override
                : api_price_to_birr(apiPrice, markup);
            session.data.package_raw_names[String(idx)] = rawName;
            session.data[`pkg_price_${idx}`] = charged;
            buttons.push({
              text: `${rawName} - ${Math.floor(charged)} ETB`,
              callback_data: `pkg_game:${idx}`,
            });
          }
          const isOnePerRow =
            gameCode.toLowerCase().includes("pubg") ||
            gameCode.toLowerCase().includes("free_fire") ||
            gameCode.toLowerCase().includes("freefire");
          const isPaginated =
            isOnePerRow &&
            !gameCode.toLowerCase().includes("freefire") &&
            !gameCode
              .toLowerCase()
              .includes("free_fire"); /* Apply pagination */
          session.data.pkg_buttons = buttons;
          session.data.pkg_back = "svc_games";
          session.data.isOnePerRow = isOnePerRow;
          session.data.isPaginated = isPaginated;
          await render_package_page(ctx, session, 0);
        } catch (e) {
          logger.error(`Error fetching ${gameName} catalogue: ${e.message}`);
          await sendOrEdit(
            ctx,
            `${EMOJI_CROSS} Failed to load ${gameName} packages.\n\n${e.message}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "svc_games" }],
                ],
              },
            },
          );
        }
      }

      /* ---------- Service Flow ---------- */
      if (data === "menu_service" || data === "back_to_service") {
        if (!(await maintenance_check(ctx))) return;
        if (!(await check_channel_membership(ctx))) return;
        await clear_last_photo(ctx, session);
        session.state = STATE_SERVICE_SELECT;
        await sendOrEdit(ctx, `${EMOJI_GAME} <b>Choose a service:</b>`, {
          reply_markup: get_service_inline_keyboard(),
        });
        return;
      }
      if (data === "svc_telegram_menu") {
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>Telegram</b>\n\nChoose a Telegram service:`,
          { reply_markup: get_telegram_service_keyboard() },
        );
        return;
      }
      if (data.startsWith("svc_game_popular:")) {
        const kind = data.split(":")[1];
        let games = session.data.available_games || [];
        try {
          const gamesRes = await api_client.get_games();
          if (gamesRes && gamesRes.success)
            games = gamesRes.games || gamesRes.data || games;
        } catch (e) {
          logger.warn(`Failed to refresh games: ${e.message}`);
        }
        session.data.available_games = games;
        if (kind === "freefire") {
          const regions = get_free_fire_region_games(games);
          if (!regions.length) {
            await sendOrEdit(
              ctx,
              `${EMOJI_CROSS} No Free Fire regions are currently available from the provider.`,
              { reply_markup: get_games_keyboard(games) },
            );
            return;
          }
          await sendOrEdit(
            ctx,
            `${EMOJI_GAME} <b>Free Fire</b>\n\nSelect your region:`,
            { reply_markup: get_free_fire_regions_keyboard(games) },
          );
          return;
        }
        const game = find_popular_game(games, "pubg");
        if (!game) {
          await sendOrEdit(
            ctx,
            `${EMOJI_CROSS} PUBG is currently unavailable.`,
            { reply_markup: get_games_keyboard(games) },
          );
          return;
        }
        const gameCode = normalize_game_code(game);
        const gameName = normalize_game_name(game);

        const kb = {
          inline_keyboard: [
            [
              { text: "💰 UC", callback_data: `pubg_sub:${gameCode}:uc` },
              { text: "🪙 Wow Coin", callback_data: `pubg_sub:${gameCode}:wow` }
            ],
            [
              { text: "🌟 Prime & Prime Plus", callback_data: `pubg_sub:${gameCode}:prime` },
              { text: "🎫 Elite Pass", callback_data: `pubg_sub:${gameCode}:elite` }
            ],
            [
              { text: "📦 Packs", callback_data: `pubg_sub:${gameCode}:packs` },
              { text: "🎟️ UC Vouchers", callback_data: `pubg_sub:${gameCode}:vouchers` }
            ],
            [{ text: "🔙 Back", callback_data: "svc_games" }],
          ],
        };
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>${gameName}</b>\n\nSelect an option:`,
          { reply_markup: kb },
        );
        return;
      }
      if (data === "freefire_regions") {
        const kb = {
          inline_keyboard: [
            [
              {
                text: "🔥 Free Fire Middle East",
                callback_data: "ff_me_cats",
              },
            ],
            [
              {
                text: "🎫 Free Fire Global Vouchers",
                callback_data: "ff_cat:6",
              },
            ],
            [{ text: "🔙 Back", callback_data: "svc_games" }],
          ],
        };
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>Free Fire</b>\n\nSelect an option:`,
          { reply_markup: kb },
        );
        return;
      }
      if (data === "menu_service") {
        if (!(await maintenance_check(ctx))) return;
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>Services</b>\n\nChoose a category:`,
          { reply_markup: get_service_inline_keyboard() },
        );
        return;
      }
      if (data === "svc_games") {
        if (!(await maintenance_check(ctx))) return;
        let games = session.data.available_games || [];
        try {
          const gamesRes = await api_client.get_games();
          if (gamesRes && gamesRes.success)
            games = gamesRes.games || gamesRes.data || [];
        } catch (e) {
          logger.warn(`Failed to refresh games: ${e.message}`);
        }
        session.data.available_games = games;
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>Games</b>\n\n<b>Popular Games</b>:`,
          { reply_markup: get_games_keyboard(games) },
        );
        return;
      }
      if (data.startsWith("games_more:")) {
        const page = parseInt(data.split(":")[1] || "0", 10) || 0;
        const games = session.data.available_games || [];
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>More Games</b>\n\nSelect a game:`,
          { reply_markup: get_more_games_keyboard(games, page) },
        );
        return;
      }
      if (data === "noop") {
        return;
      }
      if (data === "games_search") {
        session.state = "STATE_SEARCH_GAME";
        await sendOrEdit(
          ctx,
          " <b>Search Game</b>\n\nEnter the name of the game you are looking for:",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "❌ Cancel", callback_data: "cancel_action" }],
              ],
            },
          },
        );
        return;
      }
      if (data.startsWith("svc_game:")) {
        const gameCode = data.slice("svc_game:".length);

        // Intercept PUBG
        if (
          gameCode.toLowerCase() === "pubgm" ||
          gameCode.toLowerCase().includes("pubg")
        ) {
          const kb = {
          inline_keyboard: [
            [
              { text: "💰 UC", callback_data: `pubg_sub:${gameCode}:uc` },
              { text: "🪙 Wow Coin", callback_data: `pubg_sub:${gameCode}:wow` }
            ],
            [
              { text: "🌟 Prime & Prime Plus", callback_data: `pubg_sub:${gameCode}:prime` },
              { text: "🎫 Elite Pass", callback_data: `pubg_sub:${gameCode}:elite` }
            ],
            [
              { text: "📦 Packs", callback_data: `pubg_sub:${gameCode}:packs` },
              { text: "🎟️ UC Vouchers", callback_data: `pubg_sub:${gameCode}:vouchers` }
            ],
            [{ text: "🔙 Back", callback_data: "svc_games" }],
          ],
        };
          await sendOrEdit(
            ctx,
            `${EMOJI_GAME} <b>PUBG</b>\n\nSelect an option:`,
            { reply_markup: kb },
          );
          return;
        }

        const games = session.data.available_games || [];
        const game = games.find((g) => normalize_game_code(g) === gameCode);
        const gameName = game ? normalize_game_name(game) : gameCode;
        session.data.game_code = gameCode;
        session.data.game_name = gameName;
        session.data.flow_type = "game";
        session.data.telegram_game_code = null;
        await clear_last_photo(ctx, session);
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>${gameName}</b>\n\nLoading packages...`,
        );
        try {
          const res = await api_client.get_game_catalogue(gameCode);
          if (!res || !res.success)
            throw new Error((res && res.message) || "No catalogue returned");
          let packages = res.catalogues || res.data || [];
          packages = sort_game_packages(gameCode, packages);
          if (!packages.length)
            throw new Error("No packages available for this game.");
          const markup = await db.get_game_markup(gameCode);
          const overrides = new Map();
          for (const ov of await db.get_all_product_overrides()) {
            if (ov.price_override !== undefined && ov.price_override !== null)
              overrides.set(String(ov.id), parseFloat(ov.price_override));
          }
          packages = apply_discount_deduplication(packages);
          session.data.active_packages = packages;
          session.data.game_markup = markup;
          session.data.package_raw_names = {};
          const buttons = [];
          for (let idx = 0; idx < packages.length; idx++) {
            const pkg = packages[idx];
            const rawName = String(
              pkg.display_name || pkg.name || pkg.title ||
                pkg.catalogue_name ||
                pkg.code ||
                `Package ${idx + 1}`,
            );
            const productId = String(pkg.id || pkg.code || rawName);
            const apiPrice = parseFloat(
              pkg.unit_price ?? pkg.price ?? pkg.amount ?? pkg.cost ?? 0,
            );
            const override =
              overrides.get(`${gameCode}__${productId}`) ??
              overrides.get(productId);
            const charged =
              override !== undefined
                ? override
                : api_price_to_birr(apiPrice, markup);
            session.data.package_raw_names[String(idx)] = rawName;
            session.data[`pkg_price_${idx}`] = charged;
            buttons.push({
              text: `${rawName} - ${Math.floor(charged)} ETB`,
              callback_data: `pkg_game:${idx}`,
            });
          }
          const isOnePerRow =
            gameCode.toLowerCase().includes("pubg") ||
            gameCode.toLowerCase().includes("free_fire") ||
            gameCode.toLowerCase().includes("freefire");
          const isPaginated =
            isOnePerRow &&
            !gameCode.toLowerCase().includes("freefire") &&
            !gameCode
              .toLowerCase()
              .includes("free_fire"); /* Apply pagination */
          session.data.pkg_buttons = buttons;
          session.data.pkg_back = gameCode.toLowerCase().includes("freefire")
            ? "freefire_regions"
            : "back_to_main";
          session.data.isOnePerRow = isOnePerRow;
          session.data.isPaginated = isPaginated;
          await render_package_page(ctx, session, 0);
        } catch (e) {
          logger.error(`Error fetching ${gameName} catalogue: ${e.message}`);
          await sendOrEdit(
            ctx,
            `${EMOJI_CROSS} Failed to load ${gameName} packages.\n\n${e.message}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "🔙 Back",
                      callback_data: gameCode.toLowerCase().includes("freefire")
                        ? "freefire_regions"
                        : "back_to_main",
                    },
                  ],
                ],
              },
            },
          );
        }
        return;
      }
      if (data.startsWith("svc_telegram_")) {
        const selection = data.split("_")[2];
        if (selection === "menu") {
          await sendOrEdit(
            ctx,
            `${EMOJI_GAME} <b>Telegram</b>\n\nChoose a Telegram service:`,
            { reply_markup: get_telegram_service_keyboard() },
          );
          return;
        }
        session.data.game_code = "Telegram";
        session.data.telegram_kind = selection;
        session.data.game_name =
          selection === "stars" ? "Telegram Stars" : "Telegram Premium";
        session.data.flow_type = "telegram";
        await clear_last_photo(ctx, session);
        const emoji = selection === "stars" ? EMOJI_STAR : EMOJI_PREMIUM;
        await sendOrEdit(
          ctx,
          `${emoji} <b>${session.data.game_name}</b>\n\n Loading packages...`,
        );
        let packages = [],
          markup = 0.0;
        try {
          if (selection === "stars") {
            packages = await catalog_service.get_telegram_stars_packages();
            markup = await catalog_service.get_telegram_stars_markup();
          } else {
            packages = await catalog_service.get_telegram_premium_plans();
            markup = await catalog_service.get_telegram_premium_markup();
          }
        } catch (e) {
          logger.error(`Error fetching Telegram packages: ${e.message}`);
          await sendNewMessage(ctx, `${EMOJI_CROSS} Failed to load plans.`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Back",
                    callback_data: gameCode.toLowerCase().includes("freefire")
                      ? "freefire_regions"
                      : "back_to_main",
                  },
                ],
              ],
            },
          });
          return;
        }
        if (!packages.length) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} No plans found.`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Back",
                    callback_data: gameCode.toLowerCase().includes("freefire")
                      ? "freefire_regions"
                      : "back_to_main",
                  },
                ],
              ],
            },
          });
          return;
        }
        packages = apply_discount_deduplication(packages);
          session.data.active_packages = packages;
        session.data.telegram_markup = markup;
        session.data.telegram_game_code = packages[0]._game_code || "Telegram";
        session.data.package_raw_names = {};
        const keyboard_buttons = [];
        for (let idx = 0; idx < packages.length; idx++) {
          const pkg = packages[idx];
          const raw_name = pkg.display_name || pkg.name || pkg.title || "Package";
          const override = pkg._override_price;
          let birr_price;
          if (
            selection === "stars" &&
            (override === undefined || override === null)
          ) {
            const parsed = parse_telegram_name(raw_name);
            if (parsed && parsed[0] === "stars") {
              const amount = parsed[1];
              birr_price = amount * 3;
            } else {
              const api_price = parseFloat(
                pkg.unit_price || pkg.price || pkg.amount || 0.0,
              );
              birr_price = api_price_to_birr(api_price, markup, true);
            }
          } else {
            if (override !== undefined && override !== null)
              birr_price = override;
            else {
              const api_price = parseFloat(
                pkg.unit_price || pkg.price || pkg.amount || 0.0,
              );
              birr_price = api_price_to_birr(api_price, markup, true);
            }
          }
          session.data.package_raw_names[String(idx)] = raw_name;
          const display_text = format_telegram_display(raw_name, birr_price);
          session.data[`pkg_price_${idx}`] = birr_price;
          keyboard_buttons.push({
            text: display_text,
            callback_data: `pkg_idx:${idx}`,
          });
        }
        let grid = [];
        if (selection === "premium")
          grid = keyboard_buttons.map((btn) => [btn]);
        else {
          for (let i = 0; i < keyboard_buttons.length; i += 2)
            grid.push(keyboard_buttons.slice(i, i + 2));
        }
        grid.push([
          {
            text: "🔙 Back",
            callback_data: "svc_telegram_menu",
            style: "danger",
          },
        ]);
        session.state = STATE_SELECT_PKG;
        await sendOrEdit(ctx, `${EMOJI_ORDER} <b>Select a package:</b>`, {
          reply_markup: { inline_keyboard: grid },
        });
        return;
      }
      if (data.startsWith("pkg_page:")) {
        const page = parseInt(data.split(":")[1], 10);
        await render_package_page(ctx, session, page);
        return;
      }

      if (data.startsWith("ff_cat:")) {
        const categoryId = data.split(":")[1];
        session.data.flow_type = "voucher";
        session.data.game_code = "freefire_vouchers";
        session.data.game_name = "Free Fire Global Vouchers";
        await clear_last_photo(ctx, session);
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>Free Fire Global Vouchers</b>\n\nLoading...`,
        );
        try {
          const res = await api_client.get_category_products(categoryId);
          if (!res || !res.success)
            throw new Error((res && res.message) || "No products returned");
          let packages = res.products || res.data || [];
          if (!packages.length) throw new Error("No vouchers available.");

          const markup = await db.get_game_markup("freefire_vouchers");
          const overrides = new Map();
          for (const ov of await db.get_all_product_overrides()) {
            if (ov.price_override !== undefined && ov.price_override !== null)
              overrides.set(String(ov.id), parseFloat(ov.price_override));
          }
          packages = apply_discount_deduplication(packages);
          session.data.active_packages = packages;
          session.data.game_markup = markup;
          session.data.package_raw_names = {};
          const buttons = [];
          for (let idx = 0; idx < packages.length; idx++) {
            const pkg = packages[idx];
            const rawName = String(
              pkg.display_name || pkg.name || pkg.title || `Voucher ${idx + 1}`,
            );
            const productId = String(pkg.id || pkg.code || rawName);
            const apiPrice = parseFloat(
              pkg.unit_price ?? pkg.price ?? pkg.amount ?? pkg.cost ?? 0,
            );
            const override =
              overrides.get(`freefire_vouchers__${productId}`) ??
              overrides.get(productId);
            const charged =
              override !== undefined
                ? override
                : api_price_to_birr(apiPrice, markup);
            session.data.package_raw_names[String(idx)] = rawName;
            buttons.push({
              text: `${rawName} — ${Math.floor(charged)} ETB`,
              callback_data: `pkg_game:${idx}`,
            });
          }
          session.data.pkg_buttons = buttons;
          session.data.pkg_back = "freefire_regions";
          session.data.isOnePerRow = true;
          session.data.isPaginated = false;
          await render_package_page(ctx, session, 0);
        } catch (e) {
          logger.error(`Error fetching FF vouchers: ${e.message}`);
          await sendOrEdit(
            ctx,
            `${EMOJI_CROSS} Failed to load Free Fire Global Vouchers.\n\n${e.message}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "freefire_regions" }],
                ],
              },
            },
          );
        }
        return;
      }

      if (data === "ff_me_cats") {
        const kb = {
          inline_keyboard: [
            [{ text: "💎 Diamonds", callback_data: `ff_sub:freefire_me:diamonds` }],
            [{ text: "🏅 Membership", callback_data: `ff_sub:freefire_me:membership` }],
            [{ text: "⬆️ Level Up Pass", callback_data: `ff_sub:freefire_me:levelup` }],
            [{ text: "🔙 Back", callback_data: "freefire_regions" }],
          ],
        };
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>Free Fire Middle East</b>\n\nSelect a category:`,
          { reply_markup: kb },
        );
        return;
      }
      if (data.startsWith("ff_sub:")) {
        const parts = data.split(":");
        const gameCode = parts[1];
        const type = parts[2];
        const gameName = "Free Fire Middle East";

        session.data.flow_type = "game";
        session.data.game_code = gameCode;
        session.data.game_name = gameName;
        await clear_last_photo(ctx, session);
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>${gameName}</b>\n\nLoading products...`,
        );

        try {
          const res = await api_client.get_game_catalogue(gameCode);
          if (!res || !res.success)
            throw new Error((res && res.message) || "No catalogue returned");
          let packages = res.catalogues || res.data || [];

          packages = packages.filter((pkg) => {
            const name = (pkg.display_name || pkg.name || pkg.title || "").toLowerCase();
            
            if (type === "diamonds") return name.includes("diamond") || (!name.includes("member") && !name.includes("level"));
            if (type === "membership") return name.includes("member");
            if (type === "levelup") return name.includes("level");
            return true;
          });

          if (!packages.length) throw new Error("No products available in this category.");

          const markup = await db.get_game_markup(session.data.game_code);
          const overrides = new Map();
          for (const ov of await db.get_all_product_overrides()) {
            if (ov.price_override !== undefined && ov.price_override !== null)
              overrides.set(String(ov.id), parseFloat(ov.price_override));
          }
          packages = apply_discount_deduplication(packages);
          session.data.active_packages = packages;
          session.data.game_markup = markup;
          session.data.package_raw_names = {};
          const buttons = [];
          for (let idx = 0; idx < packages.length; idx++) {
            const pkg = packages[idx];
            const rawName = String(
              pkg.display_name || pkg.name || pkg.title ||
                pkg.catalogue_name ||
                pkg.code ||
                `Package ${idx + 1}`,
            );
            const productId = String(pkg.id || pkg.code || rawName);
            const apiPrice = parseFloat(
              pkg.unit_price ?? pkg.price ?? pkg.amount ?? pkg.cost ?? 0,
            );
            const override =
              overrides.get(`${session.data.game_code}__${productId}`) ??
              overrides.get(productId);
            const charged =
              override !== undefined
                ? override
                : api_price_to_birr(apiPrice, markup);
            session.data.package_raw_names[String(idx)] = rawName;
            buttons.push({
              text: `${rawName} — ${Math.floor(charged)} ETB`,
              callback_data: `pkg_game:${idx}`,
            });
          }
          session.data.pkg_buttons = buttons;
          session.data.pkg_back = "ff_me_cats";
          session.data.isOnePerRow = true;
          session.data.isPaginated = true; // Use pagination for large lists
          await render_package_page(ctx, session, 0);
        } catch (e) {
          logger.error(`Error fetching FF sub-category: ${e.message}`);
          await sendOrEdit(
            ctx,
            `${EMOJI_CROSS} Failed to load products.\n\n${e.message}`,
            {
              reply_markup: {
                inline_keyboard: [[{ text: "🔙 Back", callback_data: "ff_me_cats" }]],
              },
            },
          );
        }
        return;
      }
      if (data.startsWith("pubg_sub:")) {
        const parts = data.split(":");
        const gameCode = parts[1];
        const type = parts[2];
        const gameName = "PUBG Mobile";

        session.data.flow_type = type === "vouchers" ? "voucher" : "game";
        session.data.game_code =
          type === "vouchers" ? "pubg_vouchers" : gameCode;
        session.data.game_name = gameName;
        await clear_last_photo(ctx, session);
        await sendOrEdit(
          ctx,
          `${EMOJI_GAME} <b>${gameName}</b>\n\nLoading products...`,
        );

        try {
          let packages = [];
          if (type === "vouchers") {
            const res = await api_client.get_category_products("1");
            if (!res || !res.success)
              throw new Error((res && res.message) || "No products returned");
            packages = res.products || res.data || [];
          } else {
            const res = await api_client.get_game_catalogue(gameCode);
            if (!res || !res.success)
              throw new Error((res && res.message) || "No catalogue returned");
            packages = res.catalogues || res.data || [];

            packages = packages.filter((pkg) => {
              const name = (pkg.display_name || pkg.name || pkg.title || "").toLowerCase();
              const isUC =
                name.includes("uc") ||
                (!name.includes("wow") &&
                  !name.includes("pack") &&
                  !name.includes("prime") &&
                  !name.includes("elite pass") &&
                  /^[0-9]+$/.test(name.trim()));
              
              if (type === "uc") return isUC;
              if (type === "wow") return name.includes("wow");
              if (type === "prime") return name.includes("prime");
              if (type === "elite") return name.includes("elite");
              if (type === "packs") return name.includes("pack");
              if (type === "other") return !isUC;
              return true;
            });
          }

          if (!packages.length) throw new Error("No products available.");

          const markup = await db.get_game_markup(session.data.game_code);
          const overrides = new Map();
          for (const ov of await db.get_all_product_overrides()) {
            if (ov.price_override !== undefined && ov.price_override !== null)
              overrides.set(String(ov.id), parseFloat(ov.price_override));
          }
          packages = apply_discount_deduplication(packages);
          session.data.active_packages = packages;
          session.data.game_markup = markup;
          session.data.package_raw_names = {};
          const buttons = [];
          for (let idx = 0; idx < packages.length; idx++) {
            const pkg = packages[idx];
            const rawName = String(
              pkg.display_name || pkg.name || pkg.title || `Product ${idx + 1}`,
            );
            const productId = String(pkg.id || pkg.code || rawName);
            const apiPrice = parseFloat(
              pkg.unit_price ?? pkg.price ?? pkg.amount ?? pkg.cost ?? 0,
            );
            const override =
              overrides.get(`${session.data.game_code}__${productId}`) ??
              overrides.get(productId);
            const charged =
              override !== undefined
                ? override
                : api_price_to_birr(apiPrice, markup);
            session.data.package_raw_names[String(idx)] = rawName;
            buttons.push({
              text: `${rawName} — ${Math.floor(charged)} ETB`,
              callback_data: `pkg_game:${idx}`,
            });
          }
          session.data.pkg_buttons = buttons;
          session.data.pkg_back = "svc_game_popular:pubg";
session.data.isOnePerRow = !(type === "uc" || type === "vouchers");
          session.data.isPaginated = true;
          await render_package_page(ctx, session, 0);
        } catch (e) {
          logger.error(`Error fetching PUBG products: ${e.message}`);
          await sendOrEdit(
            ctx,
            `${EMOJI_CROSS} Failed to load products.\n\n${e.message}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "svc_game_popular:pubg" }],
                ],
              },
            },
          );
        }
        return;
      }

      if (data.startsWith("pkg_game:")) {
        const idx = parseInt(data.slice("pkg_game:".length), 10);
        const packages = session.data.active_packages || [];
        if (
          !Number.isInteger(idx) ||
          idx < 0 ||
          idx >= packages.length ||
          (session.data.flow_type !== "game" &&
            session.data.flow_type !== "voucher")
        ) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Package unavailable.`, {
            reply_markup: get_main_keyboard(),
          });
          clearUserSession(userId);
          return;
        }
        const pkg = packages[idx];
        const rawName =
          (session.data.package_raw_names &&
            session.data.package_raw_names[String(idx)]) ||
          pkg.display_name || pkg.name || pkg.title ||
          pkg.catalogue_name ||
          "Item";
        const apiPrice = parseFloat(
          pkg.unit_price ?? pkg.price ?? pkg.amount ?? pkg.cost ?? 0,
        );
        const chargedPrice =
          session.data[`pkg_price_${idx}`] ??
          api_price_to_birr(apiPrice, session.data.game_markup || 0);
        session.data.selected_pkg_id = pkg.id || pkg.code || rawName;
        session.data.package_name =
          pkg.catalogue_name || pkg.display_name || pkg.name || pkg.title || pkg.code || rawName;
        session.data.package_display_name = rawName;
        session.data.api_price = apiPrice;
        session.data.charged_price = chargedPrice;
        session.data.markup = session.data.game_markup || 0;
        session.data.service_name =
          pkg.service || pkg.description || "Direct Top-Up";

        if (session.data.flow_type === "voucher") {
          session.data.player_id = "VOUCHER";
          session.data.nickname = "VOUCHER";

          const safeName = "Voucher Code";
          const summary =
            "━━━━━━━━━━━━━━━━━━━━━━\n" +
            `${EMOJI_ORDER} <b>Order Summary</b>\n\n` +
            `${EMOJI_GAME} <b>Product:</b> ${session.data.game_name}\n` +
            `${EMOJI_MONEY} <b>Package:</b> ${session.data.package_display_name || session.data.package_name}\n` +
            `${EMOJI_MONEY} <b>Price:</b> ${Math.floor(session.data.charged_price)}ETB\n` +
            "━━━━━━━━━━━━━━━━━━━━━━";
          session.state = STATE_CONFIRM;
          await sendOrEdit(ctx, summary, {
            reply_markup: get_confirmation_keyboard(),
          });
          return;
        }

        session.state = STATE_ENTER_UID;
        const cancel_kb = {
          inline_keyboard: [
            [
              {
                text: "❌ Cancel",
                callback_data: "cancel_action",
                style: "danger",
              },
            ],
          ],
        };
        await sendOrEdit(
          ctx,
          `${EMOJI_USER} <b>Enter player ID</b> for <b>${rawName}</b>:\n<i>Your player ID will be verified before payment.</i>`,
          { reply_markup: cancel_kb },
        );
        return;
      }
      if (data.startsWith("pkg_idx:")) {
        const idx = parseInt(data.split(":")[1], 10);
        const packages = session.data.active_packages;
        if (!packages || idx >= packages.length) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Package unavailable.`, {
            reply_markup: get_main_keyboard(),
          });
          clearUserSession(userId);
          return;
        }
        const pkg = packages[idx];
        const raw_name =
          (session.data.package_raw_names &&
            session.data.package_raw_names[String(idx)]) ||
          pkg.display_name || pkg.name || pkg.title ||
          "Item";
        const api_price = parseFloat(
          pkg.unit_price || pkg.price || pkg.amount || 0.0,
        );
        const markup = session.data.telegram_markup || 0.0;
        const charged_price =
          session.data[`pkg_price_${idx}`] !== undefined
            ? session.data[`pkg_price_${idx}`]
            : api_price_to_birr(api_price, markup, true);
        const clean_name = get_clean_telegram_name(raw_name);
        session.data.selected_pkg_id = pkg.id || pkg.code;
        session.data.package_name = raw_name;
        session.data.package_display_name = clean_name;
        session.data.api_price = api_price;
        session.data.charged_price = charged_price;
        session.data.markup = markup;
        session.data.service_name = pkg.service || "Direct Top-Up";
        session.state = STATE_ENTER_UID;
        const cancel_kb = {
          inline_keyboard: [
            [
              {
                text: "❌ Cancel",
                callback_data: "cancel_action",
                style: "danger",
              },
            ],
          ],
        };
        const prompt = `${EMOJI_USER} <b>Enter recipient's Telegram username</b> (with @) for <b>${clean_name}</b>:\n<i>The API will verify it and return their Telegram name.</i>`;
        await sendOrEdit(ctx, prompt, { reply_markup: cancel_kb });
        return;
      }
      if (data === "order_confirm") {
        session.state = STATE_PAYMENT_METHOD;
        const kb = {
          inline_keyboard: [
            [
              {
                text: "Pay from Wallet",
                callback_data: "pay_method:wallet",
                style: "primary",
              },
            ],
            [
                            {
                text: "💸 Telebirr",
                callback_data: "pay_method:telebirr",
                style: "primary",
              },
            ],
            [
              {
                text: "❌ Cancel",
                callback_data: "order_cancel",
                style: "danger",
              },
            ],
          ],
        };
        await sendOrEdit(
          ctx,
          `${EMOJI_WALLET} <b>Choose a payment method</b>`,
          { reply_markup: kb },
        );
        return;
      }
      if (data.startsWith("pay_method:")) {
        const method = data.split(":")[1];
        session.data.pay_method = method;
        if (method === "wallet") {
          const profile = await db.get_user_profile(userId);
          const balance = profile.balance || 0.0;
          const charged_price = session.data.charged_price || 0.0;
          if (balance < charged_price) {
            await sendNewMessage(
              ctx,
              `${EMOJI_CROSS} <b>Insufficient Balance</b>\nRequired: ${Math.floor(charged_price)}ETB\nYour Balance: ${Math.floor(balance)}ETB`,
              { reply_markup: get_main_keyboard() },
            );
            clearUserSession(userId);
            return;
          }
          if (
            !(await db.can_place_order(userId, appSettings.MAX_DAILY_ORDERS))
          ) {
            await sendNewMessage(
              ctx,
              `${EMOJI_CROSS} You have reached the daily order limit.`,
              { reply_markup: get_main_keyboard() },
            );
            clearUserSession(userId);
            return;
          }
          await sendOrEdit(ctx, " Processing order...");
          await place_order_flow(ctx, session, db, api_client, bot, "wallet");
          return;
        } else if (method === "telebirr") {
          const charged_price = session.data.charged_price || 0.0;
          let caption, image_to_send;

          {
            const regionLine = session.data.charname
              ? `🌍 Region: ${session.data.charname}\n`
              : "";
            const pkgName =
              session.data.package_display_name ||
              session.data.package_name ||
              "Package";

            caption =
              `Player Account Confirmed!\n\n` +
              `🎮 Player ID: ${session.data.player_id}\n` +
              `👤 Player Name: ${session.data.nickname || session.data.player_id}\n` +
              `${regionLine}` +
              `━━━━━━━━━━━━━━━\n\n` +
              `💳 Payment Instructions\n\n` +
              `💎 ${pkgName}\n` +
              `🏦 TeleBirr Account ⬇️ \n\n` +
              `📱 Number: ${TELEBIRR_PHONE}\n` +
              `👤 Name: ${EXPECTED_RECEIVER_NAME}\n` +
              `💰 Amount: ${Math.floor(charged_price)} Birr\n\n` +
              `━━━━━━━━━━━━━━━\n\n` +
              `⏰ Please complete your payment within 15 minutes.\n\n` +
              `⚠️ By Continuing, you agree to our Terms and Conditions.\n\n` +
              `━━━━━━━━━━━━━━━\n\n` +
              `📌 How to Find Your Transaction Number\n\n` +
              `1. Open your Telebirr receipt\n` +
              `2. Look for 'Transaction Number'\n` +
              `3. Copy it carefully\n\n` +
              `📨Now send your Transaction Number or the messsage sent from Telebirr.\n\n` +
              `Example: ABC123456789\n\n` +
              `⚠️ Do NOT send screenshot, send only the Transaction Number.`;
            image_to_send = IMG_TRANSACTION_ID;
          }
          session.state = STATE_PAYMENT_TXN_ID;
          const cancel_kb = {
            inline_keyboard: [
              [
                {
                  text: "❌ Cancel",
                  callback_data: "order_cancel",
                  style: "danger",
                },
              ],
            ],
          };
          await clear_last_photo(ctx, session);
          await sendOrEditPhoto(ctx, image_to_send, caption, {
            reply_markup: cancel_kb,
          });
          return;
        }
      }
      if (data === "order_cancel") {
        await clear_last_photo(ctx, session);
        const pkg =
          session.data.package_display_name || session.data.package_name || "?";
        const price = session.data.charged_price || 0.0;
        clearUserSession(userId);
        if (ctx.callbackQuery) {
          await ctx.answerCbQuery("Order cancelled.").catch(() => {});
        }
        await sendMainMenu(ctx, db);
        await report_event(
          bot,
          `${EMOJI_CROSS} <b>Order Cancelled</b> (user)\n${EMOJI_USER} <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name || "User"}</a> (ID: <code>${ctx.from.id}</code>)\n${EMOJI_ORDER} ${pkg}\n${EMOJI_MONEY} ${Math.floor(price)} ETB`,
        );
        return;
      }
      if (data === "order_back") {
        await clear_last_photo(ctx, session);
        session.state = STATE_ENTER_UID;
        const package_name =
          session.data.package_display_name ||
          session.data.package_name ||
          "package";
        const prompt = `${EMOJI_USER} Enter recipient's username for ${package_name}:`;
        const cancel_kb = {
          inline_keyboard: [
            [
              {
                text: "❌ Cancel",
                callback_data: "cancel_action",
                style: "danger",
              },
            ],
          ],
        };
        await sendOrEdit(ctx, prompt, { reply_markup: cancel_kb });
        return;
      }
      /* ---------- Deposit Flow ---------- */
      if (data === "menu_deposit") {
        if (!(await maintenance_check(ctx))) return;
        if (!(await check_channel_membership(ctx))) return;
        await register_user_implicit(ctx, db, bot);
        await clear_last_photo(ctx, session);
        session.state = STATE_DEPOSIT_AMOUNT;
        await sendNewMessage(
          ctx,
          `${EMOJI_DEPOSIT} <b>Choose a deposit method</b>\n\nSelect how you'd like to add funds to your balance.`,
          { reply_markup: get_deposit_keyboard() },
        );
        return;
      }
      if (data.startsWith("dep_method:")) {
        const method = data.split(":")[1];
        session.data.dep_method = method;
        session.state = STATE_DEPOSIT_AMOUNT;
        const title = `${EMOJI_DEPOSIT} <b>Deposit via Telebirr</b>`;
        const text =
          `${title}\n\n` +
          `Please enter the amount (in ETB) you wish to deposit.\n` +
          `Minimum: <b>${MIN_DEPOSIT_BIRR} ETB</b>\n` +
          `Maximum: <b>${appSettings.MAX_DEPOSIT_LIMIT} ETB</b>`;
        const cancel_kb = {
          inline_keyboard: [
            [
              {
                text: "❌ Cancel",
                callback_data: "cancel_action",
                style: "danger",
              },
            ],
          ],
        };
        await sendNewMessage(ctx, text, { reply_markup: cancel_kb });
        return;
      }
      /* ---------- Withdraw Flow ---------- */
      if (data === "menu_withdraw") {
        if (!(await maintenance_check(ctx))) return;
        if (!(await check_channel_membership(ctx))) return;
        await register_user_implicit(ctx, db, bot);
        await clear_last_photo(ctx, session);
        const profile = await db.get_user_profile(userId);
        const available =
          (profile.balance || 0) - (profile.referral_balance || 0);
        if (available < MIN_WITHDRAW_BIRR) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Minimum withdrawal is ${MIN_WITHDRAW_BIRR} ETB.\nYour withdrawable balance (non-referral) is ${Math.floor(available)} ETB.`,
            { reply_markup: get_main_keyboard() },
          );
          return;
        }
        session.state = STATE_WITHDRAW_ACCOUNT;
        const cancel_kb = {
          inline_keyboard: [
            [
              {
                text: "❌ Cancel",
                callback_data: "cancel_action",
                style: "danger",
              },
            ],
          ],
        };
        await sendNewMessage(
          ctx,
          `${EMOJI_TELEBIRR} <b>Enter your Telebirr account number / phone:</b>\n(e.g., 0967197797)`,
          { reply_markup: cancel_kb },
        );
        return;
      }
      if (data === "withdraw_confirm") {
        const user = ctx.from;
        const amount = session.data.withdraw_amount;
        const fee = session.data.withdraw_fee || 0;
        const method = session.data.withdraw_method || "telebirr";
        const account = session.data.withdraw_account;
        const nickname = session.data.withdraw_nickname || "N/A";
        const profile = await db.get_user_profile(user.id);
        const available =
          (profile.balance || 0) - (profile.referral_balance || 0);
        if (amount + fee > available) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Balance changed.`, {
            reply_markup: get_main_keyboard(),
          });
          clearUserSession(userId);
          return;
        }
        const withdrawal_id = await db.create_withdrawal(
          user.id,
          method,
          amount,
          "ETB",
          account,
          nickname,
          fee,
        );
        const caption =
          `${EMOJI_WITHDRAW} <b>New Withdrawal Request</b>\n` +
          `${EMOJI_USER} User: <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a>\n` +
          `${EMOJI_TELEBIRR} Account: ${account}\n` +
          `${EMOJI_USER} Nickname: ${nickname}\n` +
          `${EMOJI_MONEY} Amount: ${Math.floor(amount)} ETB\n` +
          `${EMOJI_MONEY} Fee: ${Math.floor(fee)} ETB\n` +
          ` Withdrawal ID: <code>${format_withdrawal_id(withdrawal_id)}</code>`;
        const admin_kb = {
          inline_keyboard: [
            [
              {
                text: "✅ Approve",
                callback_data: `admin_approve_wth:${withdrawal_id}`,
              },
              {
                text: "Decline",
                callback_data: `admin_decline_wth:${withdrawal_id}`,
              },
            ],
          ],
        };
        for (const admin_id of ADMIN_CHAT_IDS) {
          try {
            await bot.telegram.sendMessage(admin_id, caption, {
              parse_mode: "HTML",
              reply_markup: admin_kb,
            });
          } catch (e) {
            logger.error(
              `Could not send withdrawal notification to admin ${admin_id}: ${e.message}`,
            );
          }
        }
        await sendNewMessage(
          ctx,
          `${EMOJI_SUCCESS} Withdrawal request submitted!\nAmount: ${Math.floor(amount)} ETB to ${account}`,
          { reply_markup: get_main_keyboard() },
        );
        await report_event(
          bot,
          `${EMOJI_WITHDRAW} <b>New Withdrawal Request</b>\n${EMOJI_USER} <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n${EMOJI_MONEY} Amount: ${Math.floor(amount)} ETB\n${EMOJI_TELEBIRR} Account: ${account}\n Withdrawal ID: <code>${format_withdrawal_id(withdrawal_id)}</code>`,
        );
        clearUserSession(userId);
        return;
      }
      if (data === "withdraw_cancel") {
        clearUserSession(userId);
        if (ctx.callbackQuery) {
          await ctx.answerCbQuery("Withdrawal cancelled.").catch(() => {});
        }
        await sendMainMenu(ctx, db);
        return;
      }
      /* ---------- Admin Panel Handlers ---------- */
      if (ADMIN_CHAT_IDS.includes(userId)) {
        if (data.startsWith("admin_approve_dep:")) {
          const deposit_id = data.split(":")[1];
          const success = await db.approve_deposit(deposit_id);
          if (success) {
            const deposit = await db.get_deposit_by_id(deposit_id);
            try {
              await bot.telegram.sendMessage(
                deposit.user_id,
                `${EMOJI_SUCCESS} Deposit of ${Math.floor(deposit.amount)} ETB approved!`,
                { parse_mode: "HTML" },
              );
            } catch (_) {}
            await sendNewMessage(
              ctx,
              `${EMOJI_SUCCESS} Deposit ${format_deposit_id(deposit_id)} approved.`,
            );
            await report_event(
              bot,
              `${EMOJI_SUCCESS} <b>Deposit Approved</b>\n${EMOJI_USER} User ID: <code>${deposit.user_id}</code>\n${EMOJI_MONEY} Amount: ${Math.floor(deposit.amount)} ${deposit.currency || "ETB"}\n${EMOJI_TELEBIRR} Method: ${deposit.method || "?"}\n Deposit: <code>${format_deposit_id(deposit_id)}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a>`,
            );
            await ctx.answerCbQuery(
              ` Deposit ${format_deposit_id(deposit_id)} approved`,
              { show_alert: true },
            );
          } else {
            await ctx.answerCbQuery(" Deposit not found or already processed", {
              show_alert: true,
            });
          }
          return;
        }
        if (data.startsWith("admin_decline_dep:")) {
          const deposit_id = data.split(":")[1];
          pending_decline[`dep_${deposit_id}`] = true;
          await sendNewMessage(
            ctx,
            `${EMOJI_INFO} Reply to this message with the reason for declining deposit ${format_deposit_id(deposit_id)}:`,
          );
          await report_event(
            bot,
            `${EMOJI_CROSS} <b>Deposit Declined</b> (pending reason)\n Deposit: <code>${format_deposit_id(deposit_id)}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a>`,
          );
          await ctx.answerCbQuery(
            ` Reply with reason to decline deposit ${format_deposit_id(deposit_id)}`,
            { show_alert: true },
          );
          return;
        }
        if (data.startsWith("admin_approve_wth:")) {
          const w_id = data.split(":")[1];
          const success = await db.approve_withdrawal(w_id, "", userId);
          if (success) {
            const w = await db.get_withdrawal_by_id(w_id);
            try {
              await bot.telegram.sendMessage(
                w.user_id,
                `${EMOJI_SUCCESS} Withdrawal of ${Math.floor(w.amount)} ETB to ${w.account} approved!`,
                { parse_mode: "HTML" },
              );
            } catch (_) {}
            await sendNewMessage(
              ctx,
              `${EMOJI_SUCCESS} Withdrawal ${format_withdrawal_id(w_id)} approved.`,
            );
            await report_event(
              bot,
              `${EMOJI_SUCCESS} <b>Withdrawal Approved</b>\n${EMOJI_USER} User ID: <code>${w.user_id}</code>\n${EMOJI_MONEY} Amount: ${Math.floor(w.amount)} ETB\n${EMOJI_TELEBIRR} Account: ${w.account}\n Withdrawal: <code>${format_withdrawal_id(w_id)}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`,
            );
            await ctx.answerCbQuery(
              ` Withdrawal ${format_withdrawal_id(w_id)} approved`,
              { show_alert: true },
            );
          } else {
            await ctx.answerCbQuery(
              " Withdrawal not found or already processed",
              { show_alert: true },
            );
          }
          return;
        }
        if (data.startsWith("admin_decline_wth:")) {
          const w_id = data.split(":")[1];
          pending_decline[`wth_${w_id}`] = true;
          await report_event(
            bot,
            `${EMOJI_CROSS} <b>Withdrawal Declined</b> (pending reason)\n Withdrawal: <code>${format_withdrawal_id(w_id)}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`,
          );
          await sendNewMessage(
            ctx,
            `${EMOJI_INFO} Reply to this message with the reason for declining withdrawal ${format_withdrawal_id(w_id)}:`,
          );
          await ctx.answerCbQuery(
            ` Reply with reason to decline withdrawal ${format_withdrawal_id(w_id)}`,
            { show_alert: true },
          );
          return;
        }
        if (data === "admin_dashboard") {
          const stats = await db.get_dashboard_stats();
          const dashboard_text =
            `${EMOJI_INFO} <b>Dashboard</b>\n\n` +
            `${EMOJI_USER} Total Users: ${stats.total_users}\n` +
            `${EMOJI_MONEY} Total Deposits: ${stats.total_deposits} (Amount: ${Math.floor(stats.total_deposit_amount)} ETB)\n` +
            `${EMOJI_CLOCK} Pending Deposits: ${stats.pending_deposits}\n` +
            `${EMOJI_MONEY} Total Withdrawals: ${stats.total_withdrawals} (Amount: ${Math.floor(stats.total_withdrawal_amount)} ETB)\n` +
            `${EMOJI_CLOCK} Pending Withdrawals: ${stats.pending_withdrawals}\n` +
            `${EMOJI_ORDER} Total Orders: ${stats.total_orders}\n` +
            `${EMOJI_MONEY} Today's Revenue: ${Math.floor(stats.revenue_today)} ETB\n` +
            `${EMOJI_INFO} Maintenance: ${appSettings.MAINTENANCE_MODE ? "ON" : "OFF"}`;
          await sendNewMessage(ctx, dashboard_text, {
            reply_markup: get_admin_keyboard(),
          });
          return;
        }
        if (data === "admin_deposits") {
          const pending = await db.get_pending_deposits();
          if (!pending.length) {
            await sendNewMessage(ctx, `${EMOJI_INFO} No pending deposits.`, {
              reply_markup: get_admin_keyboard(),
            });
            return;
          }
          let text = `${EMOJI_MONEY} <b>Pending Deposits</b>\n\n`;
          for (const dep of pending) {
            text += ` <code>${format_deposit_id(dep.id)}</code> | User: ${dep.user_id}\nAmount: ${Math.floor(dep.amount)} ETB | Method: ${dep.method}\nDate: ${(dep.created_at || "").slice(0, 10)}\n\n`;
          }
          const keyboard = pending.map((dep) => [
            {
              text: `Approve ${format_deposit_id(dep.id)}`,
              callback_data: `admin_approve_dep:${dep.id}`,
            },
            {
              text: `Decline ${format_deposit_id(dep.id)}`,
              callback_data: `admin_decline_dep:${dep.id}`,
            },
          ]);
          keyboard.push([{ text: "🔙 Back", callback_data: "admin_back" }]);
          await sendNewMessage(ctx, text, {
            reply_markup: { inline_keyboard: keyboard },
          });
          return;
        }
        if (data === "admin_withdrawals") {
          const pending = await db.get_pending_withdrawals();
          if (!pending.length) {
            await sendNewMessage(ctx, `${EMOJI_INFO} No pending withdrawals.`, {
              reply_markup: get_admin_keyboard(),
            });
            return;
          }
          let text = `${EMOJI_MONEY} <b>Pending Withdrawals</b>\n\n`;
          for (const w of pending) {
            text += ` <code>${format_withdrawal_id(w.id)}</code> | User: ${w.user_id}\nAmount: ${Math.floor(w.amount)} ETB | Account: ${w.account}\nNickname: ${w.nickname} | Fee: ${Math.floor(w.fee || 0)} ETB\nDate: ${(w.created_at || "").slice(0, 10)}\n\n`;
          }
          const keyboard = pending.map((w) => [
            {
              text: `Approve ${format_withdrawal_id(w.id)}`,
              callback_data: `admin_approve_wth:${w.id}`,
            },
            {
              text: `Decline ${format_withdrawal_id(w.id)}`,
              callback_data: `admin_decline_wth:${w.id}`,
            },
          ]);
          keyboard.push([{ text: "🔙 Back", callback_data: "admin_back" }]);
          await sendNewMessage(ctx, text, {
            reply_markup: { inline_keyboard: keyboard },
          });
          return;
        }
        if (data === "admin_promo") {
          await sendNewMessage(
            ctx,
            `${EMOJI_MONEY} <b>Promo Codes Management</b>`,
            { reply_markup: get_admin_promo_keyboard() },
          );
          return;
        }
        if (data === "admin_promo_create") {
          session.state = STATE_ADMIN_CREATE_CODE;
          await sendNewMessage(
            ctx,
            `${EMOJI_ADD} <b>Create Promo Code</b>\n\nFormat: <code>amount [max_uses] [code]</code>`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_back" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_promo_list") {
          const codes = await db.list_promo_codes();
          let text;
          if (!codes.length) text = `${EMOJI_INFO} No active promo codes.`;
          else {
            text = `${EMOJI_MONEY} <b>Active Promo Codes</b>\n\n`;
            for (const c of codes)
              text += `<code>${c.code}</code>: ${Math.floor(c.amount)} ETB | ${c.used_count}/${c.max_uses} used\n`;
          }
          await sendNewMessage(ctx, text, {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🔙 Back", callback_data: "admin_back" }],
              ],
            },
          });
          return;
        }
        if (data === "admin_promo_delete") {
          session.state = STATE_ADMIN_DELETE_CODE;
          await sendNewMessage(
            ctx,
            `${EMOJI_DELETE} <b>Delete Promo Code</b>\n\nReply with the code (or use /delcode):`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_back" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_broadcast") {
          session.state = STATE_ADMIN_BROADCAST;
          await sendNewMessage(
            ctx,
            `${EMOJI_MEGAPHONE} <b>Broadcast Message</b>\n\nReply with the message you want to send to all users:`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_back" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_referral") {
          session.state = STATE_ADMIN_REFERRAL_INPUT;
          await sendNewMessage(
            ctx,
            `${EMOJI_USER} <b>Referral Lookup</b>\n\nEnter the user's Telegram ID:`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_back" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_search_by_id") {
          await sendNewMessage(
            ctx,
            `${EMOJI_SEARCH} <b>Search by ID</b>\n\nSelect the type:`,
            { reply_markup: get_search_by_id_keyboard() },
          );
          return;
        }
        if (data.startsWith("admin_search_id:")) {
          const search_type = data.split(":")[1];
          session.data.admin_search_type = search_type;
          session.state = STATE_ADMIN_SEARCH_BY_ID;
          await sendNewMessage(
            ctx,
            `${EMOJI_SEARCH} <b>Search ${search_type.toUpperCase()}</b>\n\nEnter the ID (any format):`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_search_by_id" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_settings") {
          await sendNewMessage(
            ctx,
            `${EMOJI_SETTINGS} <b>Settings & Tools</b>`,
            { reply_markup: get_admin_settings_keyboard() },
          );
          return;
        }
        if (data === "admin_user_manage") {
          await sendNewMessage(ctx, `${EMOJI_USER} <b>User Management</b>`, {
            reply_markup: get_user_manage_keyboard(),
          });
          return;
        }
        if (data === "admin_ban") {
          session.state = STATE_ADMIN_BAN;
          await sendNewMessage(
            ctx,
            `${EMOJI_BAN} <b>Ban User</b>\n\nEnter the user's Telegram ID:`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_user_manage" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_unban") {
          session.state = STATE_ADMIN_UNBAN;
          await sendNewMessage(
            ctx,
            `${EMOJI_UNBAN} <b>Unban User</b>\n\nEnter the user's Telegram ID:`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_user_manage" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_set_balance") {
          session.state = STATE_ADMIN_SETBALANCE;
          await sendNewMessage(
            ctx,
            `${EMOJI_MONEY} <b>Set Balance</b>\n\nEnter: <code>user_id amount</code>`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_user_manage" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_game_products") {
          let games = [];
          try {
            const gamesRes = await api_client.get_games();
            games =
              gamesRes && gamesRes.success
                ? gamesRes.games || gamesRes.data || []
                : [];
          } catch (e) {
            logger.error(`Failed to fetch games for admin: ${e.message}`);
          }
          session.data.admin_games = games;
          const buttons = [];
          for (const game of games) {
            const code = normalize_game_code(game);
            const name = normalize_game_name(game);
            if (
              !code ||
              code.toLowerCase().includes("telegram") ||
              name.toLowerCase().includes("telegram")
            )
              continue;
            const lowerName = name.toLowerCase();
            const lowerCode = code.toLowerCase();
            if (
              lowerCode.includes("pubg") ||
              lowerName.includes("pubg") ||
              lowerCode.includes("freefire") ||
              lowerName.includes("free fire") ||
              lowerName.includes("freefire")
            ) {
              buttons.push([
                {
                  text: game_display_name(game),
                  callback_data: `admin_game_select:${code}`,
                },
              ]);
            }
          }
          buttons.push([
            {
              text: "Global Games Markup",
              callback_data: "admin_global_markup",
            },
          ]);
          buttons.push([{ text: "🔙 Back", callback_data: "admin_settings" }]);
          await sendNewMessage(
            ctx,
            `${EMOJI_GAME} <b>Game Products Management</b>\n\nSelect a game to manage specifically, or set a Global Markup for all other games:`,
            { reply_markup: { inline_keyboard: buttons } },
          );
          return;
        }
        if (data === "admin_global_markup") {
          session.state = STATE_ADMIN_GLOBAL_MARKUP;
          await sendNewMessage(
            ctx,
            `${EMOJI_MONEY} <b>Global Games Markup</b>\n\nCurrent global markup: <b>${appSettings.DEFAULT_MARKUP_PERCENT}%</b>\n\nEnter new global markup percentage (e.g., 15):`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_game_products" }],
                ],
              },
            },
          );
          return;
        }
        if (data.startsWith("admin_game_select:")) {
          const code = data.slice("admin_game_select:".length);
          const game = (session.data.admin_games || []).find(
            (g) => normalize_game_code(g) === code,
          );
          const name = game ? game_display_name(game) : code;
          session.data.admin_game_code = code;
          session.data.admin_game_name = name;
          const currentMarkup = await db.get_game_markup(code);
          const kb = {
            inline_keyboard: [
              [
                {
                  text: "Set Game Markup",
                  callback_data: "admin_game_set_markup",
                },
              ],
              [
                {
                  text: "Set Package Price",
                  callback_data: "admin_game_set_price",
                },
              ],
              [{ text: "🔙 Back", callback_data: "admin_game_products" }],
            ],
          };
          await sendNewMessage(
            ctx,
            `${EMOJI_GAME} <b>${name}</b>\n\nCurrent markup: <b>${currentMarkup}%</b>\n\nChoose what to manage:`,
            { reply_markup: kb },
          );
          return;
        }
        if (data === "admin_game_set_markup") {
          session.state = STATE_ADMIN_GAME_MARKUP;
          const code = session.data.admin_game_code;
          const current = await db.get_game_markup(code);
          await sendNewMessage(
            ctx,
            `Enter markup percentage for <b>${session.data.admin_game_name}</b>.\n\nCurrent: <b>${current}%</b>\nExample: <code>15</code>`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "🔙 Back",
                      callback_data: `admin_game_select:${code}`,
                    },
                  ],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_game_set_price") {
          const code = session.data.admin_game_code;
          try {
            const res = await api_client.get_game_catalogue(code);
            const packages =
              res && res.success ? res.catalogues || res.data || [] : [];
            session.data.admin_game_packages = packages;
            const overrides = new Map();
            for (const ov of await db.get_all_product_overrides()) {
              if (ov.game_code === code && ov.price_override != null)
                overrides.set(
                  String(ov.product_id || ov.id),
                  parseFloat(ov.price_override),
                );
            }
            const markup = await db.get_game_markup(code);
            const buttons = [];
            packages.forEach((pkg, idx) => {
              const id = String(pkg.id || pkg.code || pkg.name || idx);
              const base = parseFloat(
                pkg.unit_price ?? pkg.price ?? pkg.amount ?? pkg.cost ?? 0,
              );
              const price = overrides.has(id)
                ? overrides.get(id)
                : api_price_to_birr(base, markup);
              buttons.push([
                {
                  text: `${pkg.display_name || pkg.name || pkg.title || id} - ${Math.floor(price)} ETB`,
                  callback_data: `admin_game_price:${idx}`,
                },
              ]);
            });
            buttons.push([
              { text: "🔙 Back", callback_data: `admin_game_select:${code}` },
            ]);
            await sendNewMessage(
              ctx,
              `${EMOJI_MONEY} <b>${session.data.admin_game_name} Packages</b>\n\nSelect a package:`,
              { reply_markup: { inline_keyboard: buttons } },
            );
          } catch (e) {
            await sendNewMessage(
              ctx,
              `${EMOJI_CROSS} Failed to load packages.\n\n${e.message}`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "🔙 Back",
                        callback_data: `admin_game_select:${code}`,
                      },
                    ],
                  ],
                },
              },
            );
          }
          return;
        }
        if (data.startsWith("admin_game_price:")) {
          const idx = parseInt(data.split(":")[1], 10);
          const pkg = (session.data.admin_game_packages || [])[idx];
          if (!pkg) {
            await sendNewMessage(ctx, `${EMOJI_CROSS} Package unavailable.`);
            return;
          }
          session.data.admin_game_price_index = idx;
          session.data.admin_game_price_product_id = String(
            pkg.id || pkg.code || pkg.name || idx,
          );
          session.state = STATE_ADMIN_GAME_PRICE_INPUT;
          const name = pkg.display_name || pkg.name || pkg.title || "Package";
          await sendNewMessage(
            ctx,
            `Enter the selling price in ETB for <b>${name}</b>.\nEnter <code>0</code> to remove the override.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_game_set_price" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_set_product_price") {
          const kb = {
            inline_keyboard: [
              [
                {
                  text: "⭐️ Telegram Stars",
                  callback_data: "admin_price_type:stars",
                },
              ],
              [
                {
                  text: "💎 Telegram Premium",
                  callback_data: "admin_price_type:premium",
                },
              ],
              [{ text: "🔙 Back", callback_data: "admin_back" }],
            ],
          };
          await sendNewMessage(ctx, "Select product type to set price:", {
            reply_markup: kb,
          });
          return;
        }
        if (data.startsWith("admin_price_type:")) {
          const ptype = data.split(":")[1];
          session.data.admin_price_type = ptype;
          let packages;
          if (ptype === "stars")
            packages = await catalog_service.get_telegram_stars_packages();
          else packages = await catalog_service.get_telegram_premium_plans();
          if (!packages.length) {
            await sendNewMessage(ctx, "No packages found.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_back" }],
                ],
              },
            });
            return;
          }
          const kb_buttons = [];
          for (const pkg of packages) {
            const name = pkg.display_name || pkg.name || pkg.title || "Package";
            let price = pkg._override_price;
            if (price === undefined || price === null) {
              const api_price = parseFloat(
                pkg.unit_price || pkg.price || pkg.amount || 0.0,
              );
              const markup =
                ptype === "stars"
                  ? await catalog_service.get_telegram_stars_markup()
                  : await catalog_service.get_telegram_premium_markup();
              price = api_price_to_birr(api_price, markup, true);
            }
            const product_id = pkg.id || pkg.code || pkg.name;
            kb_buttons.push([
              {
                text: `${name} - ${Math.floor(price)} ETB`,
                callback_data: `admin_price_select:${product_id}`,
              },
            ]);
          }
          kb_buttons.push([{ text: "🔙 Back", callback_data: "admin_back" }]);
          await sendNewMessage(ctx, "Select package to set price:", {
            reply_markup: { inline_keyboard: kb_buttons },
          });
          return;
        }
        if (data.startsWith("admin_price_select:")) {
          const product_id = data.split(":")[1];
          session.data.admin_price_product_id = product_id;
          session.state = STATE_ADMIN_SET_PRICE_INPUT;
          await sendNewMessage(
            ctx,
            "Enter new price in ETB for this product (or 0 to remove override):",
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Cancel", callback_data: "admin_back" }],
                ],
              },
            },
          );
          return;
        }
        if (data === "admin_toggle_maintenance") {
          appSettings.MAINTENANCE_MODE = !appSettings.MAINTENANCE_MODE;
          await db.save_setting(
            "maintenance_mode",
            appSettings.MAINTENANCE_MODE ? "1" : "0",
            appSettings,
          );
          await sendNewMessage(
            ctx,
            `${EMOJI_TOGGLE} Maintenance mode has been ${appSettings.MAINTENANCE_MODE ? "ENABLED" : "DISABLED"}.`,
            { reply_markup: get_admin_settings_keyboard() },
          );
          return;
        }
        if (data === "admin_toggle_reports") {
          appSettings.REPORT_EVENTS = !appSettings.REPORT_EVENTS;
          await db.save_setting(
            "report_events",
            appSettings.REPORT_EVENTS ? "1" : "0",
            appSettings,
          );
          await sendNewMessage(
            ctx,
            `${EMOJI_TOGGLE} Reports have been ${appSettings.REPORT_EVENTS ? "ENABLED" : "DISABLED"}.`,
            { reply_markup: get_admin_settings_keyboard() },
          );
          return;
        }
        if (data === "admin_stars_markup") {
          session.state = STATE_ADMIN_STARS_MARKUP;
          await sendNewMessage(
            ctx,
            `${EMOJI_STAR} <b>Set Telegram Stars Markup</b>\n\nCurrent: <b>${Math.floor(appSettings.TELEGRAM_STARS_MARKUP)} ETB</b>\nEnter the fixed markup amount in ETB (e.g., 10) that will be added to the base price.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_settings" }],
                ],
              },
            },
          );
          catalog_service.clear_cache(); /* Force reload */
          await catalog_service.get_telegram_catalogue(true);
          return;
        }
        if (data === "admin_premium_markup") {
          session.state = STATE_ADMIN_PREMIUM_MARKUP;
          await sendNewMessage(
            ctx,
            `${EMOJI_PREMIUM} <b>Set Telegram Premium Markup</b>\n\nCurrent: <b>${Math.floor(appSettings.TELEGRAM_PREMIUM_MARKUP)} ETB</b>\nEnter the fixed markup amount in ETB (e.g., 10) that will be added to the base price.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "admin_settings" }],
                ],
              },
            },
          );
          catalog_service.clear_cache();
          await catalog_service.get_telegram_catalogue(true);
          return;
        }
        if (data === "admin_back") {
          await sendNewMessage(ctx, `${EMOJI_INFO} <b>Admin Panel</b>`, {
            reply_markup: get_admin_keyboard(),
          });
          return;
        }
        if (data === "admin_close") {
          clearUserSession(userId);
          await sendNewMessage(ctx, "Admin panel closed.");
          return;
        }
      }
    } catch (err) {
      logger.error("CRASH IN CALLBACK HANDLER: " + err.stack);
      try {
        await ctx.answerCbQuery(" An error occurred.").catch(() => {});
      } catch (e) {}
    }
  });
  /* ---------- Message Handler ---------- */
  bot.on("message", async (ctx) => {
    try {
      ctx.deleteMessage().catch(() => {});
      const text = ctx.message.text ? ctx.message.text.trim() : "";
      const userId = ctx.from.id;
      const session = getUserSession(userId); /* Admin reply */
      if (ctx.message.reply_to_message && ADMIN_CHAT_IDS.includes(userId)) {
        const keys = Object.keys(pending_decline);
        if (keys.length) {
          const key = keys[keys.length - 1];
          const reason = text || "No reason given";
          if (key.startsWith("dep_")) {
            const depId = key.replace("dep_", "");
            const success = await db.reject_deposit(depId, reason);
            if (success) {
              const deposit = await db.get_deposit_by_id(depId);
              try {
                await bot.telegram.sendMessage(
                  deposit.user_id,
                  `${EMOJI_CROSS} Deposit rejected: ${reason}`,
                  { parse_mode: "HTML" },
                );
              } catch (_) {}
              await sendNewMessage(ctx, `${EMOJI_CROSS} Deposit rejected.`);
            } else {
              await sendNewMessage(ctx, "Failed to reject deposit.");
            }
          } else if (key.startsWith("wth_")) {
            const wId = key.replace("wth_", "");
            const success = await db.reject_withdrawal(wId, reason, userId);
            if (success) {
              const w = await db.get_withdrawal_by_id(wId);
              try {
                await bot.telegram.sendMessage(
                  w.user_id,
                  `${EMOJI_CROSS} Withdrawal of ${Math.floor(w.amount)} ETB rejected: ${reason}`,
                  { parse_mode: "HTML" },
                );
              } catch (_) {}
              await sendNewMessage(ctx, `${EMOJI_CROSS} Withdrawal rejected.`);
            } else {
              await sendNewMessage(ctx, "Failed to reject withdrawal.");
            }
          }
          delete pending_decline[key];
          return;
        }
      }
      if (text === "🎮 Service") {
        if (!(await maintenance_check(ctx))) return;
        if (!(await check_channel_membership(ctx))) return;
        await clear_last_photo(ctx, session);
        session.state = STATE_SERVICE_SELECT;
        await sendNewMessage(ctx, `${EMOJI_GAME} <b>Choose a service:</b>`, {
          reply_markup: get_service_inline_keyboard(),
        });
        return;
      }
      if (text === "📥 Deposit") {
        if (!(await maintenance_check(ctx))) return;
        if (!(await check_channel_membership(ctx))) return;
        await register_user_implicit(ctx, db, bot);
        await clear_last_photo(ctx, session);
        session.state = STATE_DEPOSIT_AMOUNT;
        await sendNewMessage(
          ctx,
          `${EMOJI_DEPOSIT} <b>Choose a deposit method</b>\n\nSelect how you'd like to add funds to your balance.`,
          {
            reply_markup:
              typeof get_deposit_keyboard !== "undefined"
                ? get_deposit_keyboard()
                : get_deposit_inline_keyboard(),
          },
        );
        return;
      }
      if (text === "🛒 My Orders") {
        const orders = await db.get_user_orders(userId, 5);
        let outText;
        if (!orders.length) outText = `${EMOJI_ORDER} <b>No orders yet.</b>`;
        else {
          outText = `${EMOJI_ORDER} <b>Last 5 Orders:</b>\n\n`;
          for (const order of orders) {
            outText +=
              `${EMOJI_ORDER} <b>Order ID:</b> <code>` +
              order.order_id +
              "</code>\n" +
              `${EMOJI_GAME} <b>Product:</b> ` +
              order.game +
              "\n" +
              `${EMOJI_MONEY} <b>Package:</b> ` +
              order.package_name +
              "\n" +
              `${EMOJI_MONEY} <b>Charged:</b> ` +
              Math.floor(order.charged_price) +
              " ETB\n" +
              `${EMOJI_SUCCESS} <b>Status:</b> ` +
              order.status +
              "\n" +
              `${EMOJI_CALENDAR} <b>Date:</b> ` +
              (order.created_at || "").slice(0, 10) +
              "\n" +
              "━━━━━━━━━━━━━━━━━━━━━━\n";
          }
        }
        await sendNewMessage(ctx, outText);
        return;
      }
      if (text === "📤 Withdraw") {
        if (!(await maintenance_check(ctx))) return;
        if (!(await check_channel_membership(ctx))) return;
        await register_user_implicit(ctx, db, bot);
        await clear_last_photo(ctx, session);
        const profile = await db.get_user_profile(userId);
        const available =
          (profile.balance || 0) - (profile.referral_balance || 0);
        if (available < MIN_WITHDRAW_BIRR) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Minimum withdrawal is ` +
              MIN_WITHDRAW_BIRR +
              " ETB.\nYour withdrawable balance (non-referral) is " +
              Math.floor(available) +
              " ETB.",
          );
          return;
        }
        session.state = STATE_WITHDRAW_ACCOUNT;
        await sendNewMessage(
          ctx,
          `${EMOJI_WITHDRAW} <b>Withdraw via Telebirr</b>\n\nEnter your Telebirr account number:`,
        );
        return;
      }
      if (text === "🎧 Support") {
        clearUserSession(userId);
        const help_msg =
          `${EMOJI_SUPPORT} <b>Support & Help</b>\n\n` +
          "<b> Quick start:</b>\n" +
          "1. Use the <b>persistent keyboard</b> buttons to navigate.\n" +
          "2. Most flows guide you step by step — just follow the prompts.\n\n" +
          `${EMOJI_MONEY} <b>Deposit (Telebirr):</b>\n` +
          "1. Tap <b> Deposit</b>.\n" +
          "2. Choose <b>Telebirr</b>.\n" +
          "3. Enter the amount you want to deposit.\n" +
          "4. Pay the exact amount to the provided account.\n" +
          "5. Enter the transaction ID/Reference to verify.\n\n" +
          `${EMOJI_GAME} <b>Buy Service (Telegram / Games):</b>\n` +
          "1. Tap <b> Service</b>.\n" +
          "2. Select a category and item.\n" +
          "3. Enter your account/player ID.\n" +
          "4. Confirm the purchase.\n\n" +
          `${EMOJI_INFO} <b>Need human help?</b>\n` +
          "If you encounter any issues, contact the admin directly.\n" +
          "<b>Admin Contact:</b> @Admin_here\n\n";
        await sendNewMessage(ctx, help_msg, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Close", callback_data: "cancel_action" }],
            ],
          },
        });
        return;
      }
      if (text === "🤝 Referral") {
        const stats = await db.get_referral_stats(userId);
        const total = stats.count || 0;
        const total_reward = stats.total_earned || 0;
        const me = await bot.telegram.getMe();
        const ref_link = "https://t.me/" + me.username + "?start=ref" + userId;
        const msgText =
          `${EMOJI_USER} <b>Your Referral Stats</b>\n\n` +
          `${EMOJI_USER} <b>Your Link:</b> <code>` +
          ref_link +
          "</code>\n" +
          `${EMOJI_USER} <b>Total Invites:</b> ` +
          total +
          "\n" +
          `${EMOJI_MONEY} <b>Total Earned:</b> ` +
          Math.floor(total_reward) +
          " ETB\n" +
          `${EMOJI_MONEY} <b>Reward per invite:</b> ` +
          REFERRAL_REWARD +
          " ETB (instant, not withdrawable)\n\n" +
          "<i>Share your link. Each new user who joins gives you an instant reward!</i>";
        await sendNewMessage(ctx, msgText);
        return;
      }
      if (text === "🎁 Redeem") {
        session.state = STATE_PROFILE_REDEEM;
        await sendNewMessage(
          ctx,
          `${EMOJI_MONEY} <b>Enter your promo code:</b>`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "❌ Cancel", callback_data: "cancel_action" }],
              ],
            },
          },
        );
        return;
      }
      if (session.state === STATE_ADMIN_BROADCAST) {
        if (["cancel", "back"].includes(text.toLowerCase())) {
          session.state = STATE_ADMIN_MAIN;
          await sendNewMessage(ctx, `${EMOJI_CANCEL} Cancelled.`, {
            reply_markup: get_admin_keyboard(),
          });
          return;
        }
        const users = await db.get_all_users();
        let success = 0;
        for (const uid of users) {
          try {
            await bot.telegram.sendMessage(uid, text);
            success++;
          } catch (_) {}
        }
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          `${EMOJI_SUCCESS} Broadcast sent to ${success}/${users.length} users.`,
          { reply_markup: get_admin_keyboard() },
        );
        await report_event(
          bot,
          `${EMOJI_MEGAPHONE} <b>Broadcast Sent</b>\n${EMOJI_MAIL} Delivered: ${success}/${users.length}\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)\n\n<b>Message:</b>\n${text.slice(0, 600)}`,
        );
        return;
      }
      if (session.state === STATE_ADMIN_CREATE_CODE) {
        const args = text.split(/\s+/);
        const amount = parseFloat(args[0]);
        if (isNaN(amount)) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Invalid amount.`);
          return;
        }
        const max_uses = args.length > 1 ? parseInt(args[1], 10) : 1;
        const code =
          args.length > 2
            ? args[2].toUpperCase()
            : uuidv4().slice(0, 8).toUpperCase();
        const success = await db.create_promo_code(code, amount, max_uses);
        session.state = STATE_ADMIN_MAIN;
        if (success) {
          await sendNewMessage(
            ctx,
            `${EMOJI_SUCCESS} Code <b>${code}</b> created for ${Math.floor(amount)} ETB, uses: ${max_uses}`,
            { reply_markup: get_admin_keyboard() },
          );
          await report_event(
            bot,
            `${EMOJI_MONEY} <b>Promo Code Created</b>\n${EMOJI_INFO} Code: <code>${code}</code>\n${EMOJI_MONEY} Amount: ${Math.floor(amount)} ETB\n${EMOJI_INFO} Max uses: ${max_uses}\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a>`,
          );
        } else {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Code already exists.`, {
            reply_markup: get_admin_keyboard(),
          });
        }
        return;
      }
      if (session.state === STATE_ADMIN_DELETE_CODE) {
        const code = text.toUpperCase();
        await db.delete_promo_code(code);
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          `${EMOJI_SUCCESS} Code <b>${code}</b> deleted.`,
          { reply_markup: get_admin_keyboard() },
        );
        await report_event(
          bot,
          `${EMOJI_MONEY} <b>Promo Code Deleted</b>\n${EMOJI_INFO} Code: <code>${code}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a>`,
        );
        return;
      }
      if (session.state === STATE_ADMIN_REFERRAL_INPUT) {
        if (["cancel", "back"].includes(text.toLowerCase())) {
          session.state = STATE_ADMIN_MAIN;
          await sendNewMessage(ctx, `${EMOJI_CANCEL} Cancelled.`, {
            reply_markup: get_admin_keyboard(),
          });
          return;
        }
        const targetUid = parseInt(text, 10);
        if (isNaN(targetUid)) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Invalid ID.`);
          return;
        }
        const [total, rewarded, total_reward] =
          await db.get_referral_stats(targetUid);
        const referrals = await db.get_referral_list(targetUid);
        let msg = `${EMOJI_INFO} <b>Referral Stats for ID <code>${targetUid}</code></b>\n\n`;
        msg += `${EMOJI_USER} Total invited: <b>${total}</b>\n`;
        msg += `${EMOJI_MONEY} Rewarded: <b>${rewarded}</b>\n`;
        msg += `${EMOJI_MONEY} Total earned: <b>${Math.floor(total_reward)} ETB</b>\n\n`;
        if (referrals.length) {
          msg += "<b>Recent invites:</b>\n";
          for (const r of referrals) {
            const status_icon = r.reward_given ? EMOJI_SUCCESS : EMOJI_CLOCK;
            msg += ` ${status_icon} <code>${r.referred_id}</code> (${r.status}) – ${(r.created_at || "").slice(0, 10)}\n`;
          }
        } else {
          msg += "<i>No invites yet.</i>";
        }
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(ctx, msg, { reply_markup: get_admin_keyboard() });
        return;
      }
      if (session.state === STATE_ADMIN_BAN) {
        const targetUid = parseInt(text, 10);
        if (isNaN(targetUid)) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Invalid ID.`);
          return;
        }
        await db.ban_user(targetUid);
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          `${EMOJI_BAN} User <code>${targetUid}</code> banned.`,
          { reply_markup: get_admin_keyboard() },
        );
        await report_event(
          bot,
          `${EMOJI_BAN} <b>User Banned</b>\n${EMOJI_USER} User ID: <code>${targetUid}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`,
        );
        return;
      }
      if (session.state === STATE_ADMIN_UNBAN) {
        const targetUid = parseInt(text, 10);
        if (isNaN(targetUid)) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Invalid ID.`);
          return;
        }
        await db.unban_user(targetUid);
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          `${EMOJI_UNBAN} User <code>${targetUid}</code> unbanned.`,
          { reply_markup: get_admin_keyboard() },
        );
        await report_event(
          bot,
          `${EMOJI_UNBAN} <b>User Unbanned</b>\n${EMOJI_USER} User ID: <code>${targetUid}</code>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`,
        );
        return;
      }
      if (session.state === STATE_ADMIN_SETBALANCE) {
        const parts = text.split(/\s+/);
        if (parts.length !== 2) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Format: user_id amount`);
          return;
        }
        const targetUid = parseInt(parts[0], 10);
        const amount = parseFloat(parts[1]);
        if (isNaN(targetUid) || isNaN(amount)) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} Invalid numbers.`);
          return;
        }
        await db.set_balance(targetUid, amount);
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          `${EMOJI_MONEY} Balance of <code>${targetUid}</code> set to <b>${Math.floor(amount)} ETB</b>.`,
          { reply_markup: get_admin_keyboard() },
        );
        await report_event(
          bot,
          `${EMOJI_MONEY} <b>Balance Set by Admin</b>\n${EMOJI_USER} User ID: <code>${targetUid}</code>\n${EMOJI_MONEY} New balance: <b>${Math.floor(amount)} ETB</b>\n${EMOJI_USER} By admin: <a href="tg://user?id=${userId}">${ctx.from.first_name || "Admin"}</a> (ID: <code>${userId}</code>)`,
        );
        return;
      }
      if (session.state === STATE_ADMIN_STARS_MARKUP) {
        const amount = parseFloat(text);
        if (isNaN(amount) || amount < 0) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Invalid number. Please enter a valid ETB amount (>= 0).`,
          );
          return;
        }
        appSettings.TELEGRAM_STARS_MARKUP = amount;
        await db.save_setting(
          "telegram_stars_markup",
          String(amount),
          appSettings,
        );
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          `${EMOJI_SUCCESS} Telegram Stars markup set to <b>${Math.floor(amount)} ETB</b>.`,
          { reply_markup: get_admin_keyboard() },
        );
        catalog_service.clear_cache();
        await catalog_service.get_telegram_catalogue(true);
        return;
      }
      if (session.state === STATE_ADMIN_PREMIUM_MARKUP) {
        const amount = parseFloat(text);
        if (isNaN(amount) || amount < 0) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Invalid number. Please enter a valid ETB amount (>= 0).`,
          );
          return;
        }
        appSettings.TELEGRAM_PREMIUM_MARKUP = amount;
        await db.save_setting(
          "telegram_premium_markup",
          String(amount),
          appSettings,
        );
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          `${EMOJI_SUCCESS} Telegram Premium markup set to <b>${Math.floor(amount)} ETB</b>.`,
          { reply_markup: get_admin_keyboard() },
        );
        catalog_service.clear_cache();
        await catalog_service.get_telegram_catalogue(true);
        return;
      }
      if (session.state === "STATE_SEARCH_GAME") {
        const query = text.toLowerCase();
        const games = session.data.available_games || [];
        const results = games.filter(
          (g) =>
            normalize_game_name(g).toLowerCase().includes(query) ||
            normalize_game_code(g).toLowerCase().includes(query),
        );
        if (!results.length) {
          await sendNewMessage(
            ctx,
            " No games found matching your search. Try another name:",
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Cancel", callback_data: "cancel_action" }],
                ],
              },
            },
          );
          return;
        }
        const rows = [];
        for (const game of results.slice(0, 10)) {
          rows.push([
            {
              text: game_display_name(game),
              callback_data: `svc_game:${normalize_game_code(game)}`,
            },
          ]);
        }
        rows.push([
          { text: "🔙 Back", callback_data: "svc_games", style: "danger" },
        ]);
        session.state = STATE_IDLE;
        await sendNewMessage(ctx, " <b>Search Results:</b>", {
          reply_markup: { inline_keyboard: rows },
        });
        return;
      }
      if (session.state === STATE_ADMIN_SET_PRICE_INPUT) {
        const newPrice = parseFloat(text);
        if (isNaN(newPrice)) {
          await sendNewMessage(
            ctx,
            " Invalid number. Please enter a valid amount (e.g., 150).",
          );
          return;
        }
        const productId = session.data.admin_price_product_id;
        const ptype = session.data.admin_price_type || "stars";
        if (newPrice <= 0) {
          await db.set_product_price_override(productId, null, ptype);
          await sendNewMessage(ctx, " Price override removed for product.");
        } else {
          await db.set_product_price_override(productId, newPrice, ptype);
          await sendNewMessage(
            ctx,
            ` Price set to ${Math.floor(newPrice)} ETB for product.`,
          );
        }
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(ctx, "Returning to admin panel.", {
          reply_markup: get_admin_keyboard(),
        });
        catalog_service.clear_cache();
        await catalog_service.get_telegram_catalogue(true);
        return;
      }
      if (session.state === STATE_ADMIN_GLOBAL_MARKUP) {
        const amount = parseFloat(text);
        if (!Number.isFinite(amount) || amount < 0) {
          await sendNewMessage(
            ctx,
            "Invalid markup. Enter a number 0 or greater.",
          );
          return;
        }
        appSettings.DEFAULT_MARKUP_PERCENT = amount;
        await db.save_setting("DEFAULT_MARKUP_PERCENT", amount, appSettings);
        catalog_service.clear_cache();
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          `${EMOJI_SUCCESS} Global Games Markup updated to <b>${amount}%</b>.`,
          { reply_markup: get_admin_keyboard() },
        );
        return;
      }
      if (session.state === STATE_ADMIN_GAME_MARKUP) {
        const amount = parseFloat(text);
        if (!Number.isFinite(amount) || amount < 0) {
          await sendNewMessage(
            ctx,
            "Invalid markup. Enter a number 0 or greater.",
          );
          return;
        }
        await db.set_game_markup(session.data.admin_game_code, amount);
        catalog_service.clear_cache();
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          `${EMOJI_SUCCESS} ${session.data.admin_game_name} markup set to <b>${amount}%</b>.`,
          { reply_markup: get_admin_keyboard() },
        );
        return;
      }
      if (session.state === STATE_ADMIN_GAME_PRICE_INPUT) {
        const price = parseFloat(text);
        if (!Number.isFinite(price) || price < 0) {
          await sendNewMessage(
            ctx,
            "Invalid price. Enter 0 or a positive ETB amount.",
          );
          return;
        }
        await db.set_game_product_price_override(
          session.data.admin_game_code,
          session.data.admin_game_price_product_id,
          price <= 0 ? null : price,
        );
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(
          ctx,
          price <= 0
            ? `${EMOJI_SUCCESS} Game package price override removed.`
            : `${EMOJI_SUCCESS} Game package price set to <b>${Math.floor(price)} ETB</b>.`,
          { reply_markup: get_admin_keyboard() },
        );
        return;
      }
      if (session.state === STATE_ADMIN_SEARCH_BY_ID) {
        const search_type = session.data.admin_search_type;
        let result_text = "";
        if (search_type === "order") {
          let order = null;
          if (/^\d+$/.test(text))
            order = await db.get_order_by_numeric_id(parseInt(text, 10));
          if (!order) order = await db.get_order_by_id(text);
          if (order) {
            const uname =
              (await db.get_username(order.telegram_id)) || "Unknown";
            result_text =
              `${EMOJI_ORDER} <b>Order Details</b>\n\n` +
              ` Order ID: <code>${order.order_id}</code>\n` +
              `${EMOJI_USER} User: <code>${order.telegram_id}</code> (@${uname})\n` +
              `${EMOJI_GAME} Game: ${order.game}\n` +
              `${EMOJI_ORDER} Package: ${order.package_name}\n` +
              `${EMOJI_MONEY} Charged: ${Math.floor(order.charged_price)} ETB\n` +
              `${EMOJI_SUCCESS} Status: ${order.status}\n` +
              `${EMOJI_CALENDAR} Created: ${order.created_at}`;
          } else result_text = `${EMOJI_CROSS} Order not found.`;
        } else if (search_type === "deposit") {
          let deposit = null;
          if (text.toUpperCase().startsWith("EX")) {
            const parsed = parse_formatted_id(text, "deposit");
            if (parsed) deposit = await db.get_deposit_by_id(parsed);
          }
          if (!deposit && /^\d+$/.test(text)) deposit = await db.get_deposit_by_id(text);
          
          if (deposit) {
            const uname = (await db.get_username(deposit.user_id)) || "Unknown";
            result_text =
              `${EMOJI_MONEY} <b>Deposit Details</b>\n\n` +
              ` Deposit ID: <code>${format_deposit_id(deposit.id)}</code>\n` +
              `${EMOJI_USER} User: <code>${deposit.user_id}</code> (@${uname})\n` +
              `${EMOJI_MONEY} Amount: ${Math.floor(deposit.amount)} ${deposit.currency}\n` +
              `${EMOJI_TELEBIRR} Method: ${deposit.method}\n` +
              `${EMOJI_SUCCESS} Status: ${deposit.status}\n` +
              `${EMOJI_CALENDAR} Created: ${deposit.created_at}\n` +
              `${EMOJI_INFO} Admin Note: ${deposit.admin_note || "N/A"}`;
          } else result_text = `${EMOJI_CROSS} Deposit not found.`;
        } else if (search_type === "withdrawal") {
          let withdrawal = await db.get_withdrawal_by_id(text);
          if (!withdrawal && text.toUpperCase().startsWith("EX")) {
            const parsed = parse_formatted_id(text, "withdrawal");
            if (parsed) withdrawal = await db.get_withdrawal_by_id(parsed);
          }
          if (!withdrawal && /^\d+$/.test(text)) {
            withdrawal = await db.get_withdrawal_by_id(text);
            if (!withdrawal) withdrawal = await db.get_withdrawal_by_id(`WTH-${text}`);
          }
          if (withdrawal && Object.keys(withdrawal).length) {
            const uname =
              (await db.get_username(withdrawal.user_id)) || "Unknown";
            result_text =
              `${EMOJI_MONEY} <b>Withdrawal Details</b>\n\n` +
              ` Withdrawal ID: <code>${format_withdrawal_id(withdrawal.id)}</code>\n` +
              `${EMOJI_USER} User: <code>${withdrawal.user_id}</code> (@${uname})\n` +
              `${EMOJI_MONEY} Amount: ${Math.floor(withdrawal.amount)} ${withdrawal.currency}\n` +
              `${EMOJI_TELEBIRR} Account: ${withdrawal.account}\n` +
              `${EMOJI_USER} Nickname: ${withdrawal.nickname}\n` +
              `${EMOJI_MONEY} Fee: ${Math.floor(withdrawal.fee || 0)} ETB\n` +
              `${EMOJI_SUCCESS} Status: ${withdrawal.status}\n` +
              `${EMOJI_CALENDAR} Created: ${withdrawal.created_at}\n` +
              `${EMOJI_INFO} Admin Note: ${withdrawal.admin_note || "N/A"}`;
          } else result_text = `${EMOJI_CROSS} Withdrawal not found.`;
        }
        session.state = STATE_ADMIN_MAIN;
        await sendNewMessage(ctx, result_text, {
          reply_markup: get_admin_keyboard(),
        });
        return;
      }
      if (session.state === STATE_PROFILE_REDEEM) {
        if (!(await maintenance_check(ctx))) return;
        if (!(await check_channel_membership(ctx))) return;
        const [success, amount, errMsg] = await db.use_promo_code(text, userId);
        clearUserSession(userId);
        if (!success) {
          await sendNewMessage(ctx, `${EMOJI_CROSS} ${errMsg}`, {
            reply_markup: get_main_keyboard(),
          });
          return;
        }
        await db.update_balance(userId, amount);
        await sendNewMessage(
          ctx,
          `${EMOJI_SUCCESS} Promo code accepted! <b>${Math.floor(amount)} ETB</b> added to your balance.`,
          { reply_markup: get_main_keyboard() },
        );
        await report_event(
          bot,
          `${EMOJI_MONEY} <b>Promo Code Redeemed</b>\n${EMOJI_USER} <a href="tg://user?id=${userId}">${ctx.from.first_name || "User"}</a> (ID: <code>${userId}</code>)\n${EMOJI_INFO} Code: <code>${text.toUpperCase()}</code>\n${EMOJI_MONEY} Amount added: ${Math.floor(amount)} ETB`,
        );
        return;
      }
      if (session.state === STATE_ENTER_UID) {
        if (!(await maintenance_check(ctx))) return;
        const flowType = session.data.flow_type || "telegram";
        let playerId = text.trim();
        if (
          !playerId ||
          (flowType === "telegram" && !playerId.startsWith("@"))
        ) {
          await sendNewMessage(
            ctx,
            flowType === "telegram"
              ? `${EMOJI_WARNING} Invalid username. Must start with @.`
              : `${EMOJI_WARNING} Please enter a valid player ID.`,
          );
          return;
        }
        session.data.player_id = playerId;
        session.data.nickname = playerId;
        const gameCode =
          session.data.game_code ||
          session.data.telegram_game_code ||
          "Telegram";
        await sendOrEdit(
          ctx,
          flowType === "telegram"
            ? "Resolving Telegram username..."
            : "Verifying player ID...",
        );
        let resolvedName = playerId.replace(/^@/, "");
        try {
          const check = await api_client.check_player_id(
            gameCode,
            playerId,
            session.data.server_id || null,
            session.data.charname || null,
          );
          let valid = false;
          if (check) {
            if (
              check.valid === false ||
              check.valid === "invalid" ||
              check.valid === "false" ||
              check.success === false ||
              check.success === "false" ||
              check.error
            ) {
              valid = false;
            } else if (
              check.valid === true ||
              check.valid === "valid" ||
              check.valid === "true" ||
              check.success === true ||
              check.success === "true" ||
              check.success === "ok"
            ) {
              valid = true;
            } else if (
              check.name ||
              check.nickname ||
              check.username ||
              check.player_name ||
              (check.user && check.user.name)
            ) {
              valid = true;
            } else if (
              check.success === undefined &&
              check.valid === undefined &&
              check.error === undefined &&
              check.message === undefined &&
              Object.keys(check).length > 0
            ) {
              valid = true; /* Assuming player data */
            }
          }
          if (!valid) {
            await sendNewMessage(
              ctx,
              `${EMOJI_CROSS} ${(check && check.message) || "Player ID could not be verified."}\n\nPlease enter a valid player ID.`,
            );
            return;
          }
          if (typeof check === "string") {
            resolvedName = check;
          } else if (typeof check === "object" && check !== null) {
            if (typeof check.data === "string") resolvedName = check.data;
            else if (check.name) resolvedName = check.name;
            else if (check.nickname) resolvedName = check.nickname;
            else if (check.first_name) resolvedName = check.first_name;
            else if (check.player_name) resolvedName = check.player_name;
            else if (check.username) resolvedName = check.username;
            else if (check.user && (check.user.name || check.user.nickname))
              resolvedName = check.user.name || check.user.nickname;
            else {
              const isJustSuccess = Object.keys(check).every((k) =>
                ["success", "valid", "status", "code"].includes(k),
              );
              if (isJustSuccess) {
                resolvedName = "Verified ";
              } else {
                resolvedName = JSON.stringify(check);
              }
            }
          }
        } catch (e) {
          logger.error(`Player verification failed: ${e.message}`);
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Player verification failed. Please try again.`,
          );
          return;
        }
        session.data.nickname = resolvedName;
        const escape_html = (str) =>
          String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        const safeName = escape_html(resolvedName);
        const summary =
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          `${EMOJI_ORDER} <b>Order Summary</b>\n\n` +
          `${EMOJI_GAME} <b>Product:</b> ${session.data.game_name}\n` +
          `${EMOJI_ORDER} <b>Service:</b> ${session.data.service_name}\n` +
          `${EMOJI_USER} <b>Name:</b> ${safeName}\n` +
          `${EMOJI_USER} <b>Player ID:</b> ${playerId}\n` +
          (session.data.server_name
            ? `${EMOJI_GAME} <b>Region:</b> ${session.data.server_name}\n`
            : "") +
          `${EMOJI_MONEY} <b>Package:</b> ${session.data.package_display_name || session.data.package_name}\n` +
          `${EMOJI_MONEY} <b>Price:</b> ${Math.floor(session.data.charged_price)}ETB\n` +
          "━━━━━━━━━━━━━━━━━━━━━━";
        session.state = STATE_CONFIRM;
        await sendNewMessage(ctx, summary, {
          reply_markup: get_confirmation_keyboard(),
        });
        return;
      }
      if (session.state === STATE_PAYMENT_TXN_ID) {
        const reference = text.trim();
        const method = session.data.pay_method;
        const charged_price = session.data.charged_price || 0.0;
        if (!reference) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Please enter a valid reference.`,
          );
          return;
        }
        if (await db.is_transaction_used(reference)) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} This reference has already been used.`,
            { reply_markup: get_main_keyboard() },
          );
          clearUserSession(userId);
          return;
        }
        await sendOrEdit(ctx, " Verifying your payment...");
        const result = await verify_payment(reference, method, charged_price);
        if (result && result.success) {
          const verified_amount = result.data.amount;
          if (verified_amount < charged_price) {
            await sendNewMessage(
              ctx,
              `${EMOJI_CROSS} Payment amount (${Math.floor(verified_amount)} ETB) is less than the order total (${Math.floor(charged_price)} ETB).`,
              { reply_markup: get_main_keyboard() },
            );
            clearUserSession(userId);
            return;
          }
          await db.record_transaction_use(reference, userId, verified_amount);
          await place_order_flow(
            ctx,
            session,
            db,
            api_client,
            bot,
            method,
            reference,
            verified_amount,
          );
          return;
        } else {
          if (result && result.server_error) {
            const apiErrorMsg = result.error
              ? `\n<b>Reason:</b> ${result.error}`
              : "";
            await sendNewMessage(
              ctx,
              `${EMOJI_WARNING} The payment API is currently down.${apiErrorMsg}\n\nPlease try again in a few minutes.`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "❌ Cancel", callback_data: "order_cancel" }],
                  ],
                },
              },
            );
            return;
          }
          const attempts = (verify_attempts[userId] || 0) + 1;
          verify_attempts[userId] = attempts;
          const apiErrorMsg =
            result && result.error ? `\n<b>Reason:</b> ${result.error}` : "";
          if (attempts >= 3) {
            delete verify_attempts[userId];
            clearUserSession(userId);
            await sendNewMessage(
              ctx,
              `${EMOJI_CROSS} Verification failed after 3 attempts.${apiErrorMsg}\n\nPlease try again later or contact support.`,
              { reply_markup: get_main_keyboard() },
            );
          } else {
            await sendNewMessage(
              ctx,
              `${EMOJI_CROSS} Verification failed.${apiErrorMsg}\n\n${3 - attempts} tries left. Re‑enter the reference.`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "❌ Cancel", callback_data: "order_cancel" }],
                  ],
                },
              },
            );
          }
          return;
        }
      }
      if (session.state === STATE_DEPOSIT_AMOUNT) {
        const amount = parseFloat(text);
        if (isNaN(amount) || amount < MIN_DEPOSIT_BIRR) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Minimum deposit is ${MIN_DEPOSIT_BIRR} ETB.`,
          );
          return;
        }
        if (amount > appSettings.MAX_DEPOSIT_LIMIT) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Maximum deposit is ${appSettings.MAX_DEPOSIT_LIMIT} ETB.`,
          );
          return;
        }
        session.data.intended_amount = amount;
        const method = session.data.dep_method || "telebirr";
        let caption, image_to_send;
        {
          caption =
            `${EMOJI_TELEBIRR} <b>Send ${Math.floor(amount)} ETB to:</b>\n` +
            `Name: <b>${EXPECTED_RECEIVER_NAME}</b>\n` +
            `Number: <code>${TELEBIRR_PHONE}</code>\n\n` +
            "After the payment, reply with the <b>Transaction ID</b>.\n" +
            "Example: <code>DG56K96NIK</code>";
          image_to_send = IMG_TRANSACTION_ID;
        }
        session.state = STATE_DEPOSIT_TRANSACTION_ID;
        const cancel_kb = {
          inline_keyboard: [
            [
              {
                text: "❌ Cancel",
                callback_data: "cancel_action",
                style: "danger",
              },
            ],
          ],
        };
        await clear_last_photo(ctx, session);
        await sendOrEditPhoto(ctx, image_to_send, caption, {
          reply_markup: cancel_kb,
        });
        return;
      }
      if (session.state === STATE_DEPOSIT_TRANSACTION_ID) {
        const reference = text.trim();
        const method = session.data.dep_method || "telebirr";
        if (!reference) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Please enter a valid reference (Transaction ID or Link).`,
          );
          return;
        }
        if (await db.is_transaction_used(reference)) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} This reference has already been used.`,
          );
          clearUserSession(userId);
          return;
        }
        await sendOrEdit(ctx, " Verifying your payment...");
        const intended = session.data.intended_amount;
        const result = await verify_payment(reference, method, intended);
        if (result && result.success) {
          const amount = result.data.amount;
          if (amount < MIN_DEPOSIT_BIRR) {
            await sendNewMessage(ctx, `${EMOJI_CROSS} Amount too low.`, {
              reply_markup: get_main_keyboard(),
            });
            clearUserSession(userId);
            return;
          }
          const deposit_id = await db.create_deposit(
            userId,
            method,
            amount,
            "ETB",
            "",
          );
          await db.approve_deposit(
            deposit_id,
            `Auto-approved Ref: ${reference}`,
          );
          await db.record_transaction_use(reference, userId, amount);
          delete verify_attempts[userId];
          await sendNewMessage(
            ctx,
            `${EMOJI_SUCCESS} Payment verified! <b>${Math.floor(amount)} ETB</b> added.`,
          );
          if (amount > intended) {
            await sendNewMessage(
              ctx,
              `${EMOJI_WARNING} You deposited more than you specified (<b>${Math.floor(intended)} ETB</b>). ` +
                `The extra <b>${Math.floor(amount - intended)} ETB</b> has also been added to your balance. ` +
                "If this was a mistake, please withdraw or contact admin.",
            );
          }
          await sendNewMessage(ctx, " You may send a screenshot for records.", {
            reply_markup: get_main_keyboard(),
          });
          const user = ctx.from;
          for (const admin_id of ADMIN_CHAT_IDS) {
            try {
              await bot.telegram.sendMessage(
                admin_id,
                `${EMOJI_MONEY} <b>Auto‑Approved Deposit</b>\n` +
                  `${EMOJI_USER} User: <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n` +
                  `${EMOJI_MONEY} Amount: <b>${Math.floor(amount)} ETB</b>\n` +
                  ` Ref: <code>${reference}</code>\n` +
                  `${EMOJI_CALENDAR} ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`,
                { parse_mode: "HTML" },
              );
            } catch (_) {}
          }
          await report_event(
            bot,
            `${EMOJI_MONEY} <b>Deposit (Auto)</b>\n` +
              `${EMOJI_USER} <a href="tg://user?id=${user.id}">${user.first_name || "User"}</a> (ID: <code>${user.id}</code>)\n` +
              `${EMOJI_MONEY} Amount: ${Math.floor(amount)} ETB\n` +
              ` Ref: <code>${reference}</code>`,
          );
          clearUserSession(userId);
          return;
        }
        if (result && result.server_error) {
          const apiErrorMsg = result.error
            ? `\n<b>Reason:</b> ${result.error}`
            : "";
          await sendNewMessage(
            ctx,
            `${EMOJI_WARNING} The payment API is currently down.${apiErrorMsg}\n\nPlease try again in a few minutes.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Cancel", callback_data: "cancel_action" }],
                ],
              },
            },
          );
          return;
        }
        const attempts = (verify_attempts[userId] || 0) + 1;
        verify_attempts[userId] = attempts;
        const apiErrorMsg =
          result && result.error ? `\n<b>Reason:</b> ${result.error}` : "";
        if (attempts >= 3) {
          delete verify_attempts[userId];
          clearUserSession(userId);
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Could not verify automatically after 3 tries.${apiErrorMsg}\nPlease double‑check the reference and try again later, or contact support.`,
            { reply_markup: get_main_keyboard() },
          );
        } else {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Verification failed.${apiErrorMsg}\n\n${3 - attempts} tries left. Re‑enter the reference.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Cancel", callback_data: "cancel_action" }],
                ],
              },
            },
          );
        }
        return;
      }
      if (session.state === STATE_WITHDRAW_ACCOUNT) {
        if (!text) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Please enter a valid account.`,
          );
          return;
        }
        session.data.withdraw_account = text;
        session.state = STATE_WITHDRAW_NICKNAME;
        const cancel_kb = {
          inline_keyboard: [
            [
              {
                text: "❌ Cancel",
                callback_data: "cancel_action",
                style: "danger",
              },
            ],
          ],
        };
        await sendNewMessage(
          ctx,
          `${EMOJI_USER} <b>Enter your nickname (shown to admin):</b>`,
          { reply_markup: cancel_kb },
        );
        return;
      }
      if (session.state === STATE_WITHDRAW_NICKNAME) {
        if (!text) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Please enter your nickname.`,
          );
          return;
        }
        session.data.withdraw_nickname = text;
        const profile = await db.get_user_profile(userId);
        const available =
          (profile.balance || 0) - (profile.referral_balance || 0);
        session.state = STATE_WITHDRAW_AMOUNT;
        const cancel_kb = {
          inline_keyboard: [
            [
              {
                text: "❌ Cancel",
                callback_data: "cancel_action",
                style: "danger",
              },
            ],
          ],
        };
        await sendNewMessage(
          ctx,
          `${EMOJI_WITHDRAW} <b>Withdraw via Telebirr</b>\nWithdrawable balance: ${Math.floor(available)} ETB\nMinimum: ${MIN_WITHDRAW_BIRR} ETB\nFee: ${(appSettings.WITHDRAWAL_FEE_PERCENT * 100).toFixed(1)}%\nEnter the amount to withdraw:`,
          { reply_markup: cancel_kb },
        );
        return;
      }
      if (session.state === STATE_WITHDRAW_AMOUNT) {
        const amount = parseFloat(text);
        if (isNaN(amount) || amount < MIN_WITHDRAW_BIRR) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Minimum ${MIN_WITHDRAW_BIRR} ETB.`,
          );
          return;
        }
        if (amount > appSettings.MAX_WITHDRAW_LIMIT) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Maximum ${appSettings.MAX_WITHDRAW_LIMIT} ETB.`,
          );
          return;
        }
        const profile = await db.get_user_profile(userId);
        const available =
          (profile.balance || 0) - (profile.referral_balance || 0);
        const fee = amount * appSettings.WITHDRAWAL_FEE_PERCENT;
        const total_needed = amount + fee;
        if (total_needed > available) {
          await sendNewMessage(
            ctx,
            `${EMOJI_CROSS} Insufficient withdrawable balance (need ${Math.floor(total_needed)} with fee).`,
          );
          return;
        }
        session.data.withdraw_amount = amount;
        session.data.withdraw_fee = fee;
        session.data.withdraw_method = "telebirr";
        session.state = STATE_WITHDRAW_CONFIRM;
        await sendNewMessage(
          ctx,
          `<b>Confirm withdrawal of ${Math.floor(amount)} ETB (fee ${Math.floor(fee)} ETB) to ${session.data.withdraw_account}</b>`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "✅ Confirm",
                    callback_data: "withdraw_confirm",
                    style: "success",
                  },
                  {
                    text: "❌ Cancel",
                    callback_data: "withdraw_cancel",
                    style: "danger",
                  },
                ],
              ],
            },
          },
        );
        return;
      }
    } catch (err) {
      logger.error("CRASH IN MESSAGE HANDLER: " + err.stack);
      try {
        await ctx.reply(" An internal error occurred. Please try again.");
      } catch (e) {}
    }
  });
  /* ---------- Launch Bot ---------- */
  const WEBHOOK_URL = process.env.RENDER_EXTERNAL_URL || process.env.WEBHOOK_DOMAIN;
  if (WEBHOOK_URL) {
    logger.info(`Starting bot in webhook mode using URL: ${WEBHOOK_URL}`);
    if (app) {
      app.use(bot.webhookCallback("/telegram/webhook"));
      // Add a GET route so visiting it in the browser doesn't show "Cannot GET"
      app.get("/telegram/webhook", (req, res) => res.send("Webhook endpoint is active. Telegram sends POST requests here."));
      app.get("/webhook", (req, res) => res.send("Webhook endpoint is active. Telegram sends POST requests here."));
    }
    await bot.telegram.setWebhook(`${WEBHOOK_URL}/telegram/webhook`);
  } else {
    logger.info(" Starting bot in long polling mode...");
    await bot.launch();
  }
  
  /* Graceful shutdown */
  const shutdown = async () => {
    logger.info("Shutting down...");
    setTimeout(() => process.exit(0), 1000).unref();
    try {
      await bot.stop();
    } catch (e) {}
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
/* =================================================================== */

/* START APPLICATION */

/* =================================================================== */

const expressApp = require("express")();
// removed global express.json() to prevent conflict with Telegraf webhook
expressApp.get("/", (req, res) => res.send("Bot is running!"));
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  expressApp.listen(PORT, "0.0.0.0", () => {
    logger.info(`Web server listening on port ${PORT}`);
  });
  main(expressApp).catch((err) => {
    logger.error(`Fatal crash: ${err.message}`, err);
    process.exit(1);
  });
}
