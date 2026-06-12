import {IBook, Messages} from "@/types";
import {useAuth} from "@clerk/nextjs";
import {useEffect, useRef, useState} from "react";
import {ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS} from "@/lib/constants";
import {startVoiceSession} from "@/lib/actions/session.actions";
import Vapi from '@vapi-ai/web'
import {getVoice} from "@/lib/utils";

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'listening' | 'thinking' | 'speaking';

const useLatestRef = <T>(value: T) => {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
}

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;

let vapi: InstanceType<typeof Vapi>

function getVapi() {
    if(!vapi){
        if(!VAPI_API_KEY) {
            throw new Error('NEXT_PUBLIC_VAPI_API_KEY not found. Please set it in the .env file')
        }

        vapi = new Vapi(VAPI_API_KEY);
    }
    return vapi;
}

export const useVapi = (book: IBook) => {
    const { userId } = useAuth();

    const [status, setStatus] = useState<CallStatus>('idle');
    const [messages, setMessages] = useState<Messages[]>([]);
    const [currentMessage, setCurrentMessage] = useState('')
    const [currentUserMessage, setCurrentUserMessage] = useState('')
    const [duration, setDuration] = useState(0);
    const [limitError, setLimitError] = useState<string | null>(null)

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimerRef = useRef<NodeJS.Timeout | null>(null);
    const sessionIdRef = useRef<string | null>(null);
    const isStoppingRef = useRef<boolean>(false);

    const bookRef = useLatestRef(book);
    const durationRef = useLatestRef(duration);

    useEffect(() => {
        const vapiInstance = getVapi();

        vapiInstance.on('call-start', () => {
            setStatus('listening');
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        });

        vapiInstance.on('call-end', () => {
            setStatus('idle');
            setMessages([]);
            setCurrentMessage('');
            setCurrentUserMessage('');
            if (timerRef.current) clearInterval(timerRef.current);
            setDuration(0);
        });

        vapiInstance.on('speech-start', () => {
            // No need to set speaking here as partial transcript will handle it or speech-end will handle thinking
        });

        vapiInstance.on('speech-end', () => {
            // setStatus('thinking'); // We set thinking on user final transcript
        });

        vapiInstance.on('message', (message: any) => {
            if (message.type === 'transcript' && message.transcriptType === 'partial') {
                if (message.role === 'user') {
                    setCurrentUserMessage(message.transcript);
                } else {
                    setStatus('speaking');
                    setCurrentMessage(message.transcript);
                }
            }

            if (message.type === 'transcript' && message.transcriptType === 'final') {
                if (message.role === 'user') {
                    setMessages(prev => [...prev, { role: 'user', content: message.transcript }]);
                    setCurrentUserMessage('');
                    setStatus('thinking');
                } else {
                    setMessages(prev => [...prev, { role: 'assistant', content: message.transcript }]);
                    setCurrentMessage('');
                }
            }
        });

        vapiInstance.on('error', (e) => {
            console.error('Vapi error', e);
            setStatus('idle');
            setLimitError('A connection error occurred');
        });

        return () => {
            vapiInstance.removeAllListeners();
        };
    }, []);

    const voice = book.persona || DEFAULT_VOICE


    const isActive = status === 'listening' || status === 'thinking' || status === 'speaking' || status === 'starting';

    //* Limits:
    // const maxDurationRef = useLatestRef(limits.maxSessionMinutes * 60)
    // const maxDurationSeconds
    // const remainingSecond
    // const showTimeWarning

    const start = async () => {
        if(!userId) return setLimitError('Please login to start a conversation');

        setLimitError(null);
        setStatus('connecting');

        try {
            const result = await startVoiceSession(userId, book._id)

            if(!result.success) {
                setLimitError(result.error || 'Session limit reached. Please upgrade your plan or try again later.');
                setStatus('idle');
                return;
            }

            sessionIdRef.current = result.sessionId || null;

            const firstMessage = `Hey, nice to meet you. Quick question, before we dive in: have you actually read ${book.title} yet? Or are we starting fresh?`

            await getVapi().start(ASSISTANT_ID, {
                firstMessage,
                variableValues: {
                    title: book.title, author: book.author, bookId: book._id
                },
                // voice: {
                //     provider: '11labs' as const,
                //     voiceId: getVoice(voice).id,
                //     model: "eleven_turbo_v2_5" as const,
                //     stability: VOICE_SETTINGS.stability,
                //     similarityBoost: VOICE_SETTINGS.similarityBoost,
                //     style: VOICE_SETTINGS.style,
                //     useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
                // }
            })


        } catch (e) {
            console.error('Error starting call', e);
            setStatus('idle');
            setLimitError('An Error occurred while starting the call');
        }
    }
    const stop = async () => {
        isStoppingRef.current  = true;
        await getVapi().stop();
    }
    const clearErrors = async () => {}

    return {
        status, isActive, messages, currentMessage, currentUserMessage, duration,
        start, stop, clearErrors,
        // maxDurationSecond, remainingSeconds, showTimeWarning
    }
}

export default useVapi;
