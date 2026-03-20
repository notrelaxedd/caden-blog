"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContactEmail, type ContactState } from "@/app/actions/contact";

const initial: ContactState = { status: "idle" };

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendContactEmail, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="font-mono text-xs text-[#444]">
            name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="bg-[#111] border border-[#222] rounded px-4 py-2.5 text-sm text-[#f0f0f0] placeholder:text-[#333] focus:outline-none focus:border-[#444] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-mono text-xs text-[#444]">
            email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="bg-[#111] border border-[#222] rounded px-4 py-2.5 text-sm text-[#f0f0f0] placeholder:text-[#333] focus:outline-none focus:border-[#444] transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="font-mono text-xs text-[#444]">
          message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="What's on your mind?"
          className="bg-[#111] border border-[#222] rounded px-4 py-2.5 text-sm text-[#f0f0f0] placeholder:text-[#333] focus:outline-none focus:border-[#444] transition-colors resize-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="text-sm font-medium text-[#f0f0f0] border border-[#2a2a2a] px-5 py-2.5 rounded hover:border-[#444] hover:bg-[#161616] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? "Sending..." : "Send message"}
        </button>

        {state.status === "success" && (
          <p className="font-mono text-xs text-[#4ade80]">Sent.</p>
        )}
        {state.status === "error" && (
          <p className="font-mono text-xs text-[#f87171]">{state.message}</p>
        )}
      </div>
    </form>
  );
}
