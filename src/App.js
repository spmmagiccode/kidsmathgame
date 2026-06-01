import React, { useState, useEffect } from "react";

export default function App() {
  // --- STATE MACHINE FOR SCREENS ---
  const [screen, setScreen] = useState("WELCOME_BITMAP");
  const [nextScreenAfterLoad, setNextScreenAfterLoad] = useState("MAIN_MENU");

  // --- SELECTION VARIABLES ---
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDigit, setSelectedDigit] = useState("");

  // --- GAMEPLAY VARIABLES ---
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [op, setOp] = useState("+");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [correctRemainder, setCorrectRemainder] = useState(0);
  const [divisionRemainderMode, setDivisionRemainderMode] = useState(false);

  const [ansQ, setAnsQ] = useState("");
  const [ansR, setAnsR] = useState("");
  const [enteringRemainder, setEnteringRemainder] = useState(false);

  const [score, setScore] = useState(0);
  const [qCount, setQCount] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubText, setFeedbackSubText] = useState("");

  const totalQuestions = 10;

  // --- ANIMATION CONTROLLER ---
  const [loadingFrame, setLoadingFrame] = useState(0);

  // --- HELPER ARDUINO RANDOM MAPPER ---
  const getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  };

  // --- TIMED TRANSITIONS (SETUP PROCESSES) ---
  useEffect(() => {
    if (screen === "WELCOME_BITMAP") {
      const timer = setTimeout(() => setScreen("WELCOME_TEXT"), 5000);
      return () => clearTimeout(timer);
    }
    if (screen === "WELCOME_TEXT") {
      const timer = setTimeout(() => {
        setNextScreenAfterLoad("MAIN_MENU");
        setScreen("LOADING_ANIMATION");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Replicating 5-second smooth loading loop animation frames
  useEffect(() => {
    if (screen === "LOADING_ANIMATION") {
      const interval = setInterval(() => {
        setLoadingFrame((prev) => (prev + 1) % 8);
      }, 80);

      const timer = setTimeout(() => {
        clearInterval(interval);
        setScreen(nextScreenAfterLoad);
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [screen, nextScreenAfterLoad]);

  // Handle Score page timing transition back to menu
  useEffect(() => {
    if (screen === "SCORE") {
      const timer = setTimeout(() => {
        setScreen("MAIN_MENU");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // --- MATH QUESTION GENERATION LOGIC ---
  const generateGrade3Minus = () => {
    let valid = false;
    let n1 = 0,
      n2 = 0;
    while (!valid) {
      let t1 = getRandom(1, 9);
      let o1 = getRandom(0, 9);
      let t2 = getRandom(1, t1 + 1);
      let o2 = getRandom(0, o1 + 1);
      n1 = t1 * 10 + o1;
      n2 = t2 * 10 + o2;
      if (n1 > n2) valid = true;
    }
    return { n1, n2, ans: n1 - n2, rem: 0 };
  };

  const generate3DigitAddition = () => {
    let valid = false;
    let n1 = 123,
      n2 = 234,
      ans = 357;
    for (let i = 0; i < 200 && !valid; i++) {
      let h1 = getRandom(1, 9);
      let h2 = getRandom(1, 9);
      let t1 = getRandom(0, 9);
      let t2 = getRandom(0, 9);
      let o1 = getRandom(0, 10);
      let o2 = getRandom(0, 10);
      let sum = h1 * 100 + t1 * 10 + o1 + (h2 * 100 + t2 * 10 + o2);
      if (sum > 999) continue;
      if (o1 + o2 < 10) continue;
      if (t1 + t2 + 1 >= 10) continue;
      n1 = h1 * 100 + t1 * 10 + o1;
      n2 = h2 * 100 + t2 * 10 + o2;
      ans = sum;
      valid = true;
    }
    return { n1, n2, ans, rem: 0 };
  };

  const generateGrade4Addition = (digits) => {
    let valid = false;
    let limit = digits === 3 ? 999 : 9999;
    let startNum = digits === 3 ? 100 : 1000;
    let n1 = 100,
      n2 = 200,
      ans = 300;

    for (let i = 0; i < 300 && !valid; i++) {
      n1 = getRandom(startNum, limit);
      n2 = getRandom(startNum, limit);
      let a = n1,
        b = n2;
      let carryCount = 0,
        sum = 0,
        carry = 0;

      for (let p = 0; p < digits; p++) {
        let d1 = a % 10;
        let d2 = b % 10;
        let s = d1 + d2 + carry;
        if (s >= 10) {
          carryCount++;
          carry = 1;
        } else {
          carry = 0;
        }
        sum += (s % 10) * Math.pow(10, p);
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
      }
      sum += carry * Math.pow(10, digits);
      if (sum > limit) continue;
      if (carryCount > 1) continue;
      ans = n1 + n2;
      valid = true;
    }
    return { n1, n2, ans, rem: 0 };
  };

  const generateGrade4Subtraction = (digits) => {
    let valid = false;
    let minVal = digits === 2 ? 10 : 100;
    let maxVal = digits === 2 ? 99 : 999;
    let n1 = 54,
      n2 = 23,
      ans = 31;

    for (let i = 0; i < 500 && !valid; i++) {
      n1 = getRandom(minVal, maxVal + 1);
      n2 = getRandom(minVal, maxVal + 1);
      if (n1 <= n2) continue;
      let a = n1,
        b = n2;
      let borrowCount = 0,
        borrow = 0;

      for (let p = 0; p < digits; p++) {
        let d1 = a % 10;
        let d2 = b % 10;
        d1 -= borrow;
        if (d1 < d2) {
          borrowCount++;
          borrow = 1;
        } else {
          borrow = 0;
        }
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
      }
      if (borrowCount > 1) continue;
      ans = n1 - n2;
      valid = true;
    }
    return { n1, n2, ans, rem: 0 };
  };

  const generateGrade5Addition = () => {
    let valid = false;
    let n1 = 2345,
      n2 = 1234,
      ans = 3579;
    for (let i = 0; i < 500 && !valid; i++) {
      n1 = getRandom(1000, 9999);
      n2 = getRandom(1000, 9999);
      if (n1 + n2 >= 9999) continue;
      let a = n1,
        b = n2,
        carry = 0,
        carryCount = 0;
      for (let p = 0; p < 4; p++) {
        let d1 = a % 10;
        let d2 = b % 10;
        let s = d1 + d2 + carry;
        if (s >= 10) {
          carryCount++;
          carry = 1;
        } else {
          carry = 0;
        }
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
      }
      if (carryCount > 2) continue;
      ans = n1 + n2;
      valid = true;
    }
    return { n1, n2, ans, rem: 0 };
  };

  const generateGrade5Subtraction = (digits) => {
    let valid = false;
    let maxVal = digits === 3 ? 999 : 9999;
    let minVal = digits === 3 ? 100 : 1000;
    let n1 = digits === 3 ? 543 : 5432;
    let n2 = digits === 3 ? 321 : 3210;
    let ans = n1 - n2;

    for (let i = 0; i < 500 && !valid; i++) {
      n1 = getRandom(minVal, maxVal);
      n2 = getRandom(minVal, maxVal);
      if (n1 <= n2) continue;
      let a = n1,
        b = n2,
        borrow = 0,
        borrowCount = 0;
      for (let p = 0; p < digits; p++) {
        let d1 = a % 10;
        let d2 = b % 10;
        d1 -= borrow;
        if (d1 < d2) {
          borrow = 1;
          borrowCount++;
        } else {
          borrow = 0;
        }
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
      }
      if (digits === 3 && borrowCount > 1) continue;
      if (digits === 4 && borrowCount > 2) continue;
      ans = n1 - n2;
      valid = true;
    }
    return { n1, n2, ans, rem: 0 };
  };

  const generateGrade5Multiplication = (digits) => {
    let valid = false;
    let n1 = digits === 2 ? 12 : 102;
    let n2 = digits === 2 ? 6 : 3;
    let ans = n1 * n2;

    for (let i = 0; i < 600 && !valid; i++) {
      if (digits === 2) {
        n1 = getRandom(1, 100);
        let options2 = [6, 7, 8, 9, 10];
        n2 = options2[getRandom(0, 5)];
        ans = n1 * n2;
        valid = true;
      } else {
        n1 = getRandom(100, 1000);
        let options3 = [2, 3, 4, 5, 6, 7];
        n2 = options3[getRandom(0, 6)];
        let tempNum1 = n1,
          carryCount = 0,
          currentCarry = 0;
        while (tempNum1 > 0) {
          let digit = tempNum1 % 10;
          let prod = digit * n2 + currentCarry;
          currentCarry = Math.floor(prod / 10);
          if (currentCarry > 0) carryCount++;
          tempNum1 = Math.floor(tempNum1 / 10);
        }
        if (carryCount <= 1) {
          ans = n1 * n2;
          valid = true;
        }
      }
    }
    return { n1, n2, ans, rem: 0 };
  };

  const initQuestion = (g, t, d) => {
    let qData = { n1: 0, n2: 0, ans: 0, rem: 0 };
    let currentOp = "+";
    let isDivWithRemainder = false;

    if (g === "A") {
      if (t === "B") {
        currentOp = "-";
        qData = generateGrade3Minus();
      } else if (t === "A") {
        currentOp = "+";
        if (d === "A") {
          let n1 = getRandom(10, 99);
          let n2 = getRandom(10, 99);
          qData = { n1, n2, ans: n1 + n2, rem: 0 };
        } else {
          qData = generate3DigitAddition();
        }
      } else if (t === "C") {
        currentOp = "*";
        let n1 = getRandom(1, 10);
        let options = [2, 5, 10];
        let n2 = options[getRandom(0, 3)];
        qData = { n1, n2, ans: n1 * n2, rem: 0 };
      } else if (t === "D") {
        currentOp = "/";
        isDivWithRemainder = true;
        let n1 = getRandom(20, 99);
        let n2 = 2;
        qData = { n1, n2, ans: Math.floor(n1 / n2), rem: n1 % n2 };
      }
    } else if (g === "B") {
      if (t === "A") {
        currentOp = "+";
        qData = generateGrade4Addition(d === "A" ? 3 : 4);
      } else if (t === "B") {
        currentOp = "-";
        qData = generateGrade4Subtraction(d === "A" ? 2 : 3);
      } else if (t === "C") {
        currentOp = "*";
        let n1 = getRandom(10, 99);
        let options = [2, 3, 4, 5, 10];
        let n2 = options[getRandom(0, 5)];
        qData = { n1, n2, ans: n1 * n2, rem: 0 };
      } else if (t === "D") {
        currentOp = "/";
        isDivWithRemainder = true;
        let divisors = [2, 3, 4];
        let n2 = divisors[getRandom(0, 3)];
        let n1 = d === "A" ? getRandom(10, 99) : getRandom(100, 999);
        qData = { n1, n2, ans: Math.floor(n1 / n2), rem: n1 % n2 };
      }
    } else if (g === "C") {
      if (t === "A") {
        currentOp = "+";
        qData = generateGrade5Addition();
      } else if (t === "B") {
        currentOp = "-";
        qData = generateGrade5Subtraction(d === "A" ? 3 : 4);
      } else if (t === "C") {
        currentOp = "*";
        qData = generateGrade5Multiplication(d === "A" ? 2 : 3);
      } else if (t === "D") {
        currentOp = "/";
        isDivWithRemainder = true;
        let divisors = d === "A" ? [2, 3, 4] : [2, 3, 4, 5, 6, 7];
        let n2 = divisors[getRandom(0, divisors.length)];
        let n1 = d === "A" ? getRandom(1, 99) : getRandom(100, 999);
        qData = { n1, n2, ans: Math.floor(n1 / n2), rem: n1 % n2 };
      }
    }

    setNum1(qData.n1);
    setNum2(qData.n2);
    setOp(currentOp);
    setCorrectAnswer(qData.ans);
    setCorrectRemainder(qData.rem);
    setDivisionRemainderMode(isDivWithRemainder);

    setAnsQ("");
    setAnsR("");
    setEnteringRemainder(false);
  };

  // --- ARDUINO ROUTING COMPATIBILITY CHECKS ---
  const handleTypeSelection = (typeVal) => {
    setSelectedType(typeVal);
    if (
      selectedGrade === "A" &&
      (typeVal === "B" || typeVal === "C" || typeVal === "D")
    ) {
      startNewGame(selectedGrade, typeVal, "");
      return;
    }
    if (selectedGrade === "B" && typeVal === "C") {
      startNewGame(selectedGrade, typeVal, "");
      return;
    }
    if (selectedGrade === "C" && typeVal === "A") {
      startNewGame(selectedGrade, typeVal, "");
      return;
    }
    setScreen("SELECT_DIGIT");
  };

  const startNewGame = (g, t, d) => {
    setScore(0);
    setQCount(0);
    setScreen("GAMEPLAY");
    initQuestion(g, t, d);
  };

  const submitAnswer = () => {
    const userAns = parseInt(ansQ) || 0;
    const userRem = parseInt(ansR) || 0;
    let isCorrect = false;

    if (divisionRemainderMode) {
      if (userAns === correctAnswer && userRem === correctRemainder)
        isCorrect = true;
    } else {
      if (userAns === correctAnswer) isCorrect = true;
    }

    let nextScore = score;
    if (isCorrect) {
      setFeedbackText("පිළිතුර නිවැරදියි");
      nextScore = score + 1;
      setScore(nextScore);
    } else {
      setFeedbackText("වැරදියි! උත්සාහ කරන්න.");
      if (divisionRemainderMode) {
        setFeedbackSubText(
          `පිළිතුර: ${correctAnswer}  ඉතිරිය: ${correctRemainder}`,
        );
      } else {
        setFeedbackSubText(`පිළිතුර: ${correctAnswer}`);
      }
    }

    setScreen("FEEDBACK");

    setTimeout(() => {
      setFeedbackSubText("");
      const nextQCount = qCount + 1;
      setQCount(nextQCount);

      if (nextQCount >= totalQuestions) {
        setScreen("GAME_OVER");
        setTimeout(() => {
          setNextScreenAfterLoad("SCORE");
          setScreen("LOADING_ANIMATION");
        }, 2500);
      } else {
        setScreen("GAMEPLAY");
        initQuestion(selectedGrade, selectedType, selectedDigit);
      }
    }, 2500);
  };

  // --- VIRTUAL HARDWARE KEYPAD CONTROLLER ---
  const handleKeyPress = (key) => {
    if (screen === "MAIN_MENU" || screen === "ABOUT") {
      if (key === "1") setScreen("SELECT_GRADE");
    } else if (screen === "SELECT_GRADE") {
      if (key === "A" || key === "B" || key === "C") {
        setSelectedGrade(key);
        setScreen("SELECT_TYPE");
      }
    } else if (screen === "SELECT_TYPE") {
      if (key === "A" || key === "B" || key === "C" || key === "D") {
        handleTypeSelection(key);
      }
    } else if (screen === "SELECT_DIGIT") {
      if (key === "A" || key === "B") {
        setSelectedDigit(key);
        startNewGame(selectedGrade, selectedType, key);
      }
    } else if (screen === "GAMEPLAY") {
      if (key === "පිළිතුර සටහන් කරන්න") {
        submitAnswer();
      } else if (key === "ඉතිරිය" && divisionRemainderMode) {
        setEnteringRemainder(true);
      } else if (key >= "0" && key <= "9") {
        if (divisionRemainderMode) {
          if (!enteringRemainder) {
            setAnsQ((prev) => prev + key);
          } else {
            setAnsR((prev) => prev + key);
          }
        } else {
          setAnsQ((prev) => prev + key);
        }
      }
    }
  };

  const handleRestart = () => {
    setScreen("WELCOME_BITMAP");
    setNextScreenAfterLoad("MAIN_MENU");
    setScore(0);
    setQCount(0);
    setAnsQ("");
    setAnsR("");
    setSelectedGrade("");
    setSelectedType("");
    setSelectedDigit("");
  };

  const handleAbout = () => {
    setScreen("ABOUT");
  };

  // --- RENDER SCREEN INTERFACES ---
  const renderOledDisplay = () => {
    switch (screen) {
      case "WELCOME_BITMAP":
        return (
          <div style={styles.oledCentered}>
            <div style={styles.oledGraphicsOuter}>
              <div style={styles.oledGraphicsInnerCentred}>
                <span style={styles.oledTextMedium}>{"★ ආයුබෝවන් ★"}</span>
              </div>
            </div>
          </div>
        );
      case "WELCOME_TEXT":
        return (
          <div style={styles.oledCentered}>
            <div style={styles.oledGraphicsOuter}>
              <div style={styles.oledGraphicsInnerCentred}>
                <span style={styles.oledTextMedium}>ඔබව ගණිත තරඟයට</span>
                <span style={styles.oledTextMedium}>සාදරයෙන් පිළිගන්නවා</span>
              </div>
            </div>
          </div>
        );
      case "LOADING_ANIMATION":
        return (
          <div style={styles.oledCentered}>
            <div style={styles.oledGraphicsOuter}>
              <div style={styles.oledGraphicsInnerCentred}>
                <span style={styles.oledTextMedium}>රැඳී සිටින්න...</span>
                <span style={styles.oledTextLarge}>
                  {["▖", "▘", "▝", "▗", "▚", "▞", "█", "▒"][loadingFrame]}
                </span>
              </div>
            </div>
          </div>
        );
      case "MAIN_MENU":
        return (
          <div style={styles.oledCentered}>
            <div style={styles.oledGraphicsOuter}>
              <div style={styles.oledGraphicsInnerCentred}>
                <span style={styles.oledTextMedium}>තරඟය ආරම්භ කිරීමට</span>
                <span style={styles.oledTextMedium}>1 ඔබන්න</span>
              </div>
            </div>
          </div>
        );
      case "SELECT_GRADE":
        return (
          <div style={styles.oledLeftAligned}>
            <div style={styles.oledGraphicsOuter}>
              <div style={styles.oledGraphicsInnerLeft}>
                <span style={styles.oledTextMediumLeft}> ශ්‍රේණිය තෝරන්න:</span>
                <span style={styles.oledTextSmall}>A : 3 ශ්‍රේණිය</span>
                <span style={styles.oledTextSmall}>B : 4 ශ්‍රේණිය</span>
                <span style={styles.oledTextSmall}>C : 5 ශ්‍රේණිය</span>
              </div>
            </div>
          </div>
        );
      case "SELECT_TYPE":
        return (
          <div style={styles.oledLeftAligned}>
            <div style={styles.oledGraphicsOuter}>
              <div style={styles.oledGraphicsInnerLeft}>
                <span style={styles.oledTextMediumLeft}>
                  ගණිත කර්මය තෝරන්න:
                </span>
                <span style={styles.oledTextSmall}>A : එකතු කිරීම</span>
                <span style={styles.oledTextSmall}>B : අඩු කිරීම</span>
                <span style={styles.oledTextSmall}>C : ගුණ කිරීම</span>
                <span style={styles.oledTextSmall}>D : බෙදීම</span>
              </div>
            </div>
          </div>
        );
      case "SELECT_DIGIT":
        return (
          <div style={styles.oledLeftAligned}>
            <div style={styles.oledGraphicsOuter}>
              <div style={styles.oledGraphicsInnerLeft}>
                <span style={styles.oledTextMediumLeft}>ඉලක්කම් ගණන:</span>
                {selectedGrade === "B" && selectedType === "A" ? (
                  <>
                    <span style={styles.oledTextSmall}>A : ඉලක්කම් 3</span>
                    <span style={styles.oledTextSmall}>B : ඉලක්කම් 4</span>
                  </>
                ) : selectedGrade === "B" && selectedType === "B" ? (
                  <>
                    <span style={styles.oledTextSmall}>A : ඉලක්කම් 2</span>
                    <span style={styles.oledTextSmall}>B : ඉලක්කම් 3</span>
                  </>
                ) : selectedGrade === "B" && selectedType === "D" ? (
                  <>
                    <span style={styles.oledTextSmall}>A : ඉලක්කම් 2</span>
                    <span style={styles.oledTextSmall}>B : ඉලක්කම් 3</span>
                  </>
                ) : selectedGrade === "C" && selectedType === "B" ? (
                  <>
                    <span style={styles.oledTextSmall}>A : ඉලක්කම් 3</span>
                    <span style={styles.oledTextSmall}>B : ඉලක්කම් 4</span>
                  </>
                ) : (
                  <>
                    <span style={styles.oledTextSmall}>A : ඉලක්කම් 2</span>
                    <span style={styles.oledTextSmall}>B : ඉලක්කම් 3</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      case "GAMEPLAY":
        return (
          <div style={styles.oledCentered}>
            <span style={styles.oledTextHeader}>ප්‍රශ්නය {qCount + 1}</span>
            <span style={styles.oledTextMath}>
              {num1} {op} {num2}
            </span>
            <div style={styles.ansDisplayContainer}>
              {divisionRemainderMode ? (
                <div
                  style={{
                    alignItems: "flex-start",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <span style={styles.oledTextMediumLeft}>
                    පිළිතුර : {ansQ}
                  </span>
                  <span style={styles.oledTextMediumLeft}>ඉතිරිය : {ansR}</span>
                </div>
              ) : (
                <span style={styles.oledTextLarge}>පිළිතුර : {ansQ}</span>
              )}
            </div>
          </div>
        );
      case "FEEDBACK":
        return (
          <div style={styles.oledCentered}>
            <span style={styles.oledTextLarge}>{feedbackText}</span>
            {feedbackSubText ? (
              <span
                style={{
                  ...styles.oledTextMedium,
                  marginTop: "15px",
                  color: "#ff9500",
                }}
              >
                {feedbackSubText}
              </span>
            ) : null}
          </div>
        );
      case "GAME_OVER":
        return (
          <div style={styles.oledCentered}>
            <span style={styles.oledTextLarge}>තරඟය අවසන්!</span>
          </div>
        );
      case "SCORE":
        return (
          <div style={styles.oledCentered}>
            <span style={styles.oledTextMedium}>ලබාගත් ලකුණු ප්‍රමාණය</span>
            <span
              style={{
                ...styles.oledTextLarge,
                fontSize: "50px",
                marginTop: "10px",
                color: "#00ffff",
              }}
            >
              {score} / {totalQuestions}
            </span>
          </div>
        );
      case "ABOUT":
        return (
          <div style={styles.oledCentered}>
            <div style={styles.oledGraphicsOuter}>
              <div style={styles.oledGraphicsInnerCentred}>
                <span style={styles.oledTextMedium}>ගණිත හපනා</span>
                <span
                  style={{
                    ...styles.oledTextSmall,
                    display: "block",
                    textAlign: "center",
                    fontSize: 12,
                    marginTop: "5px",
                  }}
                >
                  ඔබේ ගණිත හැකියාව ඔප්නංවන පුංචි තක්සලාව!
                </span>
                <span
                  style={{
                    ...styles.oledTextSmall,
                    display: "block",
                    textAlign: "center",
                    fontSize: 13,
                    marginTop: "10px",
                    color: "#ff9500",
                  }}
                >
                  POWERED BY : ⭐SM ELECTRONIC ARTS⭐
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const keypadMatrix = [
    ["1", "2", "3", "A"],
    ["4", "5", "6", "B"],
    ["7", "8", "9", "C"],
    ["ඉතිරිය", "0", "පිළිතුර සටහන් කරන්න", "D"],
  ];

  return (
    <div style={styles.container}>
      <div style={styles.hardwareContainer}>
        {/* RETRO SSD1306 OLED EMULATED DISPLAY */}
        <div style={styles.oledFrame}>
          <div style={styles.oledScreen}>{renderOledDisplay()}</div>
        </div>

        {/* SPACING DESIGN LABELS */}
        <div
          style={{
            ...styles.hardwareLabel,
            fontSize: "20px",
          }}
        >
          = ගණිත හපනා =
        </div>

        {/* 4X4 PHYSICAL MATRIX KEYPAD WITH INTEGRATED ACTIONS */}
        <div style={styles.keypadContainer}>
          {keypadMatrix.map((row, rowIndex) => (
            <div key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => {
                const isLetter = ["A", "B", "C", "D"].includes(key);
                const isAction = ["ඉතිරිය", "පිළිතුර සටහන් කරන්න"].includes(
                  key,
                );

                let dynamicKeyStyle = { ...styles.keyButton };
                if (isLetter)
                  dynamicKeyStyle = {
                    ...dynamicKeyStyle,
                    ...styles.keyButtonLetter,
                  };
                if (isAction)
                  dynamicKeyStyle = {
                    ...dynamicKeyStyle,
                    ...styles.keyButtonAction,
                  };

                return (
                  <button
                    key={key}
                    style={dynamicKeyStyle}
                    onClick={() => handleKeyPress(key)}
                  >
                    <span
                      style={
                        key === "පිළිතුර සටහන් කරන්න"
                          ? styles.keyTextActionLong
                          : key === "ඉතිරිය"
                            ? styles.keyTextActionShort
                            : styles.keyText
                      }
                    >
                      {key}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* RESTART & ABOUT BUTTONS INSIDE KEYPAD */}
          <div style={{ ...styles.keypadRow, marginTop: "10px" }}>
            <button style={styles.keypadActionButton} onClick={handleRestart}>
              <span style={styles.keypadActionButtonText}>යළි අරඹන්න</span>
            </button>
            <button style={styles.keypadActionButton} onClick={handleAbout}>
              <span style={styles.keypadActionButtonText}>ක්‍රීඩාව ගැන</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HARDWARE WEB INLINE-STYLES CONFIGURATIONS ---
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#1c1c1e",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },

  hardwareContainer: {
    width: "95%",
    maxWidth: "420px",
    backgroundColor: "#2c2c2e",
    borderRadius: "20px",
    padding: "15px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#48484a",
    boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.5)",
    boxSizing: "border-box",
  },

  oledFrame: {
    backgroundColor: "#000",
    borderRadius: "10px",
    padding: "6px",
    borderWidth: "4px",
    borderStyle: "solid",
    borderColor: "#3a3a3c",
    marginBottom: "15px",
  },

  oledScreen: {
    width: "100%",
    height: "290px",
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "10px",
    paddingRight: "10px",
    boxSizing: "border-box",
  },

  oledCentered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  oledLeftAligned: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
  },

  oledTextHeader: {
    fontFamily: "monospace",
    color: "#ff9500",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "5px",
  },

  oledTextMath: {
    fontFamily: "monospace",
    color: "#ffffff",
    fontSize: "36px",
    fontWeight: "bold",
    marginTop: "5px",
    marginBottom: "5px",
    textShadow: "0 0 3px rgba(255,255,255,0.3)",
  },

  oledTextLarge: {
    fontFamily: "monospace",
    color: "#00ffff",
    fontSize: "30px",
    fontWeight: "bold",
    textAlign: "center",
    textShadow: "0 0 4px rgba(0,255,255,0.6)",
  },

  oledTextMedium: {
    fontFamily: "monospace",
    color: "#00ffff",
    fontSize: "22px",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: "30px",
  },

  oledTextMediumLeft: {
    fontFamily: "monospace",
    color: "#00ffff",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "8px",
    textAlign: "left",
  },

  oledTextSmall: {
    fontFamily: "monospace",
    color: "#ffffff",
    fontSize: "18px",
    lineHeight: "28px",
    textAlign: "left",
  },

  ansDisplayContainer: {
    marginTop: "10px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "#3a3a3c",
    paddingTop: "10px",
    width: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  oledGraphicsOuter: {
    width: "100%",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#00ffff",
    padding: "4px",
    marginTop: "5px",
    marginBottom: "5px",
    boxSizing: "border-box",
  },

  oledGraphicsInnerCentred: {
    width: "100%",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#00ffff",
    paddingTop: "25px",
    paddingBottom: "25px",
    paddingLeft: "10px",
    paddingRight: "10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box",
  },

  oledGraphicsInnerLeft: {
    width: "100%",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#00ffff",
    paddingTop: "20px",
    paddingBottom: "20px",
    paddingLeft: "15px",
    paddingRight: "15px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    boxSizing: "border-box",
  },

  hardwareLabel: {
    color: "#eaeaea",
    fontSize: "11px",
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: "1.5px",
    marginBottom: "10px",
  },

  keypadContainer: {
    backgroundColor: "#1c1c1e",
    borderRadius: "12px",
    padding: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#3a3a3c",
    boxSizing: "border-box",
  },

  keypadRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "4px",
    marginBottom: "4px",
  },

  keyButton: {
    width: "22%",
    padding: "5px",
    height: "calc(420px * 0.22 / 1.25)",
    maxHeight: "calc(95vw * 0.22 / 1.25)",
    minHeight: "55px",
    backgroundColor: "#3a3a3c",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: "0px 0px 4px 0px",
    borderStyle: "solid",
    borderColor: "#2c2c2e",
    cursor: "pointer",
    outline: "none",
    boxSizing: "border-box",
  },

  keyButtonLetter: {
    backgroundColor: "#8e8e93",
    borderColor: "#636366",
  },

  keyButtonAction: {
    backgroundColor: "#ff9500",
    borderColor: "#cc7a00",
  },

  keyText: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "bold",
    fontFamily: "monospace",
  },

  // "පිළිතුර සටහන් කරන්න" සඳහා විශාල කරන ලද Font ශෛලිය
  keyTextActionLong: {
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
    textAlign: "center",
    lineHeight: "15px",
    wordBreak: "break-word",
  },

  // "ඉතිරිය" සඳහා විශාල කරන ලද Font ශෛලිය
  keyTextActionShort: {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
    textAlign: "center",
  },

  keypadActionButton: {
    width: "48%",
    backgroundColor: "#3a3a3c",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: "0px 0px 4px 0px",
    borderStyle: "solid",
    borderColor: "#2c2c2e",
    paddingTop: "12px",
    paddingBottom: "12px",
    cursor: "pointer",
    outline: "none",
    boxSizing: "border-box",
  },

  keypadActionButtonText: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
  },
};
