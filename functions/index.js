const crypto = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getDatabase } = require("firebase-admin/database");
const { defineSecret } = require("firebase-functions/params");
const {
  HttpsError,
  onCall,
} = require("firebase-functions/v2/https");

initializeApp();

const adminPin = defineSecret("ADMIN_PIN");
const loginWindowMs = 15 * 60 * 1000;
const maxAttemptsPerWindow = 5;

const digest = (value) =>
  crypto.createHash("sha256").update(value, "utf8").digest();

exports.portfolioPinLogin = onCall(
  { secrets: [adminPin], maxInstances: 2 },
  async (request) => {
    const pin = request.data?.pin;
    if (typeof pin !== "string" || !/^\d{4,12}$/.test(pin)) {
      throw new HttpsError("unauthenticated", "Invalid PIN.");
    }

    const configuredPin = adminPin.value();
    if (!/^\d{4,12}$/.test(configuredPin)) {
      throw new HttpsError("internal", "PIN authentication is not configured.");
    }

    const clientIp = request.rawRequest.ip || "unknown";
    const attemptsKey = digest(clientIp).toString("hex");
    const attemptsRef = getDatabase().ref(
      `adminPinAttempts/${attemptsKey}`
    );
    const now = Date.now();
    const attemptResult = await attemptsRef.transaction((current) => {
      if (!current || now - current.windowStartedAt >= loginWindowMs) {
        return { count: 1, windowStartedAt: now };
      }

      return {
        count: (Number(current.count) || 0) + 1,
        windowStartedAt: current.windowStartedAt,
      };
    });

    if (attemptResult.snapshot.val()?.count > maxAttemptsPerWindow) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many attempts. Try again later."
      );
    }

    if (!crypto.timingSafeEqual(digest(pin), digest(configuredPin))) {
      throw new HttpsError("unauthenticated", "Invalid PIN.");
    }

    await attemptsRef.remove();
    const token = await getAuth().createCustomToken("portfolio-admin", {
      admin: true,
    });
    return { token };
  }
);
