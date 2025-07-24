import cors from "cors";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

setGlobalOptions({
  maxInstances: 10,
  region: "us-east1",
  timeoutSeconds: 10,
  memory: "256MiB",
});

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

// Using Secret Manager for portfolio key
const recaptchaSecret = defineSecret("RECAPTCHA_PORTFOLIO_SECRET");

const corsHandler = cors({
  origin: [
    "https://angular-dev-portfolio.web.app",
    "https://andrewcarey.dev",
    "http://localhost:4200"
  ]
});

export const verifyRecaptchaPortfolio = onRequest(
  {
    secrets: [recaptchaSecret],
    region: "us-east1",
    timeoutSeconds: 10,
    memory: "256MiB",
  },
  async (req, res) => {
    corsHandler(req, res, async () => {
      const fetch = (await import("node-fetch")).default;
      const { recaptchaToken } = req.body;

      if (!recaptchaToken) {
        console.warn("[verifyRecaptchaPortfolio] ❌ Missing token in request.");
        res.status(400).json({ success: false, reason: "Missing token" });
        return;
      }

      try {
        console.log("[verifyRecaptchaPortfolio] Received request. Validating...");

        const googleVerifyUrl = "https://www.google.com/recaptcha/api/siteverify";
        const bodyParams = `secret=${recaptchaSecret.value()}&response=${recaptchaToken}`;

        const response = await fetch(googleVerifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: bodyParams,
        });

        const rawText = await response.text();
        let data: RecaptchaResponse;

        try {
          data = JSON.parse(rawText) as RecaptchaResponse;
        } catch (parseErr) {
          console.error("[verifyRecaptchaPortfolio] ❌ Failed to parse Google response:", parseErr);
          throw new Error(`Google returned non-JSON: ${rawText.slice(0, 50)}...`);
        }

        console.log(
          `[verifyRecaptchaPortfolio] Google validation: success=${data.success}, score=${data.score ?? "N/A"}, hostname=${data.hostname ?? "N/A"}, action=${data.action ?? "N/A"}`
        );

        const threshold = 0.2;
        const isHuman = data.success && (data.score ?? 0) >= threshold;

        if (isHuman) {
          console.log("[verifyRecaptchaPortfolio] ✅ Human verified (score:", data.score, ")");
          res.status(200).json({ success: true });
        } else {
          console.warn(
            "[verifyRecaptchaPortfolio] ❌ Verification failed",
            data["error-codes"] || `Low score: ${data.score ?? "unknown"}`
          );
          res.status(403).json({
            success: false,
            reason: data["error-codes"] || `Low score: ${data.score ?? "unknown"}`,
          });
        }
      } catch (error: unknown) {
        console.error(
          "[verifyRecaptchaPortfolio] ❌ Error during verification:",
          error instanceof Error ? error.message : error
        );
        res.status(500).json({
          success: false,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }
);
