import { useEffect, useMemo, useRef, useState } from "react";

/**
 * HealthChatbot – a lightweight, on‑page triage assistant
 * -------------------------------------------------------
 * • Asks if the visitor feels unwell
 * • Lets them choose symptoms via quick‑reply buttons
 * • Collects severity & duration and checks for red‑flag signs
 * • Gives friendly, non‑diagnostic guidance and next steps
 * • Includes a floating launcher + theming via props
 * 
 * Drop this file anywhere in your React project and render <HealthChatbot/> once (e.g., in App.jsx).
 * Requires Tailwind (or replace classNames with your styles).
 */

export default function HealthChatbot({
  brand = "NutriBridge",
  accent = "#7ce2a1",
  position = "bottom-right", // "bottom-left" | "bottom-right"
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    botMsg(
      `Hi! I’m your ${brand} helper. Are you feeling unwell? Pick a symptom to begin. (This isn’t medical advice.)`
    ),
  ]);
  const [step, setStep] = useState("chooseSymptom");
  const [state, setState] = useState({
    symptom: null,
    severity: null,
    duration: null,
    redFlags: null,
  });

  const chatBoxRef = useRef(null);
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Symptom catalog with copy & self‑care suggestions
  const catalog = useMemo(
    () => ({
      fever: {
        label: "Fever",
        tips: [
          "Stay hydrated; sip water or oral rehydration solution.",
          "Rest; avoid strenuous activity.",
          "You may consider paracetamol/acetaminophen as per label instructions if not allergic.",
        ],
        redFlags: [
          "fever > 39.4°C (103°F)",
          "confusion, severe headache/neck stiffness",
          "rash with fever, difficulty breathing",
          "fever > 3 days in adults or > 24h in young children",
        ],
      },
      cough: {
        label: "Cough/Cold",
        tips: [
          "Warm fluids and steam inhalation may ease symptoms.",
          "Honey for adults (avoid in children <1 year).",
          "Rest and monitor temperature/oxygen if available.",
        ],
        redFlags: [
          "shortness of breath/wheezing",
          "chest pain",
          "bluish lips/face",
          "coughing blood",
        ],
      },
      soreThroat: {
        label: "Sore Throat",
        tips: [
          "Warm salt‑water gargles.",
          "Throat lozenges (age‑appropriate).",
          "Plenty of fluids and rest.",
        ],
        redFlags: ["trouble breathing/swallowing", "drooling", "severe one‑sided throat pain with fever"],
      },
      stomach: {
        label: "Stomach Ache",
        tips: [
          "Small, bland meals; avoid spicy/fatty food.",
          "Hydrate; try ORS if diarrhoea present.",
          "Heat pad (low) may ease cramps.",
        ],
        redFlags: [
          "severe/worsening pain or persistent vomiting",
          "blood in stool/vomit",
          "rigid or swollen abdomen",
          "pain with high fever",
        ],
      },
      vomiting: {
        label: "Vomiting",
        tips: [
          "Take small sips of water/ORS frequently.",
          "Avoid solid food until vomiting settles, then reintroduce bland foods.",
        ],
        redFlags: ["signs of dehydration", "blood/bile in vomit", "severe abdominal pain", "very drowsy/confused"],
      },
      diarrhoea: {
        label: "Diarrhoea",
        tips: [
          "ORS after each loose stool; keep sipping fluids.",
          "Avoid caffeine and very fatty foods.",
        ],
        redFlags: [
          "blood in stool",
          "high fever",
          "severe dehydration (very dry mouth, little/no urination)",
        ],
      },
      headache: {
        label: "Headache",
        tips: [
          "Hydrate; limit screen time; rest in a dark, quiet room.",
          "Check if missed meals/caffeine withdrawal/stress are triggers.",
        ],
        redFlags: [
          "sudden, worst‑ever headache",
          "headache with fever/stiff neck/confusion",
          "new headache after head injury",
          "vision changes/weakness/numbness",
        ],
      },
      skin: {
        label: "Rash/Skin Issue",
        tips: [
          "Keep the area clean and dry.",
          "Avoid new cosmetics/detergents that may irritate.",
        ],
        redFlags: ["rapidly spreading rash", "rash with fever", "painful blisters", "signs of infection (pus, streaking)"],
      },
      chestPain: {
        label: "Chest Pain",
        tips: [
          "Stop activity, rest, and monitor how you feel.",
          "Note triggers (exertion/stress/meals).",
        ],
        redFlags: [
          "pressure/heaviness radiating to arm/jaw/back",
          "shortness of breath, sweating, nausea",
          "pain with fainting or irregular heartbeat",
        ],
      },
    }),
    [brand]
  );

  const symptomKeys = Object.keys(catalog);

  // UI helpers
  function botMsg(text) {
    return { by: "bot", text, ts: Date.now() };
  }
  function userMsg(text) {
    return { by: "user", text, ts: Date.now() };
  }
  function push(...msgs) {
    setMessages((m) => [...m, ...msgs]);
  }
  function choose(k) {
    const label = catalog[k].label;
    setState((s) => ({ ...s, symptom: k }));
    push(userMsg(label));
    setTimeout(() => {
      push(
        botMsg(
          `Got it — ${label}. How severe is it right now?`
        )
      );
      setStep("chooseSeverity");
    }, 200);
  }

  function onSeverity(level) {
    setState((s) => ({ ...s, severity: level }));
    push(userMsg(level));
    setTimeout(() => {
      push(botMsg("How long has this been going on?"));
      setStep("chooseDuration");
    }, 200);
  }

  function onDuration(d) {
    setState((s) => ({ ...s, duration: d }));
    push(userMsg(d));
    const { symptom } = { ...state, duration: d };
    const rf = catalog[symptom]?.redFlags || [];
    setTimeout(() => {
      if (rf.length) {
        push(
          botMsg(
            `Please check if any of these red‑flag signs are present: ${rf.join(
              "; "
            )}.`
          ),
          botMsg("Do any apply to you right now?")
        );
        setStep("redFlags");
      } else {
        finishGuidance(false);
      }
    }, 200);
  }

  function finishGuidance(hasRedFlags) {
    const { symptom, severity, duration } = state;
    const entry = catalog[symptom];

    const lines = [];
    if (hasRedFlags) {
      lines.push(
        "Based on what you selected, it’s safest to seek urgent medical care. If symptoms are severe or you’re worried, call local emergency services immediately."
      );
    } else {
      lines.push(
        `Here are some general self‑care steps for ${entry.label}:`,
        ...entry.tips
      );

      if (severity === "Severe" || duration === "> 3 days") {
        lines.push(
          "Because your symptoms are significant or prolonged, please book an appointment with a qualified clinician soon."
        );
      } else {
        lines.push(
          "If things don’t improve or new symptoms appear, consider consulting a clinician."
        );
      }
    }

    lines.push(
      "Note: This chatbot does not provide diagnosis or replace professional medical advice."
    );

    push(botMsg(lines.join("\n• ")));
    setStep("done");
  }

  const severityOptions = ["Mild", "Moderate", "Severe"];
  const durationOptions = ["< 24 hours", "1–3 days", "> 3 days"];

  // Launcher position
  const floatingPos =
    position === "bottom-left"
      ? "left-4 bottom-5"
      : "right-4 bottom-5";

  return (
    <>
      {/* Floating launcher */}
      <button
        aria-label="Open health chatbot"
        onClick={() => setOpen((v) => !v)}
        className={`fixed ${floatingPos} z-50 rounded-full shadow-lg px-4 py-3 text-sm font-semibold`}
        style={{ background: accent, color: "#0b0f14" }}
      >
        {open ? "Close" : "Need help?"}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className={`fixed ${floatingPos} translate-y-[-68px] w-[340px] max-h-[70vh] z-50`}
        >
          <div className="rounded-2xl shadow-2xl overflow-hidden bg-[#0b0f14] text-[#e9edf3] border border-[#1b2533]">
            <header
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: "#11161d" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ background: accent }}
                />
                <div className="leading-tight">
                  <div className="font-semibold">{brand} Health Helper</div>
                  <div className="text-xs text-[#a6b0bf]">General guidance • Not medical advice</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#a6b0bf] hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            <div ref={chatBoxRef} className="px-3 py-3 space-y-2 overflow-y-auto max-h-[48vh]">
              {messages.map((m) => (
                <Bubble key={m.ts} by={m.by} text={m.text} accent={accent} />
              ))}
            </div>

            <footer className="p-3 border-t border-[#1b2533]">
              {step === "chooseSymptom" && (
                <QuickGrid>
                  {symptomKeys.map((k) => (
                    <Quick key={k} onClick={() => choose(k)}>
                      {catalog[k].label}
                    </Quick>
                  ))}
                </QuickGrid>
              )}

              {step === "chooseSeverity" && (
                <QuickRow>
                  {severityOptions.map((s) => (
                    <Quick key={s} onClick={() => onSeverity(s)}>
                      {s}
                    </Quick>
                  ))}
                </QuickRow>
              )}

              {step === "chooseDuration" && (
                <QuickRow>
                  {durationOptions.map((d) => (
                    <Quick key={d} onClick={() => onDuration(d)}>
                      {d}
                    </Quick>
                  ))}
                </QuickRow>
              )}

              {step === "redFlags" && (
                <div className="flex gap-2">
                  <Button onClick={() => { push(userMsg("Yes")); finishGuidance(true); }}>Yes</Button>
                  <Button onClick={() => { push(userMsg("No")); finishGuidance(false); }}>No</Button>
                </div>
              )}

              {step === "done" && (
                <div className="text-xs text-[#a6b0bf]">
                  Need a different symptom? <button className="underline" onClick={() => {
                    setMessages((m) => [...m, botMsg("Okay — choose another symptom.")]);
                    setStep("chooseSymptom");
                    setState({ symptom: null, severity: null, duration: null, redFlags: null });
                  }}>Start over</button>
                </div>
              )}
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ by, text, accent }) {
  const isUser = by === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-line text-sm px-3 py-2 rounded-2xl ${
          isUser ? "rounded-br-sm" : "rounded-bl-sm"
        }`}
        style={{
          background: isUser ? accent : "#161c25",
          color: isUser ? "#0b0f14" : "#e9edf3",
          boxShadow: isUser ? "0 4px 14px rgba(0,0,0,.35)" : "none",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Quick({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 text-sm rounded-xl bg-[#161c25] hover:bg-[#1c2633] border border-[#223043]"
    >
      {children}
    </button>
  );
}

function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 text-sm rounded-xl bg-white/90 text-black hover:bg-white"
    >
      {children}
    </button>
  );
}

function QuickRow({ children }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function QuickGrid({ children }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}