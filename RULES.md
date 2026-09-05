# Borrower Copilot — Rules, Thresholds & Assumptions

## 1. Purpose

Borrower Copilot helps an Indian borrower answer four questions before taking a loan:

1. Should I borrow at all?
2. How much am I really eligible for?
3. What is a fair interest rate for me?
4. What EMI should I agree to?

The product produces a one-page Negotiation Card containing the borrower's recommended amount, fair rate range, EMI ceiling, all-in cost reminder, tenure trade-off and stress check.

This is a planning assistant, not a lender approval engine or financial advice service.

---

## 2. Product Principles

### Unknown ≠ Zero

If the borrower does not know a value, the Copilot does not automatically treat it as zero.

For example, an unknown credit score uses a wider planning rate band rather than assuming a poor or excellent score.

### Lender Eligibility ≠ Safe Affordability

Two separate numbers are shown:

* **Lender-side planning estimate:** what a lender might potentially consider based on income.
* **Safer amount:** what the borrower can more conservatively carry based on monthly cash flow.

The borrower should use the **safer amount** when deciding how much debt to take.

### Conservative by Default

When affordability or debt risk is unclear, the Copilot prefers a lower borrowing amount or "Don't Borrow" rather than encouraging maximum borrowing.

---

# 3. Questions

The Copilot asks adaptive questions.

Core questions:

1. Purpose of borrowing
2. Requested amount
3. Loan type
4. Net monthly income
5. Income type
6. Income stability for non-salaried borrowers
7. Existing EMIs
8. Risky existing debt when EMIs exist
9. Existing debt duration when EMIs exist
10. Monthly household expenses
11. Whether the full requested amount is essential when the request is large relative to income
12. Age
13. Credit score knowledge and score if known

Additional questions are shown only when they can change or tighten an output.

---

# 4. Monthly Debt-to-Income Ratio

Formula:

DTI = Existing Monthly EMI / Net Monthly Income × 100

Example:

Income = ₹1,10,000
Existing EMI = ₹14,000

DTI = 14,000 / 1,10,000 × 100 = 12.7%

Purpose:

DTI gives a simple view of how much monthly income is already committed to debt.

Source:

**My judgement / product planning metric.**

It is not presented as an official lender approval threshold.

---

# 5. Available Monthly Income

Formula:

Available Income = Monthly Income − Household Expenses − Existing EMI

Example:

Income = ₹1,10,000
Expenses = ₹28,000
Existing EMI = ₹14,000

Available Income = ₹68,000

Purpose:

This estimates the monthly cash flow remaining before considering a new EMI.

Source:

**My judgement / product planning metric.**

---

# 6. Comfortable EMI

Base rule:

Comfortable EMI = Available Income × 40%

Income stability adjustment:

* Very predictable → 40%
* Somewhat predictable → 35%
* Highly variable → 30%

The implementation first calculates the 40% base and then applies the stability multiplier:

* Somewhat predictable → 0.875
* Highly variable → 0.75
* Very predictable → 1.0

Purpose:

A borrower should not use all remaining monthly cash flow for a new EMI.

Source:

**My judgement / conservative affordability heuristic.**

---

# 7. Safer Borrowing Amount

The safer amount is calculated by converting the comfortable EMI into an estimated loan amount.

Planning assumptions:

* Interest rate = 14% annually
* Tenure = 5 years
* EMI = calculated using the standard reducing-balance EMI formula

Purpose:

This converts monthly affordability into a loan principal estimate.

Source:

**My judgement / planning assumption.**

14% is a deliberately simple planning rate rather than a guaranteed market quote.

---

# 8. Lender-side Planning Estimate

This is a planning estimate only and is NOT a lender approval.

Base income multipliers:

* Salaried → 6 × monthly income
* Self-employed → 5.5 × monthly income
* Variable / Irregular → 5 × monthly income

Income stability adjustments:

* Very predictable → no reduction
* Somewhat predictable → multiplier reduced by 0.5
* Highly variable → multiplier reduced by 1

Minimum multiplier:

* 3 × monthly income

Example:

₹60,000 self-employed income
Somewhat predictable

Multiplier:

5.5 − 0.5 = 5

Planning estimate:

₹60,000 × 5 = ₹3,00,000

Purpose:

To separate a rough lender-side capacity estimate from the safer borrower-side affordability amount.

Source:

**My judgement.**

Actual lender eligibility can depend on credit history, FOIR, employment/business history, documents, collateral, lender policy and many other factors.

---

# 9. Recommended Borrowing Amount

Base formula:

Recommended Amount = minimum of:

* Requested Amount
* Safer Amount
* Lender-side Planning Estimate

This prevents the Copilot from recommending more than either the borrower requested, the conservative affordability estimate, or the planning lender capacity.

Source:

**My judgement / product rule.**

---

# 10. Risky Existing Debt Override

