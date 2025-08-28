import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    // Inicializar cliente Supabase para operações de admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Inicializar cliente Supabase para verificação de usuário
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Verificar se o usuário autenticado é admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Erro ao verificar usuário:', userError);
      throw new Error('Usuário não autenticado');
    }

    // Verificar se é admin
    const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin', { user_id: user.id });
    if (adminError || !isAdminResult) {
      console.error('Erro ao verificar permissões de admin:', adminError);
      return new Response(JSON.stringify({ error: 'Acesso negado: apenas administradores podem resetar senhas' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email } = await req.json();
    if (!email) {
      throw new Error('Email é obrigatório');
    }

    console.log(`Admin ${user.email} solicitou reset de senha para: ${email}`);

    // Buscar informações do usuário alvo
    const { data: targetUser, error: targetUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (targetUserError || !targetUser) {
      console.error('Usuário não encontrado:', targetUserError);
      return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Gerar link de reset de senha
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://id-preview--abc50e60-d059-42f1-9a13-3b320212798b.lovable.app'}/entrar`
      }
    });

    if (resetError) {
      console.error('Erro ao gerar link de reset:', resetError);
      throw new Error('Erro ao gerar link de reset de senha');
    }

    // Registrar log da ação
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const clientIP = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'Unknown';

    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: user.id,
        action: 'reset_password',
        target_user_email: email,
        target_user_id: targetUser.user?.id,
        details: {
          method: 'admin_reset',
          timestamp: new Date().toISOString()
        },
        ip_address: clientIP,
        user_agent: userAgent
      });

    if (logError) {
      console.error('Erro ao registrar log:', logError);
      // Não falhar a operação por causa do log
    }

    console.log(`Reset de senha processado com sucesso para ${email}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email de reset de senha enviado com sucesso',
      resetLink: resetData.properties?.action_link || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função admin-reset-password:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});