// app/api/webhooks/vercel-deploy/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 驗證 webhook 來源（可選但建議）
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SUPABASE_WEBHOOK_SECRET;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 觸發 Vercel Deploy Hook
    const vercelDeployHook = process.env.VERCEL_DEPLOY_HOOK_URL;
    
    if (!vercelDeployHook) {
      return NextResponse.json({ error: 'Deploy hook not configured' }, { status: 500 });
    }

    const response = await fetch(vercelDeployHook, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Vercel deploy hook failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Deploy triggered',
      jobId: data.job?.id 
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}