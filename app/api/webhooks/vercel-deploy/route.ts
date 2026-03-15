import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/supabase-server';

export async function POST(request: Request) {
  try {
    // 1. 驗證用戶是否已登入
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Unauthorized: No user session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    // 2. 檢查 role（從 profiles 查，不用 Custom Access Token hook）
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      console.error('Forbidden: User is not admin');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. 觸發 Vercel Deploy Hook
    const vercelDeployHook = process.env.VERCEL_DEPLOY_HOOK_URL;
    
    if (!vercelDeployHook) {
      return NextResponse.json({ error: 'Deploy hook not configured' }, { status: 500 });
    }

    console.log('🚀 Triggering Vercel deploy for user:', user.email);
    const response = await fetch(vercelDeployHook, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vercel deploy hook failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Deploy triggered successfully:', data.job?.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Deploy triggered',
      jobId: data.job?.id 
    });
  } catch (error: any) {
    console.error('Deploy trigger error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}