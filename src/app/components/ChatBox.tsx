"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import type { Profile } from "../types";
import { formatLastSeen, getPresenceColor } from "../types";
import { useChat } from "../hooks/useChat";

interface ChatBoxProps {
  currentProfile: Profile;
  profiles: Profile[];
  onPresenceRefresh: () => void;
}

function Avatar({ profile, size = 32 }: { profile: Profile; size?: number }) {
  if (profile.imageUrl) {
    return (
      <img
        src={profile.imageUrl}
        alt={profile.username}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(255,0,85,0.2)",
        border: "1px solid rgba(255,0,85,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 700,
        color: "#FF0055",
        flexShrink: 0,
        fontFamily: "var(--font-bebas)",
        letterSpacing: "0.05em",
      }}
    >
      {profile.username[0].toUpperCase()}
    </div>
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBox({ currentProfile, profiles, onPresenceRefresh }: ChatBoxProps) {
  const { messages, isOpen, setIsOpen, inputValue, setInputValue, isSending, hasUnread, sendMessage } =
    useChat(currentProfile.id, onPresenceRefresh);

  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Chat Panel */}
      <div
        style={{
          position: "fixed",
          bottom: "6rem",
          right: "1.5rem",
          zIndex: 40,
          width: "22rem",
          height: "560px",
          background: "rgba(6,6,12,0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,0,85,0.15)",
          borderRadius: "1rem",
          boxShadow: "0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,0,85,0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transformOrigin: "bottom right",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
          transform: isOpen ? "scale(1)" : "scale(0.85)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
        }}
      >
        {/* Header */}
        <div style={{ padding: "1rem 1rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "1.35rem",
                  letterSpacing: "0.12em",
                  color: "#FF0055",
                  lineHeight: 1,
                  textShadow: "0 0 20px rgba(255,0,85,0.4)",
                }}
              >
                CHAT
              </div>
              <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", marginTop: "0.15rem" }}>
                {profiles.length} MEMBER{profiles.length !== 1 ? "S" : ""}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.75rem",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,0,85,0.15)";
                (e.currentTarget as HTMLButtonElement).style.color = "#FF0055";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
              }}
            >
              ✕
            </button>
          </div>

          {/* Presence pills */}
          <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
            {profiles.map(p => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  background: p.id === currentProfile.id ? "rgba(255,0,85,0.1)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${p.id === currentProfile.id ? "rgba(255,0,85,0.2)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: "999px",
                  padding: "0.2rem 0.5rem 0.2rem 0.25rem",
                  flexShrink: 0,
                }}
              >
                <div style={{ position: "relative" }}>
                  <Avatar profile={p} size={18} />
                  <div style={{
                    position: "absolute",
                    bottom: -1,
                    right: -1,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: getPresenceColor(p.lastSeenAt),
                    border: "1px solid rgba(6,6,12,0.9)",
                  }} />
                </div>
                <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", fontWeight: 600 }}>
                  {p.username.toUpperCase()}
                </span>
                <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.25)" }}>
                  {formatLastSeen(p.lastSeenAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messageListRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.75rem 0.875rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,0,85,0.2) transparent",
          }}
        >
          {messages.length === 0 && (
            <div style={{
              margin: "auto",
              textAlign: "center",
              color: "rgba(255,255,255,0.2)",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.4 }}>💬</div>
              Noch keine Nachrichten.<br />Schreib die erste!
            </div>
          )}
          {messages.map(msg => {
            const isOwn = msg.profileId === currentProfile.id;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: isOwn ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: "0.4rem",
                }}
              >
                <Avatar profile={msg.profile} size={26} />
                <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
                  {!isOwn && (
                    <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: "0.2rem", fontWeight: 600 }}>
                      {msg.profile.username.toUpperCase()}
                    </span>
                  )}
                  <div
                    style={{
                      padding: "0.45rem 0.7rem",
                      borderRadius: isOwn ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                      background: isOwn ? "rgba(255,0,85,0.14)" : "rgba(255,255,255,0.05)",
                      border: isOwn ? "1px solid rgba(255,0,85,0.22)" : "1px solid rgba(255,255,255,0.08)",
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.9)",
                      lineHeight: 1.45,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>
                  <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.2)", marginTop: "0.15rem" }}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht..."
              rows={1}
              maxLength={500}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "0.625rem",
                padding: "0.55rem 0.75rem",
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.8rem",
                resize: "none",
                outline: "none",
                lineHeight: 1.5,
                maxHeight: "5rem",
                overflow: "auto",
                transition: "border-color 0.15s",
                fontFamily: "inherit",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,0,85,0.35)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isSending}
              style={{
                width: 38,
                height: 38,
                borderRadius: "0.625rem",
                background: inputValue.trim() && !isSending ? "#FF0055" : "rgba(255,0,85,0.15)",
                border: "none",
                cursor: inputValue.trim() && !isSending ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                boxShadow: inputValue.trim() && !isSending ? "0 2px 12px rgba(255,0,85,0.35)" : "none",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.15)", marginTop: "0.35rem", letterSpacing: "0.06em" }}>
            ENTER senden · SHIFT+ENTER Zeilenumbruch
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 50,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: isOpen ? "#FF0055" : "rgba(8,8,16,0.96)",
          border: isOpen ? "none" : "1px solid rgba(255,0,85,0.3)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isOpen
            ? "0 4px 20px rgba(255,0,85,0.5), 0 0 40px rgba(255,0,85,0.2)"
            : "0 4px 20px rgba(0,0,0,0.5)",
          transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          transform: isOpen ? "rotate(0deg) scale(1)" : "rotate(0deg) scale(1)",
        }}
        onMouseEnter={e => {
          if (!isOpen) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(255,0,85,0.4), 0 0 30px rgba(255,0,85,0.15)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,0,85,0.6)";
          }
        }}
        onMouseLeave={e => {
          if (!isOpen) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,0,85,0.3)";
          }
        }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#FF0055" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#FF0055",
              border: "2px solid rgba(6,6,12,1)",
              animation: "spotlightPulse 1.5s ease-in-out infinite",
            }}
          />
        )}
      </button>
    </>
  );
}
