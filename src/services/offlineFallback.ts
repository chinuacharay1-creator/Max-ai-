/**
 * Offline Fallback Processor for MAX AI Assistant
 * Guarantees that time, date, math, notes, and local shortcuts
 * work seamlessly even if the internet or external APIs are down!
 */

import { addVoiceNote } from "./memoryStorage";

export interface OfflineResponse {
  isOffline: boolean;
  handled: boolean;
  reply: string;
  actionTaken?: string;
}

export function processOfflineCommand(input: string): OfflineResponse {
  const lower = input.toLowerCase().trim();

  // Time query
  if (lower.includes("time") || lower.includes("samay") || lower.includes("baje")) {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return {
      isOffline: true,
      handled: true,
      reply: `Abhi offline time ${timeStr} hai, Boss!`,
      actionTaken: "checked_time",
    };
  }

  // Date query
  if (lower.includes("date") || lower.includes("tarikh") || lower.includes("aaj kya din")) {
    const dateStr = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return {
      isOffline: true,
      handled: true,
      reply: `Aaj ${dateStr} hai.`,
      actionTaken: "checked_date",
    };
  }

  // Math evaluation
  if (/^[0-9+\-*/().%^ ]+$/.test(lower) || lower.includes("calculate") || lower.includes("hisab")) {
    try {
      const sanitized = lower.replace(/[^0-9+\-*/().%^ ]/g, "");
      if (sanitized.trim()) {
        // eslint-disable-next-line no-eval
        const res = Function(`"use strict"; return (${sanitized})`)();
        return {
          isOffline: true,
          handled: true,
          reply: `Offline calculation: ${sanitized} = ${res}`,
          actionTaken: "calculated_math",
        };
      }
    } catch {
      // ignore
    }
  }

  // Quick note saving
  if (lower.includes("note kar") || lower.includes("save note")) {
    const content = input.replace(/(MAX|note karo|note kar lo|save note)/gi, "").trim();
    if (content) {
      addVoiceNote("Quick Offline Note", content);
      return {
        isOffline: true,
        handled: true,
        reply: "Maine offline memory mein note save kar liya hai, Boss!",
        actionTaken: "saved_note",
      };
    }
  }

  // Creator identity query
  if (lower.includes("kisne banaya") || lower.includes("who created you")) {
    return {
      isOffline: true,
      handled: true,
      reply: "Mujhe Chinu AI ne banaya hai! Wo bahut bade AI creator hain, location Trimurti Sahi.",
      actionTaken: "creator_attribution",
    };
  }

  return {
    isOffline: true,
    handled: false,
    reply: "Internet disconnected hai, lekin main basic offline commands (time, date, calculator, notes) ke liye ready hoon!",
  };
}
