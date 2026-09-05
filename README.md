# Borrower Copilot

A decision-support assistant for Indian borrowers to understand whether they should borrow, how much they can safely carry, what interest rate may be fair, and what EMI they should agree to.

## Problem

Borrowers often focus on the maximum amount a lender may approve instead of asking:

* Should I borrow at all?
* How much can I safely afford?
* What is a fair interest-rate range?
* What EMI can I comfortably handle?
* What happens if my income falls?

Borrower Copilot addresses these questions using transparent, rule-based calculations.

## Key Features

* **Borrow / Borrow Less / Don't Borrow** decision
* Separate **lender-side planning estimate** from **safe borrower affordability**
* EMI and total-interest calculations
* Fair interest-rate band based on credit profile, income type, stability, and loan type
* Estimated all-in APR including processing fee
* Income and expense based affordability analysis
* Existing debt and risky-debt checks
* Stress-case affordability analysis
* 3-year vs 5-year tenure comparison
* One-page **Negotiation Card**
* Explainable calculations with reasons behind important numbers
* No login, bureau pull, or personal data storage

## How It Works

The Copilot asks a short sequence of adaptive questions about:

1. Loan purpose
2. Requested amount
3. Loan type
4. Monthly income
5. Income type
6. Existing EMIs
7. Household expenses
8. Age
9. Credit score, if known
10. Additional debt/risk information where relevant

The answers are processed by the rule engine in `src/borrowingEngine.ts`.

## Decision Framework

The application separates two important concepts:

### 1. Lender Planning Estimate

An estimated amount a lender might potentially consider based on income and income stability.

This is explicitly a **planning heuristic**, not an official lender eligibility rule.

### 2. Safe Borrower Amount

An affordability-oriented amount based on:

* Monthly income
* Household expenses
* Existing EMIs
* Comfortable EMI capacity
* Interest-rate and tenure assumptions
* Stress-case affordability
* Risky existing debt

The recommended amount is constrained by the requested amount, lender planning estimate, and safe affordability.

## Interest Rate Framework

The application provides planning bands rather than guaranteed lender offers.

Indicative base bands:

| Credit Profile | Rate Band |
| -------------- | --------: |
| 750+           |   10%–14% |
| 700–749        |   11%–15% |
| 650–699        |   13%–18% |
| Below 650      |   16%–24% |
| Unknown        |   12%–18% |

The band is adjusted based on income type, income stability, and loan type.

## EMI & Stress Testing

The Copilot calculates:

* Monthly EMI
* Total interest
* Comfortable EMI capacity
* 3-year vs 5-year tenure trade-off
* Stress income after a 20% income reduction
* Stress-case EMI capacity
* Stress status: Comfortable, Tight, or Not Safe

The stress test helps prevent a loan from appearing affordable only under optimistic income assumptions.

## Risk Handling

High-cost or missed/bounced debt can override an otherwise positive borrowing calculation.

For example, when a borrower has a high-cost app loan or a recently missed/bounced EMI, the Copilot can recommend:

**Don't Borrow**

This prevents the system from blindly recommending additional borrowing when existing debt risk is already high.

## Example Run-throughs

### Priya

* Salaried
* Monthly income: ₹1,10,000
* Existing EMI: ₹14,000
* Household expenses: ₹28,000
* Credit score: 780
* Requested personal loan: ₹8,00,000

Result:

**Borrow Less**

The planning estimate is lower than the requested amount, so the Copilot recommends borrowing less rather than automatically approving the requested amount.

### Ravi

* Self-employed
* Monthly income: approximately ₹60,000
* Somewhat predictable income
* Household expenses: ₹18,000
* No existing EMI
* Credit score: Unknown
* Requested business loan: ₹15,00,000

Result:

**Borrow Less**

The lender-side planning estimate is significantly lower than the requested amount, so the Copilot recommends a smaller amount.

### Anita

* Variable income
* Monthly income: approximately ₹28,000
* Existing EMI: ₹3,000
* Household expenses: ₹20,000
* Credit score: 650
* Missed/bounced EMI risk
* Requested vehicle loan: ₹1,50,000

Result:

**Don't Borrow**

Existing debt risk and weak stress-case affordability trigger a conservative borrowing recommendation.

## Project Structure

```text
borrower-copilot/
│
├── src/
│   ├── App.tsx
│   ├── borrowingEngine.ts
│   ├── index.css
│   ├── App.css
│   └── main.tsx
│
├── public/
├── RULES.md
├── package.json
├── package-lock.json
├── index.html
├── tsconfig.json
└── vite.config.ts
```

## Tech Stack

* React
* TypeScript
* Vite
* CSS
* Rule-based financial decision engine

## Running Locally

Clone the repository and install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Rules & Assumptions

All decision rules, thresholds, rate bands, affordability assumptions, stress assumptions, and calculation logic are documented in:

**`RULES.md`**

The application clearly distinguishes between:

* Rules based on external financial concepts
* Planning assumptions
* Judgement-based heuristics

These outputs are intended for decision support and are **not guarantees of loan approval, lender pricing, or regulated financial advice**.

## Engineering Approach

The UI is separated from the core borrowing calculations.

Financial calculations and decision rules are implemented in:

`src/borrowingEngine.ts`

This keeps the decision logic readable, testable, and separate from the presentation layer.

## Privacy

The application does not require:

* Login
* Credit-bureau access
* Bank-account access
* Personal-data storage

The borrower inputs are used for the current calculation flow.

## Disclaimer

Borrower Copilot is an educational and decision-support prototype. Its calculations are planning estimates and should not be interpreted as guaranteed lender eligibility, loan pricing, or financial advice.

Borrowers should verify the final loan terms, processing fees, APR/all-in cost, foreclosure/prepayment conditions, and other charges directly with the lender before accepting an offer.
