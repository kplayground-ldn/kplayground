import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // If there's an error in the URL, redirect to home with error message
  if (error) {
    console.error('Auth callback error:', error, error_description)
    return NextResponse.redirect(`${requestUrl.origin}/?error=${error}`)
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`)
    }

    // Successful authentication, redirect to home
    return NextResponse.redirect(`${requestUrl.origin}/?confirmed=true`)
  }

  // No code or error, redirect to home
  return NextResponse.redirect(requestUrl.origin)
}
