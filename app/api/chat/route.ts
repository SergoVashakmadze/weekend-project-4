// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Message, StreamingAgentChatResponse } from 'llamaindex';

import { agent } from '@/app/api/chat/engine';

export const runtime = 'nodejs';

async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages ?? [];
    const result = await agent.chat(messages);

    if (result instanceof StreamingAgentChatResponse) {
      return new NextResponse(result.response, {
        headers: {
          'Content-Type': 'text/event-stream',



          