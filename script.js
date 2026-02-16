const curriculum = [
  {
    unitTitle: "1. The Foundation: Limits and Continuity",
    sections: [
      {
        sectionTitle: "Core Concepts",
        topics: [
          {
            id: "limits",
            title: "Limits",
            description:
              "Definition of limits, estimating from nearby values, and algebraic evaluation.",
          },
          {
            id: "continuity",
            title: "Continuity and IVT",
            description:
              "Continuity at a point or interval, plus Intermediate Value Theorem reasoning.",
          },
          {
            id: "infinite-limits",
            title: "Infinite Limits and Asymptotes",
            description:
              "Vertical asymptotes from infinite limits and horizontal asymptotes from end behavior.",
          },
        ],
      },
    ],
  },
  {
    unitTitle: "2. The Derivative: Rates of Change",
    sections: [
      {
        sectionTitle: "Differentiation Fundamentals",
        topics: [
          {
            id: "derivative-definition",
            title: "Definition of the Derivative",
            description:
              "Using limit expressions to compute derivative values.",
          },
          {
            id: "basic-rules",
            title: "Basic Rules",
            description:
              "Power, sum/difference, and derivatives of e^x, ln(x), and trig functions.",
          },
          {
            id: "advanced-rules",
            title: "Advanced Rules",
            description:
              "Product rule, quotient rule, and chain rule applications.",
          },
          {
            id: "implicit-diff",
            title: "Implicit Differentiation",
            description:
              "Differentiating equations where y is not isolated.",
          },
        ],
      },
      {
        sectionTitle: "Applications of Differentiation",
        topics: [
          {
            id: "analytic-applications",
            title: "Analytic Applications",
            description:
              "Using derivative tests for extrema, concavity, and inflection behavior.",
          },
          {
            id: "mvt",
            title: "Mean Value Theorem (MVT)",
            description:
              "Linking average and instantaneous rate of change.",
          },
          {
            id: "related-rates",
            title: "Related Rates",
            description:
              "Translating dynamic geometric relationships into derivative equations.",
          },
          {
            id: "optimization",
            title: "Optimization",
            description:
              "Finding max/min values in constrained real-world settings.",
          },
          {
            id: "linear-approximation",
            title: "Linear Approximation",
            description:
              "Using tangent-line linearization to estimate function values.",
          },
        ],
      },
    ],
  },
  {
    unitTitle: "3. The Integral: Accumulation of Change",
    sections: [
      {
        sectionTitle: "Integration Fundamentals",
        topics: [
          {
            id: "riemann-sums",
            title: "Riemann Sums",
            description:
              "Left, right, midpoint, and trapezoid approximations of area.",
          },
          {
            id: "ftc",
            title: "Fundamental Theorem of Calculus (FTC)",
            description:
              "Connecting accumulation integrals and derivatives.",
          },
          {
            id: "antidiff-usub",
            title: "Antidifferentiation and u-Substitution",
            description:
              "Applying antiderivative rules and reverse chain rule structure.",
          },
          {
            id: "accumulation-functions",
            title: "Accumulation Functions",
            description:
              "Functions defined by integrals with variable upper limits.",
          },
        ],
      },
      {
        sectionTitle: "Applications of Integration",
        topics: [
          {
            id: "differential-equations",
            title: "Differential Equations and Slope Fields",
            description:
              "Separable DE ideas and slope interpretation at points.",
          },
          {
            id: "area-between-curves",
            title: "Area Between Curves",
            description:
              "Integrating top minus bottom across intersection limits.",
          },
          {
            id: "volume-solids",
            title: "Volume of Solids",
            description:
              "Disk, washer, and cross-sectional volume reasoning.",
          },
        ],
      },
    ],
  },
];

const topicLookup = {};
curriculum.forEach((unit) => {
  unit.sections.forEach((section) => {
    section.topics.forEach((topic) => {
      topicLookup[topic.id] = {
        ...topic,
        unitTitle: unit.unitTitle,
        sectionTitle: section.sectionTitle,
      };
    });
  });
});

const topicIds = Object.keys(topicLookup);

