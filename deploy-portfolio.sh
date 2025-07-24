#!/bin/bash

set -e  # exit on error

echo "✅ Step 1: Building TypeScript..."
cd functions
npm run build
cd ..

echo "✅ Step 2: Checking compiled output..."
if [ ! -f "functions/lib/index.js" ]; then
  echo "❌ ERROR: functions/lib/index.js not found! Build failed."
  exit 1
else
  echo "✅ Found functions/lib/index.js"
fi

echo "✅ Step 3: Deploying verifyRecaptchaPortfolio..."
gcloud functions deploy verifyRecaptchaPortfolio \
  --gen2 \
  --runtime=nodejs18 \
  --region=us-east1 \
  --entry-point=verifyRecaptchaPortfolio \
  --source=functions \
  --trigger-http \
  --allow-unauthenticated \
  --set-secrets=RECAPTCHA_PORTFOLIO_SECRET=RECAPTCHA_PORTFOLIO_SECRET:latest

echo "✅ Deployment complete!"
