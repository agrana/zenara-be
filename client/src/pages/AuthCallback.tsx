import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallback() {
  const [, navigate] = useLocation()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Auth callback started')
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })
        console.log('Session set:', data, 'Error:', error)
        if (data?.session) {
          navigate('/')
        } else {
          navigate('/login')
        }
      } else {
        navigate('/login')
      }
    }
    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )
}