const state = {
  currentTopicId: topicIds[0],
  currentQuestion: null,
  answered: false,
  scores: Object.fromEntries(topicIds.map((id) => [id, { correct: 0, total: 0 }])),
};

const curriculumNav = document.getElementById("curriculumNav");
const unitLabel = document.getElementById("unitLabel");
const sectionLabel = document.getElementById("sectionLabel");
const topicLabel = document.getElementById("topicLabel");
const questionText = document.getElementById("questionText");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const topicScoreEl = document.getElementById("topicScore");
const totalScoreEl = document.getElementById("totalScore");
const coverageScoreEl = document.getElementById("coverageScore");

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

function toFixedTrim(value, digits = 3) {
  return parseFloat(value.toFixed(digits)).toString();
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

function linearTex(m, b) {
  const mPart = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (b === 0) {
    return mPart;
  }
  return b > 0 ? `${mPart}+${b}` : `${mPart}-${Math.abs(b)}`;
}

function signedTermTex(coef, body) {
  if (coef === 0) {
    return "";
  }
  const sign = coef > 0 ? "+" : "-";
  const abs = Math.abs(coef);
  const coefPart = abs === 1 && body !== "" ? "" : `${abs}`;
  return `${sign}${coefPart}${body}`;
}

function uniqueChoices(correct, distractors) {
  const seen = new Set([correct]);
  const picked = [];
  for (const value of distractors) {
    if (!seen.has(value)) {
      seen.add(value);
      picked.push(value);
    }
    if (picked.length === 3) {
      break;
    }
  }

  let fallback = 1;
  while (picked.length < 3) {
    const value = texInline(`${fallback}`);
    if (!seen.has(value)) {
      picked.push(value);
      seen.add(value);
    }
    fallback += 1;
  }

  const options = shuffle([correct, ...picked]);
  return { options, correctIndex: options.indexOf(correct) };
}

function makeQuestion({ prompt, correct, distractors, explanation }) {
  const answers = uniqueChoices(correct, distractors);
  return {
    prompt,
    options: answers.options,
    correctIndex: answers.correctIndex,
    correct,
    explanation,
  };
}

function qLimits() {
  const variant = choice(["algebraic", "table"]);
  if (variant === "algebraic") {
    const a = choice([-5, -4, -3, -2, 2, 3, 4, 5]);
    const correctTex = `${2 * a}`;
    return makeQuestion({
      prompt: `Evaluate the limit:${texDisplay(`\\lim_{x\\to ${a}}\\frac{x^2-${a * a}}{x-${a}}`)}`,
      correct: texInline(correctTex),
      distractors: [texInline(`${a}`), texInline(`${a * a}`), texInline(`${2 * a + 2}`)],
      explanation: `Factor ${texInline(`x^2-${a * a}`)} as ${texInline(
        `(x-${a})(x+${a})`
      )}, cancel, then substitute ${texInline(`x=${a}`)}. The limit is ${texInline(correctTex)}.`,
    });
  }

  const c = randomInt(1, 5);
  const values = [c - 0.2, c - 0.05, c + 0.05, c + 0.2];
  const rows = values
    .map((x) => `<tr><td>${toFixedTrim(x, 2)}</td><td>${toFixedTrim(x + c, 2)}</td></tr>`)
    .join("");
  const tableHtml = `
    <table class="value-table">
      <thead><tr><th>x</th><th>f(x)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  const correctTex = `${2 * c}`;
  return makeQuestion({
    prompt: `Use the nearby values to estimate ${texInline(
      `\\lim_{x\\to ${c}}f(x)`
    )}.${tableHtml}`,
    correct: texInline(correctTex),
    distractors: [texInline(`${c}`), texInline(`${c + 1}`), texInline(`${c * c}`)],
    explanation: `From both sides of ${texInline(`x=${c}`)}, the values approach ${texInline(
      correctTex
    )}. That is the estimated limit.`,
  });
}

function qContinuity() {
  const variant = choice(["point", "ivt"]);
  if (variant === "point") {
    const c = randomInt(1, 5);
    const correctTex = `${2 * c}`;
    return makeQuestion({
      prompt: `Choose ${texInline(
        "k"
      )} so this function is continuous at ${texInline(`x=${c}`)}:${texDisplay(
        `f(x)=\\begin{cases}\\frac{x^2-${c * c}}{x-${c}}, & x\\ne ${c}\\\\ k, & x=${c}\\end{cases}`
      )}`,
      correct: texInline(correctTex),
      distractors: [texInline(`${c}`), texInline(`${c * c}`), texInline(`${2 * c + 1}`)],
      explanation: `Continuity requires ${texInline(
        `k=\\lim_{x\\to ${c}}\\frac{x^2-${c * c}}{x-${c}}`
      )}. Simplify to ${texInline(`x+${c}`)}, then evaluate at ${texInline(`x=${c}`)}.`,
    });
  }

  const a = randomInt(-4, -1);
  const b = randomInt(1, 4);
  return makeQuestion({
    prompt: `A function ${texInline("f")} is continuous on ${texInline(`[${a},${b}]`)}, with ${texInline(
      `f(${a})<0`
    )} and ${texInline(`f(${b})>0`)}. What must be true?`,
    correct: `There exists some c in (${a}, ${b}) with f(c) = 0.`,
    distractors: [
      "The derivative must be zero at both endpoints.",
      "The function must be linear on [a, b].",
      "There is no guaranteed conclusion from this information.",
    ],
    explanation:
      "By the Intermediate Value Theorem, continuous functions take every value between endpoint outputs, including 0.",
  });
}

function qInfiniteLimits() {
  const m = randomInt(1, 5);
  const b = randomInt(-6, 6);
  const c = choice([-4, -3, -2, -1, 1, 2, 3, 4]);
  const correct = texInline(`x=${c},\\ y=${m}`);
  return makeQuestion({
    prompt: `For ${texInline(
      `f(x)=\\frac{${linearTex(m, b)}}{x-${c}}`
    )}, identify the vertical and horizontal asymptotes.`,
    correct,
    distractors: [
      texInline(`x=${m},\\ y=${c}`),
      texInline(`x=-${c},\\ y=${m}`),
      texInline(`x=${c},\\ y=0`),
    ],
    explanation: `The denominator is zero at ${texInline(`x=${c}`)} (vertical asymptote). For end behavior, ratio of leading coefficients gives ${texInline(
      `y=${m}`
    )}.`,
  });
}

function qDerivativeDefinition() {
  const a = choice([-4, -3, -2, 0, 2, 3, 4]);
  const correctTex = `${2 * a}`;
  return makeQuestion({
    prompt: `Evaluate using the limit definition:${texDisplay(
      `\\lim_{h\\to 0}\\frac{((${a})+h)^2-(${a})^2}{h}`
    )}`,
    correct: texInline(correctTex),
    distractors: [texInline(`${a}`), texInline(`${a * a}`), texInline(`${2 * a + 1}`)],
    explanation: `Expand numerator: ${texInline(
      `a^2+2ah+h^2-a^2=2ah+h^2`
    )}, divide by ${texInline("h")}, then let ${texInline("h\\to 0")}.`,
  });
}

function qBasicRules() {
  const n = randomInt(2, 6);
  const correctTex = `${n}x^{${n - 1}}+e^x+\\frac{1}{x}+\\cos x`;
  return makeQuestion({
    prompt: `Differentiate:${texDisplay(`f(x)=x^{${n}}+e^x+\\ln(x)+\\sin x`)}`,
    correct: texInline(correctTex),
    distractors: [
      texInline(`${n}x^{${n - 1}}+e^x+\\frac{1}{x}-\\cos x`),
      texInline(`${n}x^{${n}}+e^x+\\frac{1}{x}+\\cos x`),
      texInline(`${n}x^{${n - 1}}+e^x+x+\\cos x`),
    ],
    explanation:
      "Apply term-by-term differentiation: power rule, d/dx(e^x)=e^x, d/dx(ln x)=1/x, and d/dx(sin x)=cos x.",
  });
}

function qAdvancedRules() {
  const variant = choice(["product", "quotient", "chain"]);

  if (variant === "product") {
    return makeQuestion({
      prompt: `Differentiate:${texDisplay("f(x)=(x^2+1)e^x")}`,
      correct: texInline("2xe^x+(x^2+1)e^x"),
      distractors: [
        texInline("2x+(x^2+1)e^x"),
        texInline("(2x)e^x"),
        texInline("(x^2+1)e^x"),
      ],
      explanation: `Use product rule ${texInline(
        "(uv)'=u'v+uv'"
      )} with ${texInline("u=x^2+1")} and ${texInline("v=e^x")}.`,
    });
  }

  if (variant === "quotient") {
    return makeQuestion({
      prompt: `Differentiate:${texDisplay("f(x)=\\frac{x+1}{x-1}")}`,
      correct: texInline("-\\frac{2}{(x-1)^2}"),
      distractors: [
        texInline("\\frac{2}{(x-1)^2}"),
        texInline("\\frac{x-1}{x+1}"),
        texInline("-\\frac{2}{x-1}"),
      ],
      explanation: `Apply quotient rule ${texInline(
        "\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}"
      )} and simplify.`,
    });
  }

  const a = randomInt(2, 5);
  const b = randomInt(-4, 4);
  const n = randomInt(2, 4);
  return makeQuestion({
    prompt: `Differentiate:${texDisplay(`f(x)=(${linearTex(a, b)})^{${n}}`)}`,
    correct: texInline(`${a * n}(${linearTex(a, b)})^{${n - 1}}`),
    distractors: [
      texInline(`${n}(${linearTex(a, b)})^{${n - 1}}`),
      texInline(`${a}(${linearTex(a, b)})^{${n - 1}}`),
      texInline(`${a * n}(${linearTex(a, b)})^{${n}}`),
    ],
    explanation: `Use chain rule: derivative of outer power times derivative of inner linear term (${a}).`,
  });
}

function qImplicitDiff() {
  const r = randomInt(2, 7);
  return makeQuestion({
    prompt: `For ${texInline(`x^2+y^2=${r * r}`)}, find ${texInline("\\frac{dy}{dx}")}.`,
    correct: texInline("-\\frac{x}{y}"),
    distractors: [
      texInline("\\frac{x}{y}"),
      texInline("-\\frac{y}{x}"),
      texInline("\\frac{2x}{2y}+1"),
    ],
    explanation: `Differentiate implicitly: ${texInline(
      "2x+2y\\frac{dy}{dx}=0"
    )}, then solve for ${texInline("\\frac{dy}{dx}")}.`,
  });
}

function qAnalyticApplications() {
  const c = choice([-3, -2, -1, 0, 1, 2, 3]);
  return makeQuestion({
    prompt: `If ${texInline(
      "f'(x)>0"
    )} for ${texInline(`x<${c}`)} and ${texInline("f'(x)<0")} for ${texInline(
      `x>${c}`
    )}, what occurs at ${texInline(`x=${c}`)}?`,
    correct: "A local maximum occurs at x = c.",
    distractors: [
      "A local minimum occurs at x = c.",
      "x = c must be an inflection point.",
      "No extremum can be concluded.",
    ],
    explanation:
      "When f' changes from positive to negative, the function changes from increasing to decreasing, so the point is a local maximum.",
  });
}

function qMVT() {
  const a = randomInt(-3, 1);
  const b = a + randomInt(2, 6);
  const correctTex = formatFractionTex(a + b, 2);
  return makeQuestion({
    prompt: `For ${texInline(`f(x)=x^2`)} on ${texInline(
      `[${a},${b}]`
    )}, find the value ${texInline("c")} guaranteed by the Mean Value Theorem.`,
    correct: texInline(correctTex),
    distractors: [texInline(`${a}`), texInline(`${b}`), texInline(`${a + b}`)],
    explanation: `${texInline(
      "f'(c)=\\frac{f(b)-f(a)}{b-a}"
    )} gives ${texInline(`2c=${a + b}`)}, so ${texInline(`c=${correctTex}`)}.`,
  });
}

function qRelatedRates() {
  const r = randomInt(2, 8);
  const drdt = randomInt(1, 4);
  const coeff = 2 * r * drdt;
  return makeQuestion({
    prompt: `A circle's radius is changing at ${texInline(
      `\\frac{dr}{dt}=${drdt}`
    )} units/s. Find ${texInline("\\frac{dA}{dt}")} when ${texInline(`r=${r}`)}.`,
    correct: texInline(`${coeff}\\pi`),
    distractors: [texInline(`${r * r * drdt}\\pi`), texInline(`${2 * r}\\pi`), texInline(`${coeff}`)],
    explanation: `With ${texInline("A=\\pi r^2")}, differentiate: ${texInline(
      "\\frac{dA}{dt}=2\\pi r\\frac{dr}{dt}"
    )}. Substitute the given values.`,
  });
}

function qOptimization() {
  const p = choice([20, 24, 28, 32, 36, 40]);
  const side = p / 4;
  const area = side * side;
  return makeQuestion({
    prompt: `A rectangle has perimeter ${texInline(
      `${p}`
    )}. What is the maximum possible area?`,
    correct: texInline(`${area}`),
    distractors: [texInline(`${p}`), texInline(`${area - side}`), texInline(`${(p / 2) * (p / 4)}`)],
    explanation:
      "For fixed perimeter, area is maximized by a square. Side length is P/4, so max area is (P/4)^2.",
  });
}

function qLinearApproximation() {
  const a = choice([1, 4, 9, 16, 25]);
  const delta = choice([0.1, 0.2, 0.3, 0.4]);
  const x = a + delta;
  const root = Math.sqrt(a);
  const approx = root + delta / (2 * root);
  const approxStr = toFixedTrim(approx, 4);
  return makeQuestion({
    prompt: `Use linearization at ${texInline(
      `x=${a}`
    )} to approximate ${texInline(`\\sqrt{${toFixedTrim(x, 2)}}`)}.`,
    correct: texInline(approxStr),
    distractors: [
      texInline(toFixedTrim(root + delta, 4)),
      texInline(toFixedTrim(root + delta / root, 4)),
      texInline(toFixedTrim(root - delta / (2 * root), 4)),
    ],
    explanation: `For ${texInline("f(x)=\\sqrt{x}")}, ${texInline(
      "f'(a)=\\frac{1}{2\\sqrt{a}}"
    )}. So ${texInline(
      `L(x)=\\sqrt{${a}}+\\frac{x-${a}}{2\\sqrt{${a}}}`
    )}; plug in ${texInline(`x=${toFixedTrim(x, 2)}`)}.`,
  });
}

function qRiemannSums() {
  const method = choice(["left", "right", "midpoint", "trapezoid"]);
  const values = {
    left: {
      result: "1",
      detail: "f(0)+f(1)",
      distractors: ["5", "\\frac{5}{2}", "3"],
    },
    right: {
      result: "5",
      detail: "f(1)+f(2)",
      distractors: ["1", "\\frac{5}{2}", "3"],
    },
    midpoint: {
      result: "\\frac{5}{2}",
      detail: "f(0.5)+f(1.5)",
      distractors: ["1", "5", "3"],
    },
    trapezoid: {
      result: "3",
      detail: "\\frac{f(0)+2f(1)+f(2)}{2}",
      distractors: ["1", "\\frac{5}{2}", "5"],
    },
  };
  const promptMethod = {
    left: "left-endpoint",
    right: "right-endpoint",
    midpoint: "midpoint",
    trapezoid: "trapezoid",
  };
  const correctTex = values[method].result;
  return makeQuestion({
    prompt: `Approximate ${texInline("\\int_0^2 x^2\\,dx")} with ${promptMethod[method]} rule using ${texInline(
      "n=2"
    )}.`,
    correct: texInline(correctTex),
    distractors: values[method].distractors.map((item) => texInline(item)),
    explanation: `Here ${texInline("\\Delta x=1")}. The ${method} computation uses ${texInline(
      values[method].detail
    )}, giving ${texInline(correctTex)}.`,
  });
}

function qFTC() {
  return makeQuestion({
    prompt: `Let ${texInline(
      "F(x)=\\int_1^{x^2}(t^3+1)\\,dt"
    )}. Find ${texInline("F'(x)")}.`,
    correct: texInline("2x(x^6+1)"),
    distractors: [texInline("x^6+1"), texInline("2x^6+1"), texInline("2x(t^3+1)")],
    explanation: `By FTC + chain rule, ${texInline(
      "\\frac{d}{dx}\\int_a^{g(x)}f(t)dt=f(g(x))g'(x)"
    )}. Substitute ${texInline("g(x)=x^2")} and ${texInline("f(t)=t^3+1")}.`,
  });
}

function qAntidiffUsub() {
  const n = randomInt(2, 4);
  const correctTex = `\\frac{(x^2+1)^{${n + 1}}}{${n + 1}}+C`;
  return makeQuestion({
    prompt: `Compute ${texInline(`\\int 2x(x^2+1)^{${n}}\\,dx`)}.`,
    correct: texInline(correctTex),
    distractors: [
      texInline(`(x^2+1)^{${n + 1}}+C`),
      texInline(`\\frac{(x^2+1)^{${n}}}{${n}}+C`),
      texInline(`2x(x^2+1)^{${n + 1}}+C`),
    ],
    explanation: `Let ${texInline("u=x^2+1")} so ${texInline("du=2x\\,dx")}. Then integrate ${texInline(
      "\\int u^n du"
    )}.`,
  });
}

function qAccumulationFunctions() {
  const x = randomInt(1, 5);
  const numerator = 3 * x * x - 4 * x;
  const correctTex = formatFractionTex(numerator, 2);
  return makeQuestion({
    prompt: `If ${texInline(
      "F(x)=\\int_0^x (3t-2)\\,dt"
    )}, compute ${texInline(`F(${x})`)}.`,
    correct: texInline(correctTex),
    distractors: [
      texInline(`${3 * x - 2}`),
      texInline(formatFractionTex(3 * x * x + 4 * x, 2)),
      texInline(formatFractionTex(3 * x * x, 2)),
    ],
    explanation: `${texInline(
      "F(x)=\\left[\\frac{3}{2}t^2-2t\\right]_0^x=\\frac{3x^2-4x}{2}"
    )}, then substitute ${texInline(`x=${x}`)}.`,
  });
}

function qDifferentialEquations() {
  const variant = choice(["separable", "slope"]);

  if (variant === "separable") {
    const k = randomInt(1, 3);
    const y0 = randomInt(1, 4);
    const t = randomInt(1, 2);
    return makeQuestion({
      prompt: `Solve ${texInline(
        "\\frac{dy}{dt}=ky"
      )} with ${texInline(`k=${k}`)} and ${texInline(`y(0)=${y0}`)}. What is ${texInline(
        `y(${t})`
      )}?`,
      correct: texInline(`${y0}e^{${k * t}}`),
      distractors: [
        texInline(`${y0}e^{-${k * t}}`),
        texInline(`${y0 + k * t}`),
        texInline(`${y0 * k * t}`),
      ],
      explanation: `Separable form gives ${texInline("y=Ce^{kt}")}. Using ${texInline(
        `y(0)=${y0}`
      )} gives ${texInline(`C=${y0}`)}.`,
    });
  }

  const x0 = randomInt(-3, 3);
  const y0 = randomInt(-3, 3);
  const slope = x0 - y0;
  return makeQuestion({
    prompt: `For the slope field of ${texInline(
      "\\frac{dy}{dx}=x-y"
    )}, what is the slope at point ${texInline(`(${x0},${y0})`)}?`,
    correct: texInline(`${slope}`),
    distractors: [texInline(`${y0 - x0}`), texInline(`${x0 + y0}`), texInline(`${x0 * y0}`)],
    explanation: `Slope fields use the differential equation directly: plug ${texInline(
      `x=${x0},\\ y=${y0}`
    )} into ${texInline("x-y")}.`,
  });
}

function qAreaBetweenCurves() {
  const m = randomInt(2, 4);
  const correctTex = formatFractionTex(m * m * m, 6);
  return makeQuestion({
    prompt: `Find the area enclosed by ${texInline(`y=${m}x`)} and ${texInline(
      "y=x^2"
    )} between their intersection points.`,
    correct: texInline(correctTex),
    distractors: [texInline(formatFractionTex(m * m * m, 3)), texInline(`${m * m}`), texInline(formatFractionTex(m * m, 2))],
    explanation: `Intersections occur at ${texInline("x=0")} and ${texInline(
      `x=${m}`
    )}. Area is ${texInline(`\\int_0^{${m}}(${m}x-x^2)dx=${correctTex}`)}.`,
  });
}

function qVolumeSolids() {
  const variant = choice(["disk", "washer", "cross"]);
  const a = randomInt(2, 4);

  if (variant === "disk") {
    const correctTex = `\\frac{${a * a * a}\\pi}{3}`;
    return makeQuestion({
      prompt: `Using the disk method, find the volume when the region under ${texInline(
        "y=x"
      )} from ${texInline("x=0")} to ${texInline(`x=${a}`)} is revolved about the x-axis.`,
      correct: texInline(correctTex),
      distractors: [texInline(`${a * a * a}\\pi`), texInline(`\\frac{${a * a}\\pi}{2}`), texInline(`\\frac{${a * a * a}}{3}`)],
      explanation: `Disk radius is ${texInline("r=x")}. So ${texInline(
        `V=\\pi\\int_0^{${a}}x^2dx=${correctTex}`
      )}.`,
    });
  }

  if (variant === "washer") {
    const correctTex = `${a * a * a}\\pi`;
    return makeQuestion({
      prompt: `Using washers, revolve the region between ${texInline("y=2x")} and ${texInline(
        "y=x"
      )} on ${texInline(`[0,${a}]`)} about the x-axis. Find the volume.`,
      correct: texInline(correctTex),
      distractors: [
        texInline(`\\frac{${a * a * a}\\pi}{3}`),
        texInline(`${2 * a * a * a}\\pi`),
        texInline(`${a * a}\\pi`),
      ],
      explanation: `Outer radius ${texInline("R=2x")}, inner radius ${texInline(
        "r=x"
      )}. Then ${texInline(`V=\\pi\\int_0^{${a}}(R^2-r^2)dx=\\pi\\int_0^{${a}}3x^2dx=${correctTex}`)}.`,
    });
  }

  const correctTex = formatFractionTex(a * a * a, 3);
  return makeQuestion({
    prompt: `A solid has square cross-sections perpendicular to the x-axis over ${texInline(
      `[0,${a}]`
    )}, with side length ${texInline("s(x)=x")}. Find the volume.`,
    correct: texInline(correctTex),
    distractors: [texInline(`${a * a}`), texInline(formatFractionTex(a * a, 2)), texInline(`${a * a * a}`)],
    explanation: `Area of each cross-section is ${texInline("A(x)=s(x)^2=x^2")}, so ${texInline(
      `V=\\int_0^{${a}}x^2dx=${correctTex}`
    )}.`,
  });
}

const generators = {
  limits: qLimits,
  continuity: qContinuity,
  "infinite-limits": qInfiniteLimits,
  "derivative-definition": qDerivativeDefinition,
  "basic-rules": qBasicRules,
  "advanced-rules": qAdvancedRules,
  "implicit-diff": qImplicitDiff,
  "analytic-applications": qAnalyticApplications,
  mvt: qMVT,
  "related-rates": qRelatedRates,
  optimization: qOptimization,
  "linear-approximation": qLinearApproximation,
  "riemann-sums": qRiemannSums,
  ftc: qFTC,
  "antidiff-usub": qAntidiffUsub,
  "accumulation-functions": qAccumulationFunctions,
  "differential-equations": qDifferentialEquations,
  "area-between-curves": qAreaBetweenCurves,
  "volume-solids": qVolumeSolids,
};

function typesetMath(container) {
  if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
    window.MathJax.typesetPromise([container]).catch(() => {});
  }
}

function renderNavigator() {
  curriculumNav.innerHTML = "";

  curriculum.forEach((unit) => {
    const unitEl = document.createElement("section");
    unitEl.className = "curriculum-unit";

    const unitTitle = document.createElement("h3");
    unitTitle.textContent = unit.unitTitle;
    unitEl.appendChild(unitTitle);

    unit.sections.forEach((section) => {
      const sectionEl = document.createElement("div");
      const sectionTitle = document.createElement("p");
      sectionTitle.className = "section-title";
      sectionTitle.textContent = section.sectionTitle;
      sectionEl.appendChild(sectionTitle);

      const list = document.createElement("div");
      list.className = "topic-list";

      section.topics.forEach((topic) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "topic-btn";
        button.dataset.topicId = topic.id;
        button.setAttribute("aria-selected", "false");
        button.innerHTML = `
          <span class="topic-btn-label">${topic.title}</span>
          <span class="topic-btn-meta" data-topic-meta="${topic.id}">0/0</span>
        `;
        list.appendChild(button);
      });

      sectionEl.appendChild(list);
      unitEl.appendChild(sectionEl);
    });

    curriculumNav.appendChild(unitEl);
  });

  curriculumNav.addEventListener("click", (event) => {
    const button = event.target.closest(".topic-btn");
    if (!button) {
      return;
    }
    setTopic(button.dataset.topicId);
  });
}

function updateTopicMeta() {
  topicIds.forEach((id) => {
    const stat = state.scores[id];
    const meta = curriculumNav.querySelector(`[data-topic-meta="${id}"]`);
    if (meta) {
      meta.textContent = `${stat.correct}/${stat.total}`;
    }
  });
}

function updateScoreboard() {
  const topicStat = state.scores[state.currentTopicId];
  const totals = topicIds.reduce(
    (acc, id) => {
      const score = state.scores[id];
      return {
        correct: acc.correct + score.correct,
        total: acc.total + score.total,
        attemptedTopics: acc.attemptedTopics + (score.total > 0 ? 1 : 0),
      };
    },
    { correct: 0, total: 0, attemptedTopics: 0 }
  );

  topicScoreEl.textContent = `${topicStat.correct} / ${topicStat.total} correct`;
  totalScoreEl.textContent = `${totals.correct} / ${totals.total} correct`;
  coverageScoreEl.textContent = `${totals.attemptedTopics} / ${topicIds.length} topics attempted`;
}

function renderFeedback(isCorrect, question) {
  feedbackEl.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
  feedbackEl.innerHTML = "";

  const heading = document.createElement("h3");
  heading.textContent = isCorrect ? "Correct." : "Not quite.";

  const answer = document.createElement("p");
  answer.innerHTML = `Correct answer: ${question.correct}`;

  const explanation = document.createElement("p");
  explanation.innerHTML = question.explanation;

  feedbackEl.append(heading, answer, explanation);
  typesetMath(feedbackEl);
}

function renderQuestion() {
  const topic = topicLookup[state.currentTopicId];
  unitLabel.textContent = topic.unitTitle;
  sectionLabel.textContent = topic.sectionTitle;
  topicLabel.textContent = topic.title;

  questionText.innerHTML = `
    <p class="topic-brief">${topic.description}</p>
    ${state.currentQuestion.prompt}
  `;

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
  const generator = generators[state.currentTopicId];
  state.currentQuestion = generator();
  state.answered = false;
  renderQuestion();
  updateScoreboard();
}

function handleAnswer(index) {
  if (state.answered) {
    return;
  }
  state.answered = true;

  const isCorrect = index === state.currentQuestion.correctIndex;
  const score = state.scores[state.currentTopicId];
  score.total += 1;
  if (isCorrect) {
    score.correct += 1;
  }

  [...optionsEl.querySelectorAll("button")].forEach((button, idx) => {
    button.disabled = true;
    if (idx === state.currentQuestion.correctIndex) {
      button.classList.add("correct");
    } else if (idx === index && !isCorrect) {
      button.classList.add("wrong");
    }
  });

  renderFeedback(isCorrect, state.currentQuestion);
  nextBtn.classList.remove("hidden");
  updateTopicMeta();
  updateScoreboard();
}

function setTopic(topicId) {
  state.currentTopicId = topicId;
  [...curriculumNav.querySelectorAll(".topic-btn")].forEach((button) => {
    const isActive = button.dataset.topicId === topicId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", `${isActive}`);
  });
  loadQuestion();
}

nextBtn.addEventListener("click", loadQuestion);

renderNavigator();
updateTopicMeta();
setTopic(state.currentTopicId);
