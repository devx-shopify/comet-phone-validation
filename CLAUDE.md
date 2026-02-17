# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**comet-phone-validation** is a Shopify extension-only app that implements phone number validation in the checkout flow. The app is a monorepo using npm workspaces with extensions in the `extensions/` directory.

### Core Extension: Phone Validation (Checkout UI Extension)

Located in `extensions/phone-validation/`, this Checkout UI extension:
- Targets the delivery address section of checkout (`purchase.checkout.delivery-address.render-after`)
- Validates phone numbers to ensure they are exactly 10 digits
- Supports country code normalization for US/Canada (+1) and India (+91)
- Blocks checkout progress if phone validation fails
- Returns validation errors to the checkout UI

**Key technologies:**
- Preact (lightweight React alternative)
- @shopify/ui-extensions (Shopify's checkout extension API)
- @preact/signals (for reactive state management in Preact)

## Development Commands

All commands should be run from the repository root:

```bash
npm run dev        # Start local development server with hot reload
npm run build      # Build extension for production
npm run generate   # Generate a new extension scaffold
npm run deploy     # Deploy extension to Shopify
npm run info       # Display app configuration info
npm run shopify    # Access Shopify CLI directly
```

## Project Structure

```
comet-phone-validation/
├── extensions/
│   └── phone-validation/          # Checkout UI extension
│       ├── src/
│       │   └── Checkout.jsx       # Main extension component
│       ├── locales/               # i18n translations (en.default.json, fr.json)
│       ├── shopify.extension.toml # Extension configuration and capabilities
│       ├── package.json
│       └── tsconfig.json
├── shopify.app.toml              # App-level Shopify configuration
├── package.json                  # Root workspace package.json
└── README.md
```

## Extension Architecture

### Key APIs & Hooks Used

**From @shopify/ui-extensions/checkout/preact:**
- `useBuyerJourneyIntercept()` - Intercepts and blocks checkout progress when validation fails
- `useShippingAddress()` - Reads the customer's shipping address, including phone number

### Phone Validation Logic

The extension uses two utility functions in `Checkout.jsx`:

1. **`normalizePhone(rawPhone)`** - Sanitizes phone input
   - Strips non-digits from the input
   - Handles country code prefixes (+91 for India, +1 for US/Canada)
   - Returns normalized 10-digit phone number

2. **`isPhoneValid(phone)`** - Validates the phone number
   - Currently checks for exactly 10 digits and doesn't start with '0' or '+'
   - Note: The normalization function is currently not applied in the validation (see commented code on line 32-33)

### Extension Configuration (shopify.extension.toml)

Key capabilities enabled:
- `block_progress = true` - Can block checkout progress with validation errors
- `api_access = true` - Can access Shopify's storefront API
- Comment out `network_access` if needed for external API calls

## Important Notes

1. **Monorepo Structure**: The root `package.json` defines workspace extensions. Each extension has its own `package.json` and dependencies.

2. **Preact instead of React**: This project uses Preact (smaller, faster) not React. Import hooks from `preact/hooks`, not `react`.

3. **Shopify CLI Required**: The Shopify CLI is installed as part of `@shopify/app` npm package and handles building and deployment.

4. **Extension Targeting**: The extension renders after the delivery address field in checkout (`purchase.checkout.delivery-address.render-after`). Changing this target requires updating `shopify.extension.toml`.

5. **Phone Validation State**: The extension uses a `useRef` to track the latest phone value without triggering re-renders. The component returns `null` since it only intercepts the buyer journey without rendering UI.

6. **Development Store Required**: To test locally, you need a Shopify development store with checkout extensibility enabled.

## Common Development Tasks

### Testing the Extension Locally

1. Run `npm run dev`
2. Follow the CLI prompts to select a development store
3. The CLI provides a tunnel URL for local testing
4. Make code changes - they auto-reload in development mode

### Modifying Phone Validation Rules

Edit the `normalizePhone()` and `isPhoneValid()` functions in `extensions/phone-validation/src/Checkout.jsx`.

### Adding New Extensions

Run `npm run generate` and select "checkout_ui_extension" to scaffold a new extension in the `extensions/` directory.

### Checking Configuration

Run `npm run info` to see app configuration, extension list, and deployment status.
