"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Message } from "../types";

export function useChat(profileId: string | null, onPresenceRefresh?: () => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const lastMessageIdRef = useRef<string | null>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      const data: Message[] = await res.json();
      setMessages(data);

      const latest = data[data.length - 1];
      if (latest && latest.id !== lastMessageIdRef.current) {
        if (lastMessageIdRef.current !== null && !isOpenRef.current) {
          setHasUnread(true);
        }
        lastMessageIdRef.current = latest.id;
      }
    } catch {
      // silent
    }
  }, []);

  const pingPresence = useCallback(async () => {
    if (!profileId) return;
    try {
      await fetch(`/api/profiles/${profileId}/presence`, { method: "PATCH" });
      onPresenceRefresh?.();
    } catch {
      // silent
    }
  }, [profileId, onPresenceRefresh]);

  // Initial load + message polling every 5s
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // Presence heartbeat every 60s + fire on profile change
  useEffect(() => {
    if (!profileId) return;
    pingPresence();
    const interval = setInterval(pingPresence, 60_000);
    return () => clearInterval(interval);
  }, [profileId, pingPresence]);

  async function sendMessage() {
    if (!inputValue.trim() || !profileId || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, content: inputValue.trim() }),
      });
      const newMessage: Message = await res.json();
      setMessages(prev => [...prev, newMessage]);
      lastMessageIdRef.current = newMessage.id;
      setInputValue("");
    } catch {
      // silent
    } finally {
      setIsSending(false);
    }
  }

  return {
    messages,
    isOpen,
    setIsOpen,
    inputValue,
    setInputValue,
    isSending,
    hasUnread,
    sendMessage,
  };
}
