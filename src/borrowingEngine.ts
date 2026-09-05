export type BorrowingInput = {
  monthlyIncome: number;
  monthlyDebt: number;
};

export type BorrowingResult = {
  debtToIncomeRatio: number;
  borrowingCapacity: number;
};

// 1. Calculate DTI
export function calculateDTI(
  monthlyIncome: number,
  monthlyDebt: number
): number {
  if (monthlyIncome <= 0) {
    return 0;
  }

  return (monthlyDebt / monthlyIncome) * 100;
}

// 2. Calculate Income Available
export function calculateAvailableIncome(
  monthlyIncome: number,
  monthlyExpenses: number,
  monthlyDebt: number
): number {
  if (monthlyIncome <= 0) {
    return 0;
  }

  const available =
    monthlyIncome -
    monthlyExpenses -
    monthlyDebt;

  return Math.max(available, 0);
}

// 3. Calculate Total Monthly Debt
export function calculateTotalDebt(
  existingEmi: number,
  newEmi: number
): number {
  return existingEmi + newEmi;
}

// 4. Calculate Comfortable EMI
export function calculateComfortableEmi(
  availableIncome: number
): number {
  if (availableIncome <= 0) {
    return 0;
  }

  return Math.round(availableIncome * 0.4);
}

// 5. Calculate Loan Amount from EMI
export function calculateLoanAmountFromEmi(
  monthlyEmi: number,
  annualInterestRate: number,
  tenureYears: number
): number {
  if (
    monthlyEmi <= 0 ||
    annualInterestRate <= 0 ||
    tenureYears <= 0
  ) {
    return 0;
  }

  const monthlyRate =
    annualInterestRate / 12 / 100;

  const numberOfMonths =
    tenureYears * 12;

  const loanAmount =
    monthlyEmi *
    (
      (1 -
        Math.pow(
          1 + monthlyRate,
          -numberOfMonths
        )) /
      monthlyRate
    );

  return Math.round(loanAmount);
}

// 6. Lender-side Planning Estimate
export function calculateLenderEstimate(
  monthlyIncome: number,
  incomeType: string = "Salaried",
  incomeStability: string = "Very predictable"
): number {
  if (monthlyIncome <= 0) {
    return 0;
  }

  /*
    Planning heuristic only.
    This is NOT an official lender eligibility rule.

    Base estimate:
    6 × monthly income

    Less predictable income reduces the planning estimate
    because lenders may discount variable income.
  */

  let incomeMultiplier = 6;

  if (incomeType === "Self-employed") {
    incomeMultiplier = 5.5;
  }

  if (incomeType === "Variable / Irregular") {
    incomeMultiplier = 5;
  }

  if (incomeStability === "Somewhat predictable") {
    incomeMultiplier -= 0.5;
  }

  if (incomeStability === "Highly variable") {
    incomeMultiplier -= 1;
  }

  incomeMultiplier = Math.max(
    incomeMultiplier,
    3
  );

  return Math.round(
    monthlyIncome * incomeMultiplier
  );
}

// 7. Calculate Recommended Amount
export function calculateRecommendedAmount(
  requestedAmount: number,
  saferAmount: number,
  lenderEstimate: number
): number {
  if (
    requestedAmount <= 0 ||
    saferAmount <= 0
  ) {
    return 0;
  }

  if (lenderEstimate <= 0) {
    return Math.round(
      Math.min(
        requestedAmount,
        saferAmount
      )
    );
  }

  return Math.round(
    Math.min(
      requestedAmount,
      saferAmount,
      lenderEstimate
    )
  );
}

// 8. Borrowing Decision
export function calculateBorrowingDecision(
  requestedAmount: number,
  recommendedAmount: number,
  availableIncome: number
): "Borrow" | "Borrow Less" | "Don't Borrow" {
  if (
    availableIncome <= 0 ||
    recommendedAmount <= 0
  ) {
    return "Don't Borrow";
  }

  if (requestedAmount <= recommendedAmount) {
    return "Borrow";
  }

  if (recommendedAmount > 0) {
    return "Borrow Less";
  }

  return "Don't Borrow";
}

// 9. Fair Interest Rate Band
export function calculateFairRateBand(
  creditKnown: string,
  creditScore: number,
  incomeType: string,
  loanType: string,
  incomeStability: string = "Very predictable"
): {
  minRate: number;
  maxRate: number;
} {
  /*
    Planning bands only.
    These are not guaranteed lender offers.

    Credit quality:
    750+  → 10–14%
    700–749 → 11–15%
    650–699 → 13–18%
    <650 → 16–24%
    Unknown → 12–18%
  */

  let minRate = 12;
  let maxRate = 18;

  if (
    creditKnown === "Yes" &&
    creditScore >= 750
  ) {
    minRate = 10;
    maxRate = 14;
  } else if (
    creditKnown === "Yes" &&
    creditScore >= 700
  ) {
    minRate = 11;
    maxRate = 15;
  } else if (
    creditKnown === "Yes" &&
    creditScore >= 650
  ) {
    minRate = 13;
    maxRate = 18;
  } else if (
    creditKnown === "Yes" &&
    creditScore > 0 &&
    creditScore < 650
  ) {
    minRate = 16;
    maxRate = 24;
  }

  // Income type adjustment
  if (incomeType === "Variable / Irregular") {
    minRate += 1;
    maxRate += 1;
  }

  if (incomeType === "Self-employed") {
    minRate += 0.5;
    maxRate += 1;
  }

  // Income stability adjustment
  if (
    incomeStability === "Somewhat predictable"
  ) {
    minRate += 0.5;
    maxRate += 0.5;
  }

  if (
    incomeStability === "Highly variable"
  ) {
    minRate += 1;
    maxRate += 1.5;
  }

  // Loan type adjustment
  if (loanType === "Vehicle Loan") {
    minRate -= 2;
    maxRate -= 2;
  }

  if (loanType === "Education Loan") {
    minRate -= 1;
    maxRate -= 1;
  }

  minRate = Math.max(
    Math.round(minRate * 10) / 10,
    8
  );

  maxRate = Math.max(
    Math.round(maxRate * 10) / 10,
    minRate + 2
  );

  return {
    minRate,
    maxRate,
  };
}

