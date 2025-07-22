import React from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
}

export default function EmojiPicker({ onEmojiSelect, isOpen }: EmojiPickerProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-0 z-50">
      <Picker
        data={data}
        onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
        theme="light"
        previewPosition="none"
        skinTonePosition="search"
        searchPosition="sticky"
        perLine={8}
        maxFrequentRows={2}
        emojiSize={24}
        style={{ border: 'none', boxShadow: 'none', width: 340 }}
      />
    </div>
  );
} 