If the borrower reports either:

* High-cost app loan
* Missed/bounced EMI

the Copilot recommends:

**Don't Borrow**

and the risk-adjusted recommended borrowing amount becomes:

**₹0**

This override is intentionally conservative because adding new borrowing while high-cost or missed-payment debt exists may worsen the borrower's debt position.

The existing safer amount and lender-side estimate are still displayed for transparency, but the recommended amount is reduced to ₹0.

Source:

**My judgement / conservative product rule.**

This is not a lender underwriting rule.

---

# 11. Borrowing Decision

The decision has three possible outputs:

### Borrow

Used when:

Requested Amount ≤ Recommended Amount

and affordability is positive.

### Borrow Less

Used when:

Requested Amount > Recommended Amount

but a positive recommended amount remains.

### Don't Borrow

Used when:

* Available income is zero or negative
* Recommended amount is zero
* Risky existing debt override is triggered

Purpose:

The product must make "Don't Borrow" reachable rather than always producing a loan amount.

Source:

**My judgement / product decision rule.**

---

# 12. Fair Interest Rate Band

Planning bands based on credit quality:

| Credit profile | Planning rate |
| -------------- | ------------: |
| 750+           |       10%–14% |
| 700–749        |       11%–15% |
| 650–699        |       13%–18% |
| Below 650      |       16%–24% |
| Unknown        |       12%–18% |

These are planning ranges, not guaranteed offers.

### Income adjustments

Variable / Irregular:

* Minimum +1%
* Maximum +1%

Self-employed:

* Minimum +0.5%
* Maximum +1%

### Stability adjustments

Somewhat predictable:

* Minimum +0.5%
* Maximum +0.5%

Highly variable:

* Minimum +1%
* Maximum +1.5%

### Loan-type adjustments

Vehicle Loan:

* Minimum −2%
* Maximum −2%

Education Loan:

* Minimum −1%
* Maximum −1%

Rate floor:

Minimum rate cannot fall below 8%.

The maximum rate is also kept at least 2 percentage points above the minimum.

Source:

**My judgement / planning bands inspired by general Indian retail lending patterns.**

Actual lender pricing varies by lender, borrower profile, product, secured/unsecured status and market conditions.

---

# 13. All-in APR Estimate

The Copilot includes an assumed processing fee of:

**2% of loan amount**

Simplified planning calculation:

Processing Fee = Loan Amount × 2%

Approximate Interest Cost:

Loan Amount × Interest Rate × Tenure

Total Borrowing Cost:

Approximate Interest Cost + Processing Fee

Annualized Cost:

Total Borrowing Cost / Loan Amount / Tenure

The result is displayed as an estimated all-in APR.

Important:

This is **not a regulated APR calculation** and does not attempt to reproduce every lender-specific disclosure methodology.

Purpose:

To prevent borrowers from comparing loans using only the headline interest rate.

Source:

**My judgement / simplified planning model.**

---

# 14. EMI Calculation

The Copilot uses the standard reducing-balance EMI formula:

EMI = P × r × (1+r)^n / ((1+r)^n − 1)

Where:

* P = loan principal
* r = monthly interest rate
* n = number of monthly payments

Annual interest rate is converted into a monthly rate by:

Annual Rate / 12 / 100

Source:

**Standard loan amortization formula.**

---

# 15. Tenure Trade-off

The Copilot compares:

* 3-year tenure
* 5-year tenure

The same recommended principal and 14% planning interest rate are used.

General explanation:

### 3 years

* Higher monthly EMI
* Lower total interest

### 5 years

* Lower monthly EMI
* Higher total interest

Purpose:

To show that a lower EMI can increase the total cost of borrowing.

Source:

**Standard loan amortization mathematics.**

---

# 16. Stress Case

The Copilot assumes a:

**20% reduction in monthly income**

Stress Income:

Monthly Income × 80%

Example:

₹28,000 income

Stress income:

₹28,000 × 80% = ₹22,400

Purpose:

To test whether the proposed debt remains manageable if income temporarily falls.

Source:

**My judgement / conservative stress assumption.**

---

# 17. Stress EMI Capacity

Formula:

Stress Remaining Income = Stress Income − Household Expenses − Existing EMI

Stress EMI Capacity:

Stress Remaining Income × 40%

If stress remaining income is zero or negative:

Stress EMI Capacity = ₹0

Purpose:

To identify loans that may become difficult to service under an income shock.

Source:

**My judgement / conservative affordability heuristic.**

---

# 18. Stress Status

### Comfortable

Proposed EMI ≤ Stress EMI Capacity

### Tight

Proposed EMI is greater than Stress EMI Capacity but no more than 125% of it.

### Not Safe

Proposed EMI is more than 125% of Stress EMI Capacity, or stress capacity is zero.

Source:

**My judgement / product risk classification.**

---

# 19. Purpose Detail

