
import { useState } from "react";

import {
  calculateDTI,
  calculateAvailableIncome,
  calculateComfortableEmi,
  calculateLoanAmountFromEmi,
  calculateLenderEstimate,
  calculateRecommendedAmount,
  calculateBorrowingDecision,
  calculateFairRateBand,
  calculateAllInAPR,
  calculateEmi,
  calculateTotalInterest,
  calculateStressIncome,
  calculateStressEmiCapacity,
  calculateStressStatus,
  shouldNotBorrowDueToRiskyDebt,
  calculateRiskAdjustedRecommendedAmount,
} from "./borrowingEngine";

type Decision = "Borrow" | "Borrow Less" | "Don't Borrow";

type Result = {
  lenderEstimate: number;
  saferAmount: number;
  recommendedAmount: number;
  minRate: number;
  maxRate: number;
  minApr: number;
  maxApr: number;
  safeEmi: number;
  dti: number;
  availableIncome: number;
  emi3: number;
  interest3: number;
  emi5: number;
  interest5: number;
  stressIncome: number;
  stressCapacity: number;
  stressStatus: string;
};

function App() {
  const [step, setStep] = useState(0);

  const [purpose, setPurpose] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [loanType, setLoanType] = useState("");

  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [incomeStability, setIncomeStability] =
    useState("Very predictable");

  const [existingEmi, setExistingEmi] = useState("");
  const [debtDuration, setDebtDuration] = useState("");
  const [riskyDebt, setRiskyDebt] = useState("");

  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [purposeDetail, setPurposeDetail] = useState("");

  const [age, setAge] = useState("");
  const [creditKnown, setCreditKnown] = useState("");
  const [creditScore, setCreditScore] = useState("");

  const [decision, setDecision] =
    useState<Decision>("Don't Borrow");

  const [result, setResult] = useState<Result | null>(null);

  const amount = Number(requestedAmount) || 0;
  const income = Number(monthlyIncome) || 0;
  const emi = Number(existingEmi) || 0;
  const expenses = Number(monthlyExpenses) || 0;
  const score = Number(creditScore) || 0;

  /*
    --------------------------------------------------
    VALIDATION
    --------------------------------------------------
  */

  function isCurrentStepValid(): boolean {
    switch (step) {
      case 1:
        return !!purpose;

      case 2:
        return amount > 0;

      case 3:
        return !!loanType;

      case 4:
        return income > 0 && !!incomeType;

      case 5:
        return !!incomeStability;

      case 6:
        return existingEmi !== "";

      case 7:
        return !!riskyDebt;

      case 8:
        return !!debtDuration;

      case 9:
        return monthlyExpenses !== "";

      case 10:
        return !!purposeDetail;

      case 11:
        return Number(age) > 0;

      case 12:
        return (
          !!creditKnown &&
          (creditKnown === "No" || score > 0)
        );

      default:
        return true;
    }
  }

  /*
    --------------------------------------------------
    ENTER KEY
    --------------------------------------------------
  */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>
  ) {
    if (event.key !== "Enter") {
      return;
    }

    const target = event.target as HTMLElement;

    /*
      Continue / Back button:
      Let browser handle the button naturally.
    */
    if (
      target.classList.contains("next-button") ||
      target.classList.contains("back-button")
    ) {
      return;
    }

    /*
      Option button:
      Press Enter after selecting an option.
    */
    if (
      target.classList.contains("option-button")
    ) {
      if (!isCurrentStepValid()) {
        return;
      }

      event.preventDefault();
      goNext();
      return;
    }

    /*
      Input:
      Press Enter after typing.
    */
    if (target.tagName === "INPUT") {
      if (!isCurrentStepValid()) {
        return;
      }

      event.preventDefault();
      goNext();
      return;
    }

    /*
      Landing page.
    */
    if (step === 0) {
      event.preventDefault();
      goNext();
      return;
    }

    /*
      Assessment ready page.
    */
    if (step === 13) {
      event.preventDefault();
      calculateResults();
      setStep(14);
    }
  }

  /*
    --------------------------------------------------
    NEXT
    --------------------------------------------------
  */

  function goNext() {
    switch (step) {
      case 0:
        setStep(1);
        break;

      case 1:
        setStep(2);
        break;

      case 2:
        setStep(3);
        break;

      case 3:
        setStep(4);
        break;

      case 4:
        if (incomeType === "Salaried") {
          setIncomeStability("Very predictable");
          setStep(6);
        } else {
          setStep(5);
        }
        break;

      case 5:
        setStep(6);
        break;

      case 6:
        if (emi <= 0) {
          setRiskyDebt("No");
          setDebtDuration("No existing debt");
          setStep(9);
        } else {
          setStep(7);
        }
        break;

      case 7:
        setStep(8);
        break;

      case 8:
        setStep(9);
        break;

      case 9:
        if (amount > income * 6) {
          setStep(10);
        } else {
          setPurposeDetail("Not required");
          setStep(11);
        }
        break;

      case 10:
        setStep(11);
        break;

      case 11:
        setStep(12);
        break;

      case 12:
        calculateResults();
        setStep(14);
        break;

      default:
        break;
    }
  }

  /*
    --------------------------------------------------
    BACK
    --------------------------------------------------
  */

  function goBack() {
    if (step <= 1) {
      setStep(0);
      return;
    }

    if (
      step === 6 &&
      incomeType === "Salaried"
    ) {
      setStep(4);
      return;
    }

    if (step === 9 && emi <= 0) {
      setStep(6);
      return;
    }

    if (
      step === 11 &&
      amount <= income * 6
    ) {
      setStep(9);
      return;
    }

    setStep(step - 1);
  }

  /*
    --------------------------------------------------
    CALCULATIONS
    --------------------------------------------------
  */

  function calculateResults() {
    const availableIncome =
      calculateAvailableIncome(
        income,
        expenses,
        emi
      );

    const comfortableEmi =
      calculateComfortableEmi(
        availableIncome
      );

    let stabilityMultiplier = 1;

    if (
      incomeStability ===
      "Somewhat predictable"
    ) {
      stabilityMultiplier = 0.875;
    }

    if (
      incomeStability ===
      "Highly variable"
    ) {
      stabilityMultiplier = 0.75;
    }

    const adjustedComfortableEmi =
      Math.round(
        comfortableEmi *
          stabilityMultiplier
      );

    const saferAmount =
      calculateLoanAmountFromEmi(
        adjustedComfortableEmi,
        14,
        5
      );

    const lenderEstimate =
      calculateLenderEstimate(
        income,
        incomeType,
        incomeStability
      );

    const baseRecommendedAmount =
      calculateRecommendedAmount(
        amount,
        saferAmount,
        lenderEstimate
      );

    const recommendedAmount =
      calculateRiskAdjustedRecommendedAmount(
        baseRecommendedAmount,
        riskyDebt
      );

    let calculatedDecision =
      calculateBorrowingDecision(
        amount,
        recommendedAmount,
        availableIncome
      );

    if (
      shouldNotBorrowDueToRiskyDebt(
        riskyDebt
      )
    ) {
      calculatedDecision =
        "Don't Borrow";
    }

    setDecision(calculatedDecision);

    const rateBand =
      calculateFairRateBand(
        creditKnown,
        score,
        incomeType,
        loanType,
        incomeStability
      );

    const minApr =
      recommendedAmount > 0
        ? calculateAllInAPR(
            rateBand.minRate,
            2,
            recommendedAmount,
            5
          )
        : 0;

    const maxApr =
      recommendedAmount > 0
        ? calculateAllInAPR(
            rateBand.maxRate,
            2,
            recommendedAmount,
            5
          )
        : 0;

    const dti =
      calculateDTI(
        income,
        emi
      );

    const emi3 =
      calculateEmi(
        recommendedAmount,
        14,
        3
      );

    const emi5 =
      calculateEmi(
        recommendedAmount,
        14,
        5
      );

    const interest3 =
      calculateTotalInterest(
        recommendedAmount,
        emi3,
        3
      );

    const interest5 =
      calculateTotalInterest(
        recommendedAmount,
        emi5,
        5
      );

    const stressIncome =
      calculateStressIncome(
        income,
        20
      );

    const stressCapacity =
      calculateStressEmiCapacity(
        stressIncome,
        expenses,
        emi
      );

    const proposedEmi =
      calculateEmi(
        recommendedAmount,
        14,
        5
      );

    const stressStatus =
      calculateStressStatus(
        stressCapacity,
        proposedEmi
      );

    setResult({
      lenderEstimate,
      saferAmount,
      recommendedAmount,
      minRate: rateBand.minRate,
      maxRate: rateBand.maxRate,
      minApr,
      maxApr,
      safeEmi: adjustedComfortableEmi,
      dti,
      availableIncome,
      emi3,
      interest3,
      emi5,
      interest5,
      stressIncome,
      stressCapacity,
      stressStatus,
    });
  }

  /*
    --------------------------------------------------
    RESET
    --------------------------------------------------
  */

  function resetApp() {
    setStep(0);

    setPurpose("");
    setRequestedAmount("");
    setLoanType("");

    setMonthlyIncome("");
    setIncomeType("");
    setIncomeStability(
      "Very predictable"
    );

    setExistingEmi("");
    setDebtDuration("");
    setRiskyDebt("");

    setMonthlyExpenses("");
    setPurposeDetail("");

    setAge("");
    setCreditKnown("");
    setCreditScore("");

    setDecision("Don't Borrow");
    setResult(null);
  }

  /*
    --------------------------------------------------
    LANDING
    --------------------------------------------------
  */

  function renderLanding() {
    return (
      <div className="hero">
        <div className="tag">
          BORROWER COPILOT
        </div>

        <h1>
          Should you borrow
          <br />
          at all?
        </h1>

        <p className="description">
          A simple India-focused borrowing
          assistant that helps you understand
          affordability, fair rates, EMI limits
          and negotiation points before taking
          a loan.
        </p>

        <button
          className="start-button"
          onClick={goNext}
        >
          Start assessment
        </button>
      </div>
    );
  }

  /*
    --------------------------------------------------
    QUESTIONS
    --------------------------------------------------
  */

  function renderQuestion() {
    if (step === 1) {
      return (
        <>
          <h1>
            What are you borrowing for?
          </h1>

          <div className="options">
            {[
              "Wedding",
              "Home",
              "Vehicle",
              "Education",
              "Business",
              "Medical",
              "Debt consolidation",
              "Other",
            ].map((item) => (
              <button
                key={item}
                className={`option-button ${
                  purpose === item
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setPurpose(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <h1>
            How much do you want to borrow?
          </h1>

          <p className="description">
            Enter the amount you are
            considering.
          </p>

          <input
            type="number"
            placeholder="₹ Amount"
            value={requestedAmount}
            onChange={(event) =>
              setRequestedAmount(
                event.target.value
              )
            }
          />
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <h1>
            What type of loan?
          </h1>

          <div className="options">
            {[
              "Personal Loan",
              "Vehicle Loan",
              "Home Loan",
              "Education Loan",
              "Business Loan",
            ].map((item) => (
              <button
                key={item}
                className={`option-button ${
                  loanType === item
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setLoanType(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === 4) {
      return (
        <>
          <h1>
            Tell me about your income
          </h1>

          <input
            type="number"
            placeholder="Net monthly income ₹"
            value={monthlyIncome}
            onChange={(event) =>
              setMonthlyIncome(
                event.target.value
              )
            }
          />

          <div className="options">
            {[
              "Salaried",
              "Self-employed",
              "Variable / Irregular",
            ].map((item) => (
              <button
                key={item}
                className={`option-button ${
                  incomeType === item
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setIncomeType(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === 5) {
      return (
        <>
          <h1>
            How predictable is your income?
          </h1>

          <div className="options">
            {[
              "Very predictable",
              "Somewhat predictable",
              "Highly variable",
            ].map((item) => (
              <button
                key={item}
                className={`option-button ${
                  incomeStability === item
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setIncomeStability(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === 6) {
      return (
        <>
          <h1>
            Do you already have EMIs?
          </h1>

          <p className="description">
            Include existing monthly loan
            payments.
          </p>

          <input
            type="number"
            placeholder="Existing EMI ₹"
            value={existingEmi}
            onChange={(event) =>
              setExistingEmi(
                event.target.value
              )
            }
          />
        </>
      );
    }

    if (step === 7) {
      return (
        <>
          <h1>
            Any risky existing debt?
          </h1>

          <p className="description">
            This helps prevent adding new
            debt when existing debt is already
            under stress.
          </p>

          <div className="options">
            {[
              "No",
              "Yes — high-cost app loan",
              "Yes — missed/bounced EMI",
            ].map((item) => (
              <button
                key={item}
                className={`option-button ${
                  riskyDebt === item
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setRiskyDebt(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === 8) {
      return (
        <>
          <h1>
            How long has the existing debt
            been present?
          </h1>

          <div className="options">
            {[
              "Less than 1 year",
              "1–3 years",
              "More than 3 years",
            ].map((item) => (
              <button
                key={item}
                className={`option-button ${
                  debtDuration === item
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setDebtDuration(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === 9) {
      return (
        <>
          <h1>
            What are your monthly
            household expenses?
          </h1>

          <p className="description">
            Include rent, food, utilities and
            other regular household spending.
          </p>

          <input
            type="number"
            placeholder="Monthly expenses ₹"
            value={monthlyExpenses}
            onChange={(event) =>
              setMonthlyExpenses(
                event.target.value
              )
            }
          />
        </>
      );
    }

    if (step === 10) {
      return (
        <>
          <h1>
            How essential is the full amount?
          </h1>

          <div className="options">
            {[
              "Essential expense",
              "Partly essential, partly optional",
              "Mostly optional",
            ].map((item) => (
              <button
                key={item}
                className={`option-button ${
                  purposeDetail === item
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setPurposeDetail(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === 11) {
      return (
        <>
          <h1>
            How old are you?
          </h1>

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(event) =>
              setAge(event.target.value)
            }
          />
        </>
      );
    }

    if (step === 12) {
      return (
        <>
          <h1>
            Do you know your credit score?
          </h1>

          <div className="options">
            {["Yes", "No"].map((item) => (
              <button
                key={item}
                className={`option-button ${
                  creditKnown === item
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setCreditKnown(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

          {creditKnown === "Yes" && (
            <input
              type="number"
              placeholder="Credit score"
              value={creditScore}
              onChange={(event) =>
                setCreditScore(
                  event.target.value
                )
              }
            />
          )}
        </>
      );
    }

    return null;
  }

  /*
    --------------------------------------------------
    RESULTS
    --------------------------------------------------
  */

  function renderResults() {
    if (!result) {
      return null;
    }

    const showApr =
      decision !== "Don't Borrow";

    let health = "Comfortable";
    let healthWidth = "90%";

    if (
      decision === "Don't Borrow"
    ) {
      health = "High Risk";
      healthWidth = "25%";
    } else if (
      result.stressStatus === "Tight"
    ) {
      health = "Needs Caution";
      healthWidth = "60%";
    }

    return (
      <>
        <h1>
          Your borrowing assessment
        </h1>

        <div
          className="result-card"
          style={{
            marginTop: "0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "1px",
              color: "#64748b",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Borrowing Health
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              marginBottom: "14px",
            }}
          >
            {health === "Comfortable" &&
              "🟢 "}
            {health === "Needs Caution" &&
              "🟡 "}
            {health === "High Risk" &&
              "🔴 "}
            {health}
          </div>

          <div
            style={{
              width: "100%",
              height: "10px",
              borderRadius: "999px",
              background: "#e2e8f0",
              overflow: "hidden",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: healthWidth,
                height: "100%",
                borderRadius: "999px",
                background:
                  health === "Comfortable"
                    ? "#22c55e"
                    : health ===
                      "Needs Caution"
                    ? "#f59e0b"
                    : "#ef4444",
                transition:
                  "width 0.8s ease",
              }}
            />
          </div>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            Based on affordability,
            existing obligations and the
            stress-case check.
          </p>
        </div>

        <div className="result-card">
          <div className="result-box">
            <h3>
              Recommendation
            </h3>

            <strong>
              {decision}
            </strong>

            <p>
              {decision === "Borrow"
                ? "Your requested amount is within the current affordability estimate."
                : decision ===
                  "Borrow Less"
                ? "The amount requested is higher than the amount the Copilot considers safer or more likely to fit lender limits."
                : "Adding a new loan is not recommended based on the current risk and affordability signals."}
            </p>
          </div>

          <div className="result-box">
            <h3>
              Lender-side planning estimate
            </h3>

            <strong>
              ₹
              {result.lenderEstimate.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              A planning estimate of likely
              sanction capacity. This is not
              a lender approval.
            </p>
          </div>

          <div className="result-box">
            <h3>
              Safer amount you can carry
            </h3>

            <strong>
              ₹
              {result.saferAmount.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Based on income, expenses,
              existing EMIs and a conservative
              EMI affordability limit.
            </p>
          </div>

          <div className="result-box">
            <h3>
              Recommended amount
            </h3>

            <strong>
              ₹
              {result.recommendedAmount.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Uses the lower of requested
              amount, safer affordability and
              lender-side planning capacity.
              Risky existing debt can reduce
              this to ₹0.
            </p>
          </div>

          <div className="result-box">
            <h3>
              Fair interest rate
            </h3>

            <strong>
              {result.minRate}% –{" "}
              {result.maxRate}%
            </strong>

            <p>
              Planning range based on credit
              quality, income type, stability
              and loan type.
            </p>
          </div>

          <div className="result-box">
            <h3>
              All-in APR estimate
            </h3>

            <strong>
              {showApr
                ? `${result.minApr}% – ${result.maxApr}%`
                : "Not applicable"}
            </strong>

            <p>
              Includes a 2% assumed processing
              fee. This is a simplified planning
              estimate, not a regulated APR
              calculation.
            </p>
          </div>

          <div className="result-box">
            <h3>
              Safe monthly EMI
            </h3>

            <strong>
              ₹
              {result.safeEmi.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Suggested EMI ceiling after
              considering existing monthly
              obligations.
            </p>
          </div>

          <div className="result-box">
            <h3>
              Current debt-to-income ratio
            </h3>

            <strong>
              {result.dti.toFixed(1)}%
            </strong>

            <p>
              Existing monthly EMI divided by
              net monthly income.
            </p>
          </div>

          <div className="result-box">
            <h3>
              Available monthly income
            </h3>

            <strong>
              ₹
              {result.availableIncome.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Income remaining after household
              expenses and existing EMI.
            </p>
          </div>

          <div className="result-box">
            <h3>
              3-year tenure
            </h3>

            <strong>
              ₹
              {result.emi3.toLocaleString(
                "en-IN"
              )}
              /month
            </strong>

            <p>
              Approx. total interest: ₹
              {result.interest3.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          <div className="result-box">
            <h3>
              5-year tenure
            </h3>

            <strong>
              ₹
              {result.emi5.toLocaleString(
                "en-IN"
              )}
              /month
            </strong>

            <p>
              Approx. total interest: ₹
              {result.interest5.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          <div className="result-box">
            <h3>
              Stress case
            </h3>

            <strong>
              {result.stressStatus}
            </strong>

            <p>
              If income falls 20%, estimated
              income becomes ₹
              {result.stressIncome.toLocaleString(
                "en-IN"
              )}
              . Estimated EMI capacity: ₹
              {result.stressCapacity.toLocaleString(
                "en-IN"
              )}
              .
            </p>
          </div>
        </div>

        {riskyDebt !== "No" && (
          <div className="why-box">
            <h3>
              ⚠️ Existing debt warning
            </h3>

            <p>
              New borrowing is not
              recommended while high-cost or
              missed-payment debt is present.
            </p>

            <p>
              The risk-adjusted recommended
              borrowing amount is ₹0.
            </p>

            <p>
              This is a conservative Copilot
              judgement, not a lender
              underwriting rule.
            </p>
          </div>
        )}

        <div className="why-box">
          <h3>
            Why this recommendation?
          </h3>

          <p>
            <strong>
              Requested:
            </strong>{" "}
            ₹
            {amount.toLocaleString(
              "en-IN"
            )}
          </p>

          <p>
            <strong>
              Income:
            </strong>{" "}
            ₹
            {income.toLocaleString(
              "en-IN"
            )}
            /month
          </p>

          <p>
            <strong>
              Existing EMI:
            </strong>{" "}
            ₹
            {emi.toLocaleString(
              "en-IN"
            )}
            /month
          </p>

          <p>
            <strong>
              Household expenses:
            </strong>{" "}
            ₹
            {expenses.toLocaleString(
              "en-IN"
            )}
            /month
          </p>

          <p>
            <strong>
              Purpose:
            </strong>{" "}
            {purpose}
          </p>

          {purposeDetail !==
            "Not required" && (
            <p>
              <strong>
                Full amount need:
              </strong>{" "}
              {purposeDetail}
            </p>
          )}

          {debtDuration !==
            "No existing debt" && (
            <p>
              <strong>
                Existing debt duration:
              </strong>{" "}
              {debtDuration}
            </p>
          )}
        </div>

        <button
          className="next-button"
          onClick={() => setStep(15)}
        >
          View Negotiation Card
        </button>

        <button
          className="back-button"
          onClick={() => setStep(13)}
        >
          Back
        </button>
      </>
    );
  }

  /*
    --------------------------------------------------
    NEGOTIATION CARD
    --------------------------------------------------
  */

  function renderNegotiationCard() {
    if (!result) {
      return null;
    }

    return (
      <>
        <h1>
          Negotiation Card
        </h1>

        <div className="negotiation-card">
          <h2>
            My Borrowing Position
          </h2>

          <div className="result-box">
            <h3>
              1. Amount to ask for
            </h3>

            <strong>
              ₹
              {result.recommendedAmount.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Do not start by asking for more
              than the amount you can reasonably
              carry.
            </p>
          </div>

          <div className="result-box">
            <h3>
              2. Fair interest rate
            </h3>

            <strong>
              {result.minRate}% –{" "}
              {result.maxRate}%
            </strong>

            <p>
              Ask the lender to explain where
              the offered rate sits within this
              planning range.
            </p>
          </div>

          <div className="result-box">
            <h3>
              3. Maximum comfortable EMI
            </h3>

            <strong>
              ₹
              {result.safeEmi.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Avoid accepting an EMI that
              pushes the monthly budget beyond
              this level.
            </p>
          </div>

          <div className="result-box">
            <h3>
              4. Ask for the all-in cost
            </h3>

            <strong>
              {decision ===
              "Don't Borrow"
                ? "Not applicable"
                : `${result.minApr}% – ${result.maxApr}% APR estimate`}
            </strong>

            <p>
              Ask for processing fees and other
              mandatory charges, not only the
              headline interest rate.
            </p>
          </div>

          <div className="result-box">
            <h3>
              5. Tenure trade-off
            </h3>

            <strong>
              3 years → ₹
              {result.emi3.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Higher EMI but lower total
              interest.
            </p>

            <strong
              style={{
                marginTop: "15px",
              }}
            >
              5 years → ₹
              {result.emi5.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Lower EMI but higher total
              interest.
            </p>
          </div>

          <div className="result-box">
            <h3>
              6. Stress check
            </h3>

            <strong>
              {result.stressStatus}
            </strong>

            <p>
              Stress case assumes a 20% income
              reduction. EMI capacity in that
              scenario is ₹
              {result.stressCapacity.toLocaleString(
                "en-IN"
              )}
              .
            </p>
          </div>
        </div>

        <button
          className="next-button"
          onClick={resetApp}
        >
          Start a new assessment
        </button>
      </>
    );
  }

  /*
    --------------------------------------------------
    RENDER
    --------------------------------------------------
  */

  return (
    <div
      className="app"
      onKeyDown={handleKeyDown}
    >
      {step === 0 && renderLanding()}

      {step >= 1 &&
        step <= 12 && (
          <div className="hero">
            <div className="tag">
              STEP {step} OF 12
            </div>

            {renderQuestion()}

            <button
              className="next-button"
              onClick={goNext}
              disabled={
                !isCurrentStepValid()
              }
            >
              Continue
            </button>

            <button
              className="back-button"
              onClick={goBack}
            >
              Back
            </button>
          </div>
        )}

      {step === 13 && (
        <div className="hero">
          <h1>
            Assessment ready
          </h1>

          <p className="description">
            We have enough information to
            estimate affordability, lender-side
            capacity, fair pricing and stress
            risk.
          </p>

          <button
            className="next-button"
            onClick={() => {
              calculateResults();
              setStep(14);
            }}
          >
            Show my results
          </button>

          <button
            className="back-button"
            onClick={goBack}
          >
            Back
          </button>
        </div>
      )}

      {step === 14 && (
        <div className="hero">
          {renderResults()}
        </div>
      )}

      {step === 15 && (
        <div className="hero">
          {renderNegotiationCard()}
        </div>
      )}
    </div>
  );
}

export default App;
