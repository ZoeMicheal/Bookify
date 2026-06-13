'use client';
import React from 'react'
import {Mic, MicOff} from "lucide-react";
import useVapi from "@/hooks/useVapi";
import {IBook} from "@/types";
import Image from "next/image";
import Transcript from "@/components/Transcript";

const VapiControls = ({ book }: { book: IBook}) => {
    const {  status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop, clearErrors, } =
        useVapi(book)

    const allMessages = [...messages]
    if (currentUserMessage) allMessages.push({ role: 'user', content: currentUserMessage })
    if (currentMessage) allMessages.push({ role: 'assistant', content: currentMessage })

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header card */}
                <section className="vapi-header-card">
                    <div className="vapi-cover-wrapper">
                        <Image
                            src={book.coverURL || "/assets/placeholder-cover.png"}
                            alt={book.title}
                            width={120}
                            height={180}
                            className="vapi-cover-image rounded shadow-lg"
                            priority
                        />
                        <div className="vapi-mic-wrapper">
                            {(status === 'speaking' || status === 'thinking') && (
                                <div className="vapi-pulse-ring" />
                            )}
                            <button
                                onClick={isActive ? stop : start}
                                disabled={status === 'connecting'}
                                className={`vapi-mic-btn ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'}`}
                            >
                                {isActive ? (
                                    <Mic className="w-6 h-6 text-[#212a3b] animate-pulse" />
                                ) : (
                                    <MicOff className="w-6 h-6 text-[#212a3b]" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#212a3b]">
                                {book.title}
                            </h1>
                            <p className="text-[#3d485e] font-medium">by {book.author}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="vapi-status-indicator">
                                <span className={`vapi-status-dot ${isActive ? 'vapi-status-dot-active' : 'vapi-status-dot-ready'}`} />
                                <span className="vapi-status-text">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                            </div>
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">Voice: {book.persona || "Default"}</span>
                            </div>
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}/15:00</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="vapi-transcript-wrapper">
                    <Transcript
                        messages={allMessages}
                        currentMessage={currentMessage}
                        currentUserMessage={currentUserMessage}
                    />
                </div>
            </div>
        </>
    )
}
export default VapiControls;
