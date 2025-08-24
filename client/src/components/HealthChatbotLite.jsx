import { useEffect, useMemo, useRef, useState } from "react";

/**
 * HealthChatbotLite (conversational)
 * - Dark floating wellbeing bot with rule-based triage.
 * - Keeps your existing props and UI vibe.
 * - Focus: symptom guidance + wellbeing tips (sleep, hydration, nutrition, stress).
 *
 * ⚠️ General guidance only; not medical advice.
 */
export default function HealthChatbotLite({
  brand = "NutriBridge",
  accent = "#7ce2a1",
  side = "right",
  optionPalette = ["#7ce2a1", "#4ad6ff", "#ffd166", "#ff7a7a"],
}) {
  /* ------------------- UI state ------------------- */
  const [open, setOpen] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nb_chat_open") || "false"); } catch { return false; }
  });
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nb_chat_msgs") || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => localStorage.setItem("nb_chat_open", JSON.stringify(open)), [open]);
  useEffect(() => localStorage.setItem("nb_chat_msgs", JSON.stringify(messages)), [messages]);

  const boxRef = useRef(null);
  useEffect(() => {
    if (!boxRef.current) return;
    boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages, open, typing]);

  /* ------------------- Conversation context (FSM) ------------------- */
  // phases: idle -> ask_symptom -> ask_duration -> ask_severity -> ask_redflags -> advise -> aftercare
  const [phase, setPhase] = useState("idle");
  const [ctx, setCtx] = useState({
    symptom: null,   // string
    duration: null,  // "<24h" | "1-3d" | ">3d"
    severity: null,  // "mild" | "moderate" | "severe"
    redFlag: false,  // boolean
  });

  useEffect(() => {
    if (messages.length === 0) {
      bot(`Hi! I’m the ${brand} wellbeing helper. Tell me what’s bothering you, or tap a quick option. (General guidance only — not medical advice.)`);
      setPhase("ask_symptom");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quickOptions = useMemo(
    () => [
      { label: "Fever", key: "fever" },
      { label: "Cough", key: "cough" },
      { label: "Cold", key: "cold" },
      { label: "Headache", key: "headache" },
      { label: "Anxiety", key: "anxiety" },
      { label: "Fatigue", key: "fatigue" },
    ],
    []
  );

  /* ------------------- Helpers ------------------- */
  function user(text) {
    setMessages(m => [...m, { role: "user", text, t: Date.now() }]);
  }
  function bot(text) {
    setMessages(m => [...m, { role: "bot", text, t: Date.now() }]);
  }
  async function typeThen(fn) {
    setTyping(true);
    await new Promise(r => setTimeout(r, 450));
    setTyping(false);
    fn();
  }

  function normalize(text) {
    return (text || "").toLowerCase();
  }

  // lightweight NLP intent/slot filling
  function detectSymptom(text) {
    const t = normalize(text);
    if (/fever|temperature|pyrex/i.test(t)) return "Fever";
    if (/cough|khansi/i.test(t)) return "Cough";
    if (/(cold|runny nose|sneeze|sneez)/i.test(t)) return "Cold";
    if (/headache|migraine|sir dard/i.test(t)) return "Headache";
    if (/fatigue|tired|exhaust/i.test(t)) return "Fatigue";
    if (/anxiety|stress|panic|overwhelmed/i.test(t)) return "Anxiety";
    if (/stomach|nausea|vomit|gastric/i.test(t)) return "Stomach upset";
    return null;
  }

  function askDuration() {
    setPhase("ask_duration");
    bot("For how long has it been going on? Choose one:");
    bot("• Less than 24 hours\n• 1–3 days\n• More than 3 days");
  }

  function askSeverity() {
    setPhase("ask_severity");
    bot("How severe is it right now? (mild / moderate / severe)");
  }

  function askRedFlags(symptom) {
    setPhase("ask_redflags");
    const checks = {
      Fever:
        "any of these: very high fever (>39.4°C), stiff neck, confusion, severe dehydration, rash, trouble breathing?",
      Cough:
        "high fever with cough, chest pain, blue lips, coughing blood, or shortness of breath?",
      Cold:
        "persistent high fever, severe sinus pain, ear pain, or symptoms >10 days?",
      Headache:
        "sudden 'worst headache', head injury, weakness/numbness, confusion, vision loss, or stiff neck?",
      Fatigue:
        "fainting, chest pain, breathlessness at rest, severe palpitations, or unexplained weight loss?",
      Anxiety:
        "self-harm thoughts, fainting, chest pain, or breathlessness not improving with rest?",
      "Stomach upset":
        "severe belly pain, blood in vomit/stool, black stools, nonstop vomiting, or dehydration (very little urine)?",
    };
    bot(`Before I advise, do you have ${checks[symptom] || "any alarming symptoms"} (yes/no)?`);
  }

  function makeAdvice(c) {
    const base = {
      Fever: [
        "Stay hydrated (water/ORS/soups).",
        "Rest; light meals.",
        "Paracetamol can help with fever/pain (follow label).",
        "Seek care if fever is very high, lasts >3 days, or red-flags occur.",
      ],
      Cough: [
        "Warm fluids, honey + ginger (if not contraindicated).",
        "Humidify room; avoid smoke/dust.",
        "Salt-water gargles for throat irritation.",
        "Seek care if chest pain, breathlessness, or fever persists.",
      ],
      Cold: [
        "Fluids + rest; steam inhalation can help congestion.",
        "Saline nasal spray; avoid cold drafts.",
        "OTC relief if needed (per label).",
        "See a clinician if symptoms >10 days or severe pain/fever.",
      ],
      Headache: [
        "Hydrate and rest in a low-light room.",
        "Check if missed meals/caffeine withdrawal triggered it.",
        "Gentle neck stretches; OTC analgesic per label.",
        "Urgent care if sudden severe, neuro deficits, or after injury.",
      ],
      Fatigue: [
        "Prioritize sleep (7–9 hours); consistent schedule.",
        "Balanced meals; include iron-rich foods and protein.",
        "Short daylight walk; limit screen time late evening.",
        "If persistent >2 weeks, consult a clinician for evaluation.",
      ],
      Anxiety: [
        "Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s (4–5 rounds).",
        "Grounding 5-4-3-2-1: notice 5 sights, 4 touches, 3 sounds, 2 smells, 1 taste.",
        "Reduce caffeine; talk to a trusted friend.",
        "If self-harm thoughts, seek immediate professional help/helplines.",
      ],
      "Stomach upset": [
        "Small sips of ORS; bland foods (banana, rice, curd, toast).",
        "Avoid oily/spicy food till better.",
        "Hand hygiene; clean drinking water.",
        "See a clinician if blood in stool/vomit or symptoms >3 days.",
      ],
    };

    const durationNote =
      c.duration === ">3d"
        ? "Since it’s been more than 3 days, consider seeing a clinician soon."
        : c.duration === "1-3d"
        ? "Monitor across the next day or two; if worsening, seek care."
        : "Early phase — home care often helps; keep an eye on changes.";

    const severityNote =
      c.severity === "severe"
        ? "Severity sounds high — I recommend urgent in-person care."
        : c.severity === "moderate"
        ? "Since it’s moderate, rest + fluids + OTC relief may help. Escalate if worse."
        : "Mild symptoms can be managed conservatively for now.";

    const wellbeing = [
      "💤 Sleep: aim 7–9h; keep the same sleep/wake times.",
      "🥗 Nutrition: prefer whole foods; add fruits/veg; stay hydrated.",
      "🚶 Movement: gentle 20-min walk or stretches if you can.",
      "🧠 Stress: 5-minute breathing or gratitude note before bed.",
    ];

    const lines = [
      `Here’s a simple plan for ${c.symptom?.toLowerCase()}:`,
      ...(Array.isArray(base[c.symptom]) ? base[c.symptom] : []),
      "",
      `⏱ Duration check: ${durationNote}`,
      `📈 Severity check: ${severityNote}`,
      "",
      "General wellbeing:",
      ...wellbeing,
    ].filter(Boolean);

    return lines.join("\n");
  }

  function emergencyLine(symptom) {
    return `Your responses suggest potential red-flags for ${symptom?.toLowerCase()}. Please seek urgent medical attention or local emergency services.`;
  }

  function summaryText(c) {
    return `${brand} Wellbeing Summary:
- Symptom: ${c.symptom}
- Duration: ${c.duration}
- Severity: ${c.severity}
- Red flags: ${c.redFlag ? "Yes" : "No"}

Advice:
${makeAdvice(c)}`;
  }

  /* ------------------- Message handling ------------------- */
  async function handleSend(raw) {
    const text = (raw ?? input).trim();
    if (!text) return;
    setInput("");
    user(text);

    // Commands
    if (/^(reset|restart|clear)$/i.test(text)) {
      setCtx({ symptom: null, duration: null, severity: null, redFlag: false });
      setPhase("ask_symptom");
      return typeThen(() =>
        bot("Reset done. Tell me what’s bothering you (e.g., fever, cough, headache), or choose an option below.")
      );
    }
    if (/^(help|tips)$/i.test(text)) {
      return typeThen(() =>
        bot("You can type a symptom (‘headache’, ‘anxiety’, ‘stomach upset’), or reply to my questions with options like ‘1–3 days’, ‘mild’, ‘yes/no’. Say ‘restart’ to reset.")
      );
    }

    // Phase logic
    if (phase === "ask_symptom" || !ctx.symptom) {
      const detected = detectSymptom(text) || capitalize(text);
      if (!detected) {
        return typeThen(() =>
          bot("I couldn’t detect a symptom. Try something like ‘fever’, ‘cough’, ‘headache’, ‘fatigue’, ‘anxiety’, or ‘stomach upset’.")
        );
      }
      const next = { ...ctx, symptom: detected };
      setCtx(next);
      await typeThen(() => bot(`Got it — ${detected.toLowerCase()}.`));
      return askDuration();
    }

    if (phase === "ask_duration" && !ctx.duration) {
      const d = parseDuration(text);
      if (!d) {
        return typeThen(() => bot("Please choose one: ‘Less than 24 hours’, ‘1–3 days’, or ‘More than 3 days’."));
      }
      const next = { ...ctx, duration: d };
      setCtx(next);
      return askSeverity();
    }

    if (phase === "ask_severity" && !ctx.severity) {
      const s = parseSeverity(text);
      if (!s) {
        return typeThen(() => bot("Please reply with ‘mild’, ‘moderate’, or ‘severe’."));
      }
      const next = { ...ctx, severity: s };
      setCtx(next);
      return askRedFlags(next.symptom);
    }

    if (phase === "ask_redflags") {
      const yes = /^(y|yes|haan|ha|true)/i.test(text);
      const no = /^(n|no|nah|false)/i.test(text);
      if (!yes && !no) {
        return typeThen(() => bot("Please answer ‘yes’ or ‘no’."));
      }
      const next = { ...ctx, redFlag: yes };
      setCtx(next);

      if (yes) {
        return typeThen(() => {
          bot(emergencyLine(next.symptom));
          bot("Would you like general comfort tips while you arrange care? (yes/no)");
          setPhase("aftercare");
        });
      }

      // No red-flags: give plan
      await typeThen(() => bot(makeAdvice(next)));
      await typeThen(() =>
        bot("Would you like: ‘more tips’, ‘mental wellbeing’, ‘nutrition’, or ‘share summary’?")
      );
      setPhase("aftercare");
      return;
    }

    if (phase === "aftercare") {
      const t = normalize(text);
      if (/share/i.test(t)) {
        const share = summaryText(ctx);
        // Generate WhatsApp share URL
        const wa = `https://wa.me/?text=${encodeURIComponent(share)}`;
        return typeThen(() =>
          bot(`Here’s a summary you can share:\n\n${share}\n\nOpen WhatsApp to share: ${wa}`)
        );
      }
      if (/mental|mind|anxiety|stress/i.test(t)) {
        return typeThen(() =>
          bot(
            "Mental wellbeing tips:\n• 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s (4 cycles)\n• 10-minute mindful walk (notice sounds & sights)\n• Limit caffeine after 2pm\n• Journal one gratitude before bed"
          )
        );
      }
      if (/nutrition|diet|food/i.test(t)) {
        return typeThen(() =>
          bot(
            "Nutrition basics:\n• Plate half veggies, quarter protein, quarter whole grains\n• 6–8 glasses water daily\n• Add curd/yoghurt for gut health (if suitable)\n• Prefer home-cooked, limit ultra-processed snacks"
          )
        );
      }
      if (/more|tips|extra/i.test(t)) {
        return typeThen(() =>
          bot("More tips:\n• Keep a simple symptoms log\n• Gentle stretching twice a day\n• 20-min morning light exposure\n• Aim for consistent sleep/wake times")
        );
      }
      if (/^no$|thanks|thank you/i.test(t)) {
        return typeThen(() => bot("Anytime! Type ‘restart’ if you want to assess another symptom."));
      }

      // fallback: try treat as new symptom
      const maybe = detectSymptom(text);
      if (maybe) {
        setCtx({ symptom: maybe, duration: null, severity: null, redFlag: false });
        setPhase("ask_duration");
        return typeThen(() => bot(`Okay, switching to ${maybe.toLowerCase()}. For how long? (<24h, 1–3 days, >3 days)`));
      }
      return typeThen(() =>
        bot("I can share ‘more tips’, ‘mental wellbeing’, ‘nutrition’, or ‘share summary’. Say ‘restart’ to begin a new check.")
      );
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    handleSend();
  }

  /* ------------------- UI ------------------- */
  const palette = optionPalette?.length ? optionPalette : ["#7ce2a1", "#4ad6ff", "#ffd166", "#ff7a7a"];

  return (
    <div style={{ ...dock(side) }}>
      <div style={{ ...wrap, borderColor: "#223043" }}>
        <div style={head}>
          <span style={{ ...dot, background: "#3ddc84" }} />
          <strong>{brand} · Health Chatbot</strong>
          <button onClick={() => setOpen(o => !o)} style={headBtn}>{open ? "Hide" : "Open"}</button>
        </div>

        {open ? (
          <>
            <div ref={boxRef} style={box}>
              {messages.map((m, idx) => (
                <div key={idx} style={m.role === "user" ? bubbleUser : bubbleBot}>
                  {m.text.split("\n").map((line, i) => <div key={i}>{line}</div>)}
                </div>
              ))}
              {typing && <div style={{ ...bubbleBot, opacity: 0.8 }}>…</div>}

              {/* quick options always visible at top for convenience in idle/ask_symptom */}
              {(phase === "ask_symptom" || messages.length < 4) && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {quickOptions.map((q, i) => (
                    <button
                      key={q.key}
                      style={{
                        ...pill,
                        background: palette[i % palette.length],
                        borderColor: "transparent",
                        color: "#0b0f14",
                      }}
                      onClick={() => handleSend(q.label)}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} style={composer}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message… (e.g., ‘I have a headache since yesterday’)"
                style={inputBox}
              />
              <button type="submit" style={{ ...sendBtn, background: accent }}>Send</button>
            </form>
          </>
        ) : (
          <div style={teaser}>
            Feeling unwell? Pick a quick option:
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {quickOptions.slice(0, 4).map((q, i) => (
                <button
                  key={q.key}
                  style={{ ...pill, background: palette[i % palette.length], borderColor: "transparent", color: "#0b0f14" }}
                  onClick={() => { setOpen(true); setTimeout(() => handleSend(q.label), 0); }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------- Tiny parsers ------------------- */
function parseDuration(text) {
  const t = (text || "").toLowerCase();
  if (/less|<|under|within|24|day/i.test(t)) return "<24h";
  if (/1-?3|1 to 3|two|three|couple|few|days?/i.test(t)) return "1-3d";
  if (/>|more than|over|>3|3\+|week|7 days/i.test(t)) return ">3d";
  return null;
}
function parseSeverity(text) {
  const t = (text || "").toLowerCase();
  if (/mild|light|thoda/i.test(t)) return "mild";
  if (/moderate|medium|beech/i.test(t)) return "moderate";
  if (/severe|bahut|zyada|intense|worst/i.test(t)) return "severe";
  return null;
}
function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------- Styles ------------------- */
const wrap = {
  width: 320,
  background: "#0b0f14",
  border: "1px solid",
  borderRadius: 14,
  boxShadow: "0 16px 48px rgba(0,0,0,.45)",
  overflow: "hidden",
  color: "#e9edf3",
  fontSize: 14,
};
const dock = (side) => ({
  position: "fixed",
  bottom: 14,
  [side === "left" ? "left" : "right"]: 14,
  zIndex: 40,
});
const head = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  borderBottom: "1px solid #1b2533",
  background: "linear-gradient(0deg, #0f141b, #0b0f14)",
};
const headBtn = {
  marginLeft: "auto",
  background: "#11161d",
  color: "#c7cfdb",
  border: "1px solid #223043",
  padding: "4px 8px",
  borderRadius: 8,
  cursor: "pointer",
};
const dot = { width: 10, height: 10, borderRadius: 99, background: "#3ddc84" };
const box = { maxHeight: 340, overflowY: "auto", padding: 12, display: "grid", gap: 8 };
const bubbleBot = {
  background: "#10161d",
  border: "1px solid #223043",
  padding: "8px 10px",
  borderRadius: 10,
  whiteSpace: "pre-wrap",
};
const bubbleUser = {
  background: "rgba(124,226,161,.12)",
  border: "1px solid rgba(124,226,161,.35)",
  padding: "8px 10px",
  borderRadius: 10,
  justifySelf: "end",
  whiteSpace: "pre-wrap",
};
const composer = {
  display: "flex",
  gap: 8,
  padding: 10,
  borderTop: "1px solid #1b2533",
  background: "#0f141b",
};
const inputBox = {
  flex: 1,
  background: "#0b0f14",
  border: "1px solid #223043",
  color: "#e9edf3",
  padding: "10px 12px",
  borderRadius: 10,
  outline: "none",
};
const sendBtn = {
  border: "none",
  color: "#0b0f14",
  fontWeight: 800,
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
};
const teaser = {
  padding: 12,
  color: "#c7cfdb",
  fontSize: 13,
};
const pill = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #223043",
  cursor: "pointer",
};