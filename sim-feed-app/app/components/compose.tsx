import { useState } from 'react';

export const Compose = () => {
  const [composeText, setComposeText] = useState("");
  return (
    <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-6 mb-4 motion-preset-fade motion-delay-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary text-[0.9rem]">
          YOU
        </div>
        <div>
          <div className="font-semibold text-[0.95rem] text-sf-text-primary">
            Your Account
          </div>
          <div className="text-sf-text-dim text-[0.85rem]">
            @yourusername
          </div>
        </div>
      </div>
      <textarea
        className="w-full bg-sf-bg-primary border border-sf-border-primary rounded p-4 text-sf-text-primary font-sans text-[1rem] resize-none transition-colors duration-300 focus:outline-none focus:border-sf-accent-primary"
        placeholder="What's on your mind?"
        rows={3}
        value={composeText}
        onChange={(e) => setComposeText(e.target.value)}
      />
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-5 py-2.5 border border-sf-border-subtle rounded text-[0.85rem] font-semibold uppercase tracking-[0.5px] bg-transparent text-sf-text-tertiary transition-all duration-300 hover:border-sf-text-secondary hover:text-sf-text-primary cursor-pointer"
          onClick={() => setComposeText("")}
        >
          Cancel
        </button>
        <button className="px-5 py-2.5 border border-sf-accent-primary rounded text-[0.85rem] font-semibold uppercase tracking-[0.5px] bg-sf-accent-primary text-sf-bg-primary transition-all duration-300 hover:bg-sf-accent-hover hover:border-sf-accent-hover cursor-pointer">
          Post
        </button>
      </div>
    </div>
  )
}