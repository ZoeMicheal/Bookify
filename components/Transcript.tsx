'use client';

import React, { useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';
import { Messages } from '@/types';

interface TranscriptProps {
  messages: Messages[];
  currentMessage: string;
  currentUserMessage: string;
}

const Transcript = ({ messages, currentMessage, currentUserMessage }: TranscriptProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentMessage, currentUserMessage]);

  const allMessages = [...messages];
  if (currentUserMessage) allMessages.push({ role: 'user', content: currentUserMessage });
  if (currentMessage) allMessages.push({ role: 'assistant', content: currentMessage });

  const isEmpty = allMessages.length === 0;

  if (isEmpty) {
    return (
      <div className="transcript-container h-[500px]">
        <div className="transcript-empty">
          <Mic className="w-12 h-12 text-[#212a3b] mb-4" />
          <h3 className="transcript-empty-text">No conversation yet</h3>
          <p className="transcript-empty-hint">
            Click the mic button above to start talking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="transcript-container h-[500px]">
      <div className="transcript-messages" ref={scrollRef}>
        {allMessages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isLast = index === allMessages.length - 1;
          const isTyping = isLast && (
            (isUser && currentUserMessage) ||
            (!isUser && currentMessage)
          );

          return (
            <div
              key={index}
              className={`transcript-message ${
                isUser ? 'transcript-message-user' : 'transcript-message-assistant'
              }`}
            >
              <div
                className={`transcript-bubble ${
                  isUser ? 'transcript-bubble-user' : 'transcript-bubble-assistant'
                }`}
              >
                {msg.content}
                {isTyping && <span className="transcript-cursor" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Transcript;
