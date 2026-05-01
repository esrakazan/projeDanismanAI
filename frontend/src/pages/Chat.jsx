import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../services/api";

const SKILLS = [
  { value: "otomatik", label: "🤖 Otomatik Tespit" },
  { value: "project_idea_refinement", label: "💡 Proje Fikri Netleştirme" },
  { value: "report_section_writer", label: "📝 Rapor Bölümü Yazma" },
  { value: "tubitak_application_guidance", label: "🔬 TÜBİTAK Başvuru" },
  { value: "teknofest_ktr_ptr_guidance", label: "🏆 TEKNOFEST KTR/PTR" },
  { value: "feasibility_and_risk_check", label: "⚖️ Risk Analizi" },
  { value: "title_abstract_generator", label: "✏️ Başlık ve Özet" },
  { value: "presentation_and_jury_preparation", label: "🎤 Sunum Hazırlığı" },
];

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [skill, setSkill] = useState("otomatik");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data);
    } catch {
      navigate("/login");
    }
  }

  async function newConversation() {
    const res = await api.post("/conversations", { title: "Yeni Sohbet" });
    const conv = res.data;
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.id);
    setMessages([]);
  }

  async function selectConversation(id) {
    setActiveConvId(id);
    const res = await api.get(`/conversations/${id}/messages`);
    setMessages(res.data);
  }

  async function deleteConversation(e, id) {
    e.stopPropagation();
    await api.delete(`/conversations/${id}`);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setMessages([]);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !activeConvId || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        conversation_id: activeConvId,
        message: userMsg.content,
        skill,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response, skill_used: res.data.skill_used },
      ]);
      // Sidebar'daki başlığı güncelle
      loadConversations();
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Bir hata oluştu. Tekrar dene." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function downloadWord() {
    if (!input.trim() || !activeConvId) return;
    try {
      const res = await api.post(
        "/chat/word",
        { conversation_id: activeConvId, message: input, skill },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "rapor.docx";
      a.click();
    } catch {
      alert("Word dosyası oluşturulamadı.");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={styles.layout}>
      {/* SOL SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.logoText}>ProjeDanışmanAI</span>
          <button style={styles.logoutBtn} onClick={logout}>Çıkış</button>
        </div>

        <button style={styles.newChatBtn} onClick={newConversation}>
          + Yeni Sohbet
        </button>

        <div style={styles.convList}>
          {conversations.map((c) => (
            <div
              key={c.id}
              style={{
                ...styles.convItem,
                background: activeConvId === c.id ? "#2a2a2a" : "transparent",
              }}
              onClick={() => selectConversation(c.id)}
            >
              <span style={styles.convTitle}>{c.title}</span>
              <button
                style={styles.deleteBtn}
                onClick={(e) => deleteConversation(e, c.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SAĞ MAIN */}
      <div style={styles.main}>
        {!activeConvId ? (
          <div style={styles.emptyState}>
            <h2 style={styles.emptyTitle}>ProjeDanışmanAI'ya Hoş Geldin</h2>
            <p style={styles.emptyText}>
              Sol taraftan "Yeni Sohbet" oluştur ve yazmaya başla.
            </p>
          </div>
        ) : (
          <>
            {/* MESAJLAR */}
            <div style={styles.messages}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.msgRow,
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.role === "assistant" && (
                    <div style={styles.avatar}>AI</div>
                  )}
                  <div
                    style={{
                      ...styles.bubble,
                      background: msg.role === "user" ? "#7c5cbf" : "#1e1e1e",
                      border: msg.role === "user" ? "none" : "1px solid #2a2a2a",
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {msg.skill_used && (
                          <div style={styles.skillBadge}>{msg.skill_used}</div>
                        )}
                      </>
                    ) : (
                      <p style={{ margin: 0 }}>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
                  <div style={styles.avatar}>AI</div>
                  <div style={{ ...styles.bubble, background: "#1e1e1e", border: "1px solid #2a2a2a" }}>
                    <span style={styles.typing}>Yazıyor...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ALT INPUT ALANI */}
            <div style={styles.inputArea}>
              <select
                style={styles.select}
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              >
                {SKILLS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <div style={styles.inputRow}>
                <textarea
                  style={styles.textarea}
                  placeholder="Mesajını yaz... (Enter = gönder, Shift+Enter = yeni satır)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  style={styles.wordBtn}
                  onClick={downloadWord}
                  title="Word olarak indir"
                >
                  📄
                </button>
                <button
                  style={{
                    ...styles.sendBtn,
                    opacity: loading || !input.trim() ? 0.5 : 1,
                  }}
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  Gönder
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    background: "#0f0f0f",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
  },
  sidebar: {
    width: "260px",
    minWidth: "260px",
    background: "#141414",
    borderRight: "1px solid #2a2a2a",
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    gap: "12px",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#aaa",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "#666",
    fontSize: "12px",
    cursor: "pointer",
  },
  newChatBtn: {
    background: "#7c5cbf",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
  },
  convList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  convItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    gap: "8px",
  },
  convTitle: {
    fontSize: "13px",
    color: "#ccc",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#555",
    cursor: "pointer",
    fontSize: "11px",
    flexShrink: 0,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "600",
  },
  emptyText: {
    color: "#666",
    fontSize: "14px",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#7c5cbf",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "600",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "70%",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#e0e0e0",
  },
  skillBadge: {
    marginTop: "8px",
    fontSize: "11px",
    color: "#7c5cbf",
    borderTop: "1px solid #2a2a2a",
    paddingTop: "6px",
  },
  typing: {
    color: "#666",
    fontSize: "13px",
  },
  inputArea: {
    padding: "16px 24px",
    borderTop: "1px solid #2a2a2a",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  select: {
    background: "#1e1e1e",
    border: "1px solid #3a3a3a",
    borderRadius: "8px",
    color: "#ccc",
    padding: "8px 12px",
    fontSize: "13px",
    width: "fit-content",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    background: "#1e1e1e",
    border: "1px solid #3a3a3a",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#fff",
    fontSize: "14px",
    resize: "none",
    outline: "none",
    lineHeight: "1.5",
  },
  wordBtn: {
    background: "#1e1e1e",
    border: "1px solid #3a3a3a",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "16px",
    cursor: "pointer",
  },
  sendBtn: {
    background: "#7c5cbf",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};