import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        /* clientPayload */
      ) => {
        // Generate a Python Shell token for the client, is it enough?
        // In a real app, you might want to validate the user session here
        return {
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            // userId: user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // 🚀  Can update database here
        console.log('blob upload completed', blob, tokenPayload);

        try {
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ status: 'completed' user: userId })
        } catch (error) {
          throw new Error('Could not update user');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The client will also get this error
    );
  }
}
