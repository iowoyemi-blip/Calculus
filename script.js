const topicNames = {
  limits: "Limits",
  derivatives: "Derivatives",
  integrals: "Integrals",
  analysis: "Function Analysis",
};

const state = {
  topic: "limits",
  currentQuestion: null,
  answered: false,
  scores: {
    limits: { correct: 0, total: 0 },
    derivatives: { correct: 0, total: 0 },
    integrals: { correct: 0, total: 0 },
    analysis: { correct: 0, total: 0 },
  },
};

const topicButtons = [...document.querySelectorAll(".tab")];
const topicLabel = document.getElementById("topicLabel");
const questionText = document.getElementById("questionText");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const topicScoreEl = document.getElementById("topicScore");
const totalScoreEl = document.getElementById("totalScore");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randomInt(0, items.length - 1)];
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

function texInline(tex) {
  return `\\(${tex}\\)`;
}

function texDisplay(tex) {
  return `\\[${tex}\\]`;
}

function formatFractionTex(numerator, denominator) {
  if (denominator === 0) {
    return "\\text{undefined}";
  }
  if (numerator === 0) {
    return "0";
  }

  const sign = numerator * denominator < 0 ? "-" : "";
  const n = Math.abs(numerator);
  const d = Math.abs(denominator);
  const div = gcd(n, d);
  const reducedN = n / div;
  const reducedD = d / div;

  if (reducedD === 1) {
    return `${sign}${reducedN}`;
  }
  return `${sign}\\frac{${reducedN}}{${reducedD}}`;
}

function formatLinearTex(a, b) {
  const aPart = a === 1 ? "x" : `${a}x`;
  if (b === 0) {
    return aPart;
  }
  return b > 0 ? `${aPart}+${b}` : `${aPart}-${Math.abs(b)}`;
}

function formatPowerTermTex(coef, power) {
  if (coef === 0) {
    return "0";
  }
  if (power === 0) {
    return `${coef}`;
  }

  const xPart = power === 1 ? "x" : `x^{${power}}`;
  if (coef === 1) {
    return xPart;
  }
  if (coef === -1) {
    return `-${xPart}`;
  }
  return `${coef}${xPart}`;
}

function formatXMinusTex(a) {
  return a >= 0 ? `x-${a}` : `x+${Math.abs(a)}`;
}

function formatXPlusTex(a) {
  return a >= 0 ? `x+${a}` : `x-${Math.abs(a)}`;
}

function formatQuadraticTex(a, b, c) {
  let expression = `${a}x^2`;
  if (b !== 0) {
    expression += b > 0 ? `+${b}x` : `-${Math.abs(b)}x`;
  }
  if (c !== 0) {
    expression += c > 0 ? `+${c}` : `-${Math.abs(c)}`;
  }
  return expression;
}

function formatSignedTermTex(coef, body) {
  if (coef === 0) {
    return "";
  }
  const sign = coef > 0 ? "+" : "-";
  const absCoef = Math.abs(coef);
  const coefPart = absCoef === 1 && body !== "" ? "" : `${absCoef}`;
  return `${sign}${coefPart}${body}`;
}

function buildChoices(correct, distractors) {
  const selected = [];
  const seen = new Set([correct]);

  for (const value of distractors) {
    if (!seen.has(value)) {
      selected.push(value);
      seen.add(value);
    }
    if (selected.length === 3) {
      break;
    }
  }

  let fill = -4;
  while (selected.length < 3) {
    const fallback = texInline(`${fill}`);
    if (!seen.has(fallback)) {
      selected.push(fallback);
      seen.add(fallback);
    }
    fill += 1;
  }

  const shuffled = shuffle([correct, ...selected]);
  return {
    options: shuffled,
    correctIndex: shuffled.indexOf(correct),
  };
}

function makeQuestion(prompt, correctTex, distractorTexList, explanation) {
  const correct = texInline(correctTex);
  const distractors = distractorTexList.map((tex) => texInline(tex));
  const answers = buildChoices(correct, distractors);

  return {
    prompt,
    options: answers.options,
    correctIndex: answers.correctIndex,
    correct,
    explanation,
  };
}

