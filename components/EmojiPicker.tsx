'use client';
import React from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmojiPickerComponent({ onEmojiSelect, isOpen, onClose }: EmojiPickerProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg mx-auto" style={{ maxWidth: '300px' }}>
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          onEmojiSelect(emojiData.emoji);
          onClose();
        }}
        theme={Theme.LIGHT}
        width={300}
        height={400}
      />
    </div>
  );
}