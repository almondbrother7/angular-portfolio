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

const recaptchaSecret = defineSecret("RECAPTCHA_SECRET");

const corsHandler = cors({
  origin: [
    "https://angular-dev-portfolio.web.app",
    "https://andrewcarey.dev",
    "http://localhost:4200"
  ]
});

export const verifyRecaptcha = onRequest(
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
        res.status(400).json({ success: false, reason: "Missing token" });
        return;
      }

      try {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${recaptchaSecret.value()}&response=${recaptchaToken}`,
        });

        const data: RecaptchaResponse = await response.json() as RecaptchaResponse;
        console.log("[verifyRecaptcha] Full response:", data);

        const threshold = 0.5;
        const isHuman = data.success && (data.score ?? 0) >= threshold;

        if (isHuman) {
          res.status(200).json({ success: true });
        } else {
          res.status(403).json({
            success: false,
            reason: data["error-codes"] || `Low score: ${data.score ?? "unknown"}`,
          });
        }
      } catch (error: unknown) {
        console.error("[verifyRecaptcha] Error:", error);
        res.status(500).json({
          success: false,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }
);
