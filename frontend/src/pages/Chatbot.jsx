import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Bot, User, Sparkles } from "lucide-react";
import api from "../api/client";
import { PageHeader } from "../components/Common";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your food waste assistant. Ask me about food safety, donation guidance, storage tips, or composting.", mode: "rule_based" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [llmEnabled, setLlmEnabled] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/chatbot/suggestions").then(({ data }) => setSuggestions(data));
    api.get("/chatbot/status").then(({ data }) => setLlmEnabled(data.llm_enabled));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setSending(true);
    try {
      const { data } = await api.post("/chatbot/message", { message: msg });
      setMessages((m) => [...m, { role: "bot", text: data.reply, mode: data.mode }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, something went wrong. Please try again.", mode: "rule_based" }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon={MessageCircle}
        title="AI Chatbot"
        subtitle={llmEnabled ? "Powered by live Claude — ask anything about food safety & donation" : "Rule-based assistant (offline mode) — connect ANTHROPIC_API_KEY for live LLM answers"}
      />

      <div className="glass-card flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""} animate-fade-in`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-royal-100 text-royal-600" : "bg-emerald-100 text-emerald-600"}`}>
                {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-royal-600 text-white rounded-tr-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"
              }`}>
                {m.text}
                {m.role === "bot" && m.mode && (
                  <p className={`text-[10px] mt-1.5 font-semibold ${m.mode === "llm" ? "text-emerald-500" : "text-slate-400"}`}>
                    {m.mode === "llm" ? "✦ Live AI" : "Rule-based"}
                  </p>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Bot size={15} /></div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                <Sparkles size={11} /> {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-center gap-2 p-4 border-t border-slate-100"
        >
          <input
            className="input-field flex-1" placeholder="Ask about food safety, donation, storage..."
            value={input} onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={sending || !input.trim()} className="btn-primary !px-4 !py-2.5">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