// 10. Calculate All-in APR
export function calculateAllInAPR(
  interestRate: number,
  processingFeePercent: number,
  loanAmount: number,
  tenureYears: number
): number {
  if (
    interestRate <= 0 ||
    loanAmount <= 0 ||
    tenureYears <= 0
  ) {
    return 0;
  }

  /*
    Planning assumption:
    Processing fee is treated as an upfront borrowing cost.

    This is an estimate for the Copilot,
    not a regulated APR calculation.
  */

  const processingFee =
    loanAmount *
    (processingFeePercent / 100);

  const totalInterestApprox =
    loanAmount *
    (interestRate / 100) *
    tenureYears;

  const totalBorrowingCost =
    totalInterestApprox +
    processingFee;

  const annualizedCost =
    totalBorrowingCost /
    loanAmount /
    tenureYears;

  return Math.round(
    annualizedCost * 1000
  ) / 10;
}

// 11. Calculate EMI
export function calculateEmi(
  loanAmount: number,
  annualInterestRate: number,
  tenureYears: number
): number {
  if (
    loanAmount <= 0 ||
    annualInterestRate <= 0 ||
    tenureYears <= 0
  ) {
    return 0;
  }

  const monthlyRate =
    annualInterestRate / 12 / 100;

  const numberOfMonths =
    tenureYears * 12;

  const emi =
    loanAmount *
    monthlyRate *
    Math.pow(
      1 + monthlyRate,
      numberOfMonths
    ) /
    (
      Math.pow(
        1 + monthlyRate,
        numberOfMonths
      ) - 1
    );

  return Math.round(emi);
}

// 12. Calculate Total Interest
export function calculateTotalInterest(
  loanAmount: number,
  monthlyEmi: number,
  tenureYears: number
): number {
  if (
    loanAmount <= 0 ||
    monthlyEmi <= 0 ||
    tenureYears <= 0
  ) {
    return 0;
  }

  const totalPayments =
    monthlyEmi *
    tenureYears *
    12;

  const totalInterest =
    totalPayments -
    loanAmount;

  return Math.round(
    Math.max(totalInterest, 0)
  );
}

// 13. Calculate Stress-case Income
export function calculateStressIncome(
  monthlyIncome: number,
  reductionPercent: number
): number {
  if (
    monthlyIncome <= 0 ||
    reductionPercent < 0
  ) {
    return 0;
  }

  const stressIncome =
    monthlyIncome *
    (1 - reductionPercent / 100);

  return Math.round(
    Math.max(stressIncome, 0)
  );
}

// 14. Calculate Stress-case EMI Capacity
export function calculateStressEmiCapacity(
  stressIncome: number,
  monthlyExpenses: number,
  existingEmi: number
): number {
  if (
    stressIncome <= 0 ||
    monthlyExpenses < 0 ||
    existingEmi < 0
  ) {
    return 0;
  }

  const remainingIncome =
    stressIncome -
    monthlyExpenses -
    existingEmi;

  if (remainingIncome <= 0) {
    return 0;
  }

  const stressEmi =
    remainingIncome * 0.4;

  return Math.round(
    Math.max(stressEmi, 0)
  );
}

// 15. Calculate Stress-case Status
export function calculateStressStatus(
  stressEmiCapacity: number,
  proposedEmi: number
): "Comfortable" | "Tight" | "Not Safe" {
  if (
    stressEmiCapacity <= 0 ||
    proposedEmi <= 0
  ) {
    return "Not Safe";
  }

  if (
    proposedEmi <= stressEmiCapacity
  ) {
    return "Comfortable";
  }

  if (
    proposedEmi <=
    stressEmiCapacity * 1.25
  ) {
    return "Tight";
  }

  return "Not Safe";
}
// 16. Risky Debt Override
export function shouldNotBorrowDueToRiskyDebt(
  riskyDebt: string
): boolean {
  return (
    riskyDebt === "Yes — high-cost app loan" ||
    riskyDebt === "Yes — missed/bounced EMI"
  );
}
// 17. Risk-adjusted Recommended Amount
export function calculateRiskAdjustedRecommendedAmount(
  recommendedAmount: number,
  riskyDebt: string
): number {
  if (
    riskyDebt === "Yes — high-cost app loan" ||
    riskyDebt === "Yes — missed/bounced EMI"
  ) {
    return 0;
  }

  return recommendedAmount;
}
// 18. Confidence Level
export function calculateConfidence(
  creditKnown: string,
  incomeType: string,
  existingEmi: number,
  monthlyExpenses: number
): "High" | "Medium" | "Low" {
  let score = 0;

  if (creditKnown === "Yes") {
    score += 1;
  }

  if (incomeType === "Salaried") {
    score += 1;
  }

  if (existingEmi >= 0) {
    score += 1;
  }

  if (monthlyExpenses > 0) {
    score += 1;
  }

  if (score >= 4) {
    return "High";
  }

  if (score >= 2) {
    return "Medium";
  }

  return "Low";
}