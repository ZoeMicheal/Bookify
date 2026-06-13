import { NextResponse } from 'next/server';
import { searchBookSegments } from '@/lib/actions/book.actions';
import { IBookSegment } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Vapi Tool Call Received:', JSON.stringify(body, null, 2));

    const toolCall = body.message?.toolCalls?.[0] || body.message?.toolCallList?.[0] || body.toolCall;

    if (!toolCall || toolCall.function?.name !== 'searchbook') {
        // If it's a tool call but not searchbook, we might want to return 400 or just ignore.
        // Vapi expects a specific response format for tool calls.
        return NextResponse.json({ error: 'Invalid tool call' }, { status: 400 });
    }

    const { bookId, query } = toolCall.function.arguments;

    if (!bookId || !query) {
      return NextResponse.json({ error: 'Missing bookId or query' }, { status: 400 });
    }

    const result = await searchBookSegments(bookId, query, 3);

    if (!result.success || !result.data || result.data.length === 0) {
      return NextResponse.json({
        results: [
          {
            toolCallId: toolCall.id,
            result: "no information found about this topic"
          }
        ]
      });
    }

    const combinedContent = result.data
      .map((segment: IBookSegment) => segment.content)
      .join('\n\n');

    return NextResponse.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: combinedContent
        }
      ]
    });
  } catch (error) {
    console.error('Error in search-book API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