When requested amount is greater than:

Monthly Income × 6

the Copilot asks whether the full amount is:

* Essential expense
* Partly essential, partly optional
* Mostly optional

Purpose:

Large requests should receive an additional need check rather than assuming the entire amount is necessary.

Source:

**My judgement / adaptive question rule.**

---

# 20. Data & Privacy

The application does not require:

* Login
* Credit bureau pull
* Bank account connection
* Personal document upload
* Persistent personal data storage

The assessment is calculated locally from the information entered into the interface.

---

# 21. Explainability

Every major number shown to the borrower has an explanation:

* Lender estimate → income-based planning capacity
* Safer amount → cash-flow and EMI affordability
* Recommended amount → minimum of relevant limits
* Fair rate → credit, income, stability and loan type
* APR → interest plus assumed processing fee
* Safe EMI → conservative monthly affordability
* DTI → existing EMI relative to income
* Stress case → 20% income reduction scenario

The product explicitly distinguishes planning estimates from lender decisions.

---

# 22. Negotiation Card

The final Negotiation Card contains:

1. Amount to ask for
2. Fair interest-rate range
3. Maximum comfortable EMI
4. All-in cost / APR reminder
5. 3-year vs 5-year tenure trade-off
6. Stress-case result

Purpose:

The borrower should be able to use the card when comparing or negotiating a loan offer.

---

# 23. Example: Priya

Profile:

* Age: 29
* Location: Bengaluru
* Salaried
* Net income: ₹1,10,000/month
* Existing EMI: ₹14,000
* Household expenses: ₹28,000
* Credit score: 780
* Requested: ₹8,00,000
* Purpose: Wedding
* Loan: Personal Loan

Observed output:

* Decision: Borrow Less
* Lender-side planning estimate: ₹6,60,000
* Safer amount: approximately ₹11.69 lakh
* Recommended amount: ₹6,60,000
* Fair rate: 10%–14%
* Safe EMI: approximately ₹27,200
* DTI: approximately 12.7%

Reason:

The requested ₹8 lakh is above the planning lender capacity of ₹6.6 lakh, even though monthly affordability is stronger.

---

# 24. Example: Ravi

Profile:

* Age: 42
* Self-employed
* Monthly income used for planning: ₹60,000 midpoint
* Income range: ₹40,000–₹80,000
* Somewhat predictable income
* Existing EMI: ₹0
* Household expenses: ₹18,000
* Credit score: Unknown
* Requested: ₹15,00,000
* Purpose: Business
* Loan: Business Loan

Observed output:

* Decision: Borrow Less
* Lender-side planning estimate: ₹3,00,000
* Safer amount: approximately ₹6.32 lakh
* Recommended amount: ₹3,00,000
* Fair rate: 13%–19.5%
* Safe EMI: approximately ₹14,700

Reason:

The requested ₹15 lakh is substantially above the conservative lender-side planning estimate.

---

# 25. Example: Anita

Profile:

* Age: 35
* Variable / Irregular income
* Monthly income: ₹28,000
* Highly variable income
* Existing EMI: ₹3,000
* Household expenses: ₹20,000
* Existing missed/bounced EMI
* Requested: ₹1,50,000
* Purpose: Vehicle
* Credit score: 650

Observed output:

* Decision: Don't Borrow
* Lender-side planning estimate: ₹1,12,000
* Safer amount: approximately ₹64,466
* Risk-adjusted recommended amount: ₹0
* Safe EMI: approximately ₹1,500
* Stress capacity: ₹0
* Stress status: Not Safe

Reason:

The borrower already has a missed/bounced EMI and very limited monthly cash flow. The conservative risk override therefore prevents recommending additional borrowing.

---

# 26. Engineering Separation

Calculation logic is separated from the React UI in:

`src/borrowingEngine.ts`

The UI and question flow are implemented in:

`src/App.tsx`

Styling is implemented in:

`src/index.css`

This separation makes the rules easier to inspect, test and modify without mixing financial calculations with presentation code.

---

# 27. Important Disclaimer

Borrower Copilot provides estimates and educational planning guidance.

It does not:

* Guarantee loan approval
* Guarantee an interest rate
* Guarantee eligibility
* Replace lender underwriting
* Replace regulated financial advice
* Pull a credit bureau report
* Store personal borrower data

Actual loan pricing, eligibility, fees and repayment terms depend on the lender and borrower profile.
### Skipped Household Expenses

If the borrower skips the household-expense question,
the Copilot must not treat unknown expenses as ₹0.

Instead, for planning calculations it assumes household
expenses equal to 30% of stated monthly income.

Formula:
Estimated expenses = 30% × monthly income

Why:
Unknown expenses should not artificially increase borrowing
capacity. The 30% figure is a conservative planning
assumption and is explicitly disclosed to the borrower.

Source:
My judgement — this is not an RBI or lender underwriting rule.