function limitDifferenceQuotient() {
  const a = randomInt(-6, 6);
  const denominator = formatXMinusTex(a);
  const pairedFactor = formatXPlusTex(a);
  const correctTex = `${2 * a}`;

  return makeQuestion(
    `Evaluate:${texDisplay(`\\lim_{x\\to ${a}}\\frac{x^2-${a * a}}{${denominator}}`)}`,
    correctTex,
    [`${a}`, `${a * a}`, `${2 * a + 2}`],
    `Factor ${texInline(`x^2-${a * a}`)} as ${texInline(`(${denominator})(${pairedFactor})`)}. Cancel the common factor and evaluate ${texInline(
      pairedFactor
    )} at ${texInline(`x=${a}`)} to get ${texInline(correctTex)}.`
  );
}

function limitTrig() {
  const k = randomInt(2, 8);
  const correctTex = `${k}`;

  return makeQuestion(
    `Evaluate:${texDisplay(`\\lim_{x\\to 0}\\frac{\\sin(${k}x)}{x}`)}`,
    correctTex,
    ["1", `${k * k}`, formatFractionTex(1, k)],
    `Use the standard limit ${texInline(`\\lim_{u\\to 0}\\frac{\\sin u}{u}=1`)} with ${texInline(
      `u=${k}x`
    )}. Then ${texInline(`\\frac{\\sin(${k}x)}{x}=${k}\\cdot\\frac{\\sin(${k}x)}{${k}x}`)}, so the limit is ${texInline(
      correctTex
    )}.`
  );
}

function limitLeadingCoefficients() {
  const a = randomInt(2, 8);
  const d = randomInt(1, 7);
  const b = randomInt(-9, 9);
  const c = randomInt(-9, 9);
  const e = randomInt(-9, 9);
  const f = randomInt(-9, 9);
  const numerator = formatQuadraticTex(a, b, c);
  const denominator = formatQuadraticTex(d, e, f);
  const correctTex = formatFractionTex(a, d);

  return makeQuestion(
    `Evaluate:${texDisplay(`\\lim_{x\\to\\infty}\\frac{${numerator}}{${denominator}}`)}`,
    correctTex,
    [formatFractionTex(d, a), `${a - d}`, `${a + d}`],
    `For equal polynomial degrees, ${texInline(
      `\\lim_{x\\to\\infty}\\frac{ax^n+\\cdots}{bx^n+\\cdots}=\\frac{a}{b}`
    )}. Here the leading-coefficient ratio is ${texInline(`\\frac{${a}}{${d}}=${correctTex}`)}.`
  );
}

function limitRationalize() {
  const a = choice([1, 4, 9, 16, 25]);
  const root = Math.sqrt(a);
  const correctTex = formatFractionTex(1, 2 * root);

  return makeQuestion(
    `Evaluate:${texDisplay(`\\lim_{x\\to ${a}}\\frac{\\sqrt{x}-${root}}{x-${a}}`)}`,
    correctTex,
    [formatFractionTex(1, root), `${2 * root}`, formatFractionTex(root, 2)],
    `Multiply by the conjugate to get ${texInline(
      `\\frac{1}{\\sqrt{x}+${root}}`
    )}. Substituting ${texInline(`x=${a}`)} gives ${texInline(correctTex)}.`
  );
}

function derivativePowerRule() {
  const c = randomInt(2, 9);
  const n = randomInt(2, 6);
  const correctTex = formatPowerTermTex(c * n, n - 1);

  return makeQuestion(
    `Find:${texDisplay(`\\frac{d}{dx}\\left(${formatPowerTermTex(c, n)}\\right)`)}`,
    correctTex,
    [
      formatPowerTermTex(c * n, n),
      formatPowerTermTex(c, n - 1),
      formatPowerTermTex(n, n - 1),
    ],
    `Apply the power rule ${texInline(`\\frac{d}{dx}(x^n)=nx^{n-1}`)}. So ${texInline(
      `\\frac{d}{dx}\\left(${formatPowerTermTex(c, n)}\\right)=${correctTex}`
    )}.`
  );
}

function derivativeChainRule() {
  const a = randomInt(2, 5);
  const b = randomInt(-6, 6);
  const n = randomInt(2, 4);
  const inner = formatLinearTex(a, b);
  const outerCoef = a * n;
  const correctTex = n - 1 === 1 ? `${outerCoef}(${inner})` : `${outerCoef}(${inner})^{${n - 1}}`;

  return makeQuestion(
    `Find:${texDisplay(`\\frac{d}{dx}\\left((${inner})^{${n}}\\right)`)}`,
    correctTex,
    [
      n - 1 === 1 ? `${n}(${inner})` : `${n}(${inner})^{${n - 1}}`,
      n - 1 === 1 ? `${a}(${inner})` : `${a}(${inner})^{${n - 1}}`,
      `${outerCoef}(${inner})^{${n}}`,
    ],
    `Use chain rule: ${texInline(
      `\\frac{d}{dx}\\left[(u)^${n}\\right]=${n}(u)^{${n - 1}}\\cdot u'`
    )} with ${texInline(`u=${inner}`)} and ${texInline(`u'=${a}`)}. The result is ${texInline(correctTex)}.`
  );
}

function derivativeTrig() {
  const a = randomInt(2, 7);
  const type = choice(["sin", "cos"]);

  if (type === "sin") {
    const correctTex = `${a}\\cos(${a}x)`;
    return makeQuestion(
      `Find:${texDisplay(`\\frac{d}{dx}\\left(\\sin(${a}x)\\right)`)}`,
      correctTex,
      [`\\cos(${a}x)`, `${a}\\sin(${a}x)`, `-${a}\\sin(${a}x)`],
      `${texInline(`\\frac{d}{dx}[\\sin(u)]=\\cos(u)\\,u'`)} with ${texInline(`u=${a}x`)} gives ${texInline(correctTex)}.`
    );
  }

  const correctTex = `-${a}\\sin(${a}x)`;
  return makeQuestion(
    `Find:${texDisplay(`\\frac{d}{dx}\\left(\\cos(${a}x)\\right)`)}`,
    correctTex,
    [`${a}\\sin(${a}x)`, `-${a}\\cos(${a}x)`, `\\sin(${a}x)`],
    `${texInline(`\\frac{d}{dx}[\\cos(u)]= -\\sin(u)\\,u'`)} with ${texInline(`u=${a}x`)} gives ${texInline(correctTex)}.`
  );
}

function derivativeExponential() {
  const k = randomInt(2, 6);
  const correctTex = `${k}e^{${k}x}`;

  return makeQuestion(
    `Find:${texDisplay(`\\frac{d}{dx}\\left(e^{${k}x}\\right)`)}`,
    correctTex,
    [`e^{${k}x}`, `${k}x e^{${k}x}`, `${k}^{${k}x}`],
    `Use ${texInline(`\\frac{d}{dx}(e^u)=e^u u'`)} with ${texInline(`u=${k}x`)} and ${texInline(
      `u'=${k}`
    )}. So the derivative is ${texInline(correctTex)}.`
  );
}

function integralPowerRule() {
  const c = randomInt(2, 8);
  const n = randomInt(1, 5);
  const newExp = n + 1;
  const coefTex = formatFractionTex(c, newExp);
  const xPow = newExp === 1 ? "x" : `x^{${newExp}}`;
  const currentPow = n === 1 ? "x" : `x^{${n}}`;
  const correctTex = `${coefTex}${xPow}+C`;

  return makeQuestion(
    `Compute:${texDisplay(`\\int ${formatPowerTermTex(c, n)}\\,dx`)}`,
    correctTex,
    [
      `${c}${xPow}+C`,
      `${coefTex}${currentPow}+C`,
      `${formatFractionTex(-c, newExp)}${xPow}+C`,
    ],
    `Apply ${texInline(`\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C`)}. Therefore ${texInline(
      `\\int ${formatPowerTermTex(c, n)}\\,dx=${correctTex}`
    )}.`
  );
}

function integralTrig() {
  const a = randomInt(2, 6);
  const trigType = choice(["sin", "cos"]);
  const oneOverA = formatFractionTex(1, a);

  if (trigType === "sin") {
    const correctTex = `-${oneOverA}\\cos(${a}x)+C`;
    return makeQuestion(
      `Compute:${texDisplay(`\\int \\sin(${a}x)\\,dx`)}`,
      correctTex,
      [`${oneOverA}\\cos(${a}x)+C`, `-${a}\\cos(${a}x)+C`, `${oneOverA}\\sin(${a}x)+C`],
      `With substitution ${texInline(`u=${a}x`)}, ${texInline(
        `\\int \\sin(${a}x)\\,dx=-\\frac{1}{${a}}\\cos(${a}x)+C`
      )}.`
    );
  }

  const correctTex = `${oneOverA}\\sin(${a}x)+C`;
  return makeQuestion(
    `Compute:${texDisplay(`\\int \\cos(${a}x)\\,dx`)}`,
    correctTex,
    [`-${oneOverA}\\sin(${a}x)+C`, `${a}\\sin(${a}x)+C`, `-${oneOverA}\\cos(${a}x)+C`],
    `With substitution ${texInline(`u=${a}x`)}, ${texInline(
      `\\int \\cos(${a}x)\\,dx=\\frac{1}{${a}}\\sin(${a}x)+C`
    )}.`
  );
}

function integralDefiniteLinear() {
  const m = randomInt(1, 6);
  const n = randomInt(-4, 5);
  const lower = randomInt(0, 3);
  const upper = randomInt(lower + 1, lower + 5);
  const linear = formatLinearTex(m, n);

  const numerator = m * (upper * upper - lower * lower) + 2 * n * (upper - lower);
  const correctTex = formatFractionTex(numerator, 2);
  const antiLinearTerm = n === 0 ? "" : n > 0 ? `+${n}x` : `-${Math.abs(n)}x`;

  return makeQuestion(
    `Compute:${texDisplay(`\\int_{${lower}}^{${upper}} (${linear})\\,dx`)}`,
    correctTex,
    [
      formatFractionTex(numerator + 2, 2),
      formatFractionTex(numerator - 2, 2),
      formatFractionTex(-numerator, 2),
    ],
    `An antiderivative is ${texInline(
      `F(x)=\\frac{${m}}{2}x^2${antiLinearTerm}`
    )}. Evaluate ${texInline(`F(${upper})-F(${lower})`)} to get ${texInline(correctTex)}.`
  );
}

function analysisCriticalNumber() {
  const a = choice([-4, -3, -2, -1, 1, 2, 3, 4]);
  const h = randomInt(-5, 5);
  const k = randomInt(-6, 6);
  const shift = formatXMinusTex(h);
  const constantTerm = formatSignedTermTex(k, "");
  const functionTex = `${a}\\left(${shift}\\right)^2${constantTerm}`;
  const correctTex = `${h}`;

  return makeQuestion(
    `For ${texInline(`f(x)=${functionTex}`)}, find the critical number of ${texInline("f")}.`,
    correctTex,
    [`${h + 1}`, `${h - 1}`, `${-h}`],
    `Differentiate: ${texInline(`f'(x)=${2 * a}\\left(${shift}\\right)`)}. Set ${texInline(
      "f'(x)=0"
    )}, so ${texInline(`${shift}=0`)} and therefore ${texInline(`x=${h}`)}.`
  );
}

function analysisExtremumType() {
  const a = choice([-5, -4, -3, -2, 2, 3, 4, 5]);
  const h = randomInt(-4, 4);
  const k = randomInt(-5, 5);
  const shift = formatXMinusTex(h);
  const constantTerm = formatSignedTermTex(k, "");
  const functionTex = `${a}\\left(${shift}\\right)^2${constantTerm}`;
  const correctTex = a > 0 ? "\\text{local minimum}" : "\\text{local maximum}";
  const opposite = a > 0 ? "\\text{local maximum}" : "\\text{local minimum}";

  return makeQuestion(
    `For ${texInline(`f(x)=${functionTex}`)}, classify the critical point at ${texInline(`x=${h}`)}.`,
    correctTex,
    [opposite, "\\text{neither max nor min}", "\\text{point of inflection}"],
    `At ${texInline(`x=${h}`)}, ${texInline("f'(x)=0")}. The second derivative is ${texInline(
      `f''(x)=${2 * a}`
    )}. Since ${texInline(`f''(x) ${a > 0 ? ">" : "<"} 0`)}, the point is a ${texInline(correctTex)}.`
  );
}

function analysisIncreasingIntervals() {
  const p = randomInt(1, 5);
  const negP = -p;
  const functionTex = `x^3-${3 * p * p}x`;
  const correctTex = `(-\\infty,${negP})\\cup(${p},\\infty)`;

  return makeQuestion(
    `For ${texInline(`f(x)=${functionTex}`)}, on which interval(s) is ${texInline("f")} increasing?`,
    correctTex,
    [
      `(${negP},${p})`,
      `(-\\infty,${p})`,
      `(-\\infty,${negP})\\cup(${negP},${p})`,
    ],
    `Compute ${texInline(`f'(x)=3x^2-${3 * p * p}=3(x-${p})(x+${p})`)}. The derivative is positive for ${texInline(
      `x<${negP}`
    )} and ${texInline(`x>${p}`)}, so ${texInline("f")} increases on ${texInline(correctTex)}.`
  );
}

function analysisConcavity() {
  const a = choice([-9, -6, -3, 0, 3, 6, 9]);
  const b = randomInt(-6, 6);
  const c = randomInt(-6, 6);
  const functionTex = `x^3${formatSignedTermTex(a, "x^2")}${formatSignedTermTex(
    b,
    "x"
  )}${formatSignedTermTex(c, "")}`;
  const rawInflectionX = -a / 3;
  const inflectionX = Object.is(rawInflectionX, -0) ? 0 : rawInflectionX;
  const correctTex = `(${inflectionX},\\infty)`;

  return makeQuestion(
    `For ${texInline(`f(x)=${functionTex}`)}, where is the graph concave up?`,
    correctTex,
    [`(-\\infty,${inflectionX})`, "(-\\infty,\\infty)", `(${inflectionX - 1},\\infty)`],
    `Use ${texInline(`f''(x)=6x+${2 * a}`)}. Concavity up means ${texInline(
      "f''(x)>0"
    )}, so ${texInline(`x>${inflectionX}`)}. Therefore the interval is ${texInline(correctTex)}.`
  );
}

const generators = {
  limits: [limitDifferenceQuotient, limitTrig, limitLeadingCoefficients, limitRationalize],
  derivatives: [derivativePowerRule, derivativeChainRule, derivativeTrig, derivativeExponential],
  integrals: [integralPowerRule, integralTrig, integralDefiniteLinear],
  analysis: [
    analysisCriticalNumber,
    analysisExtremumType,
    analysisIncreasingIntervals,
    analysisConcavity,
  ],
};

function generateQuestion(topic) {
  return choice(generators[topic])();
}

function typesetMath(container) {
  if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
    window.MathJax.typesetPromise([container]).catch(() => {});
  }
}

function updateScoreboard() {
  const topicScore = state.scores[state.topic];
  const total = Object.values(state.scores).reduce(
    (acc, score) => {
      return {
        correct: acc.correct + score.correct,
        total: acc.total + score.total,
      };
    },
    { correct: 0, total: 0 }
  );

  topicScoreEl.textContent = `Topic score: ${topicScore.correct} / ${topicScore.total}`;
  totalScoreEl.textContent = `Overall score: ${total.correct} / ${total.total}`;
}

function renderFeedback(isCorrect, question) {
  feedbackEl.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
  feedbackEl.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = isCorrect ? "Correct." : "Not quite.";

  const answer = document.createElement("p");
  answer.innerHTML = `Correct answer: ${question.correct}`;

  const explanation = document.createElement("p");
  explanation.innerHTML = question.explanation;

  feedbackEl.append(title, answer, explanation);
  typesetMath(feedbackEl);
}

function handleAnswer(index) {
  if (state.answered) {
    return;
  }
  state.answered = true;

  const isCorrect = index === state.currentQuestion.correctIndex;
  const topicScore = state.scores[state.topic];
  topicScore.total += 1;
  if (isCorrect) {
    topicScore.correct += 1;
  }

  const buttons = [...optionsEl.querySelectorAll("button")];
  buttons.forEach((button, idx) => {
    button.disabled = true;
    if (idx === state.currentQuestion.correctIndex) {
      button.classList.add("correct");
    } else if (idx === index && !isCorrect) {
      button.classList.add("wrong");
    }
  });

  renderFeedback(isCorrect, state.currentQuestion);
  nextBtn.classList.remove("hidden");
  updateScoreboard();
}

function renderQuestion() {
  topicLabel.textContent = topicNames[state.topic];
  questionText.innerHTML = state.currentQuestion.prompt;
  optionsEl.innerHTML = "";
  feedbackEl.className = "feedback hidden";
  feedbackEl.innerHTML = "";
  nextBtn.classList.add("hidden");

  state.currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.innerHTML = option;
    button.addEventListener("click", () => handleAnswer(index));
    optionsEl.appendChild(button);
  });

  typesetMath(questionText);
  typesetMath(optionsEl);
}

function loadQuestion() {
  state.currentQuestion = generateQuestion(state.topic);
  state.answered = false;
  renderQuestion();
  updateScoreboard();
}

function setTopic(topic) {
  state.topic = topic;
  topicButtons.forEach((button) => {
    const isActive = button.dataset.topic === topic;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", `${isActive}`);
  });
  loadQuestion();
}

topicButtons.forEach((button) => {
  button.addEventListener("click", () => setTopic(button.dataset.topic));
});

nextBtn.addEventListener("click", loadQuestion);

setTopic("limits");

window.addEventListener("load", () => {
  typesetMath(document.body);
});
