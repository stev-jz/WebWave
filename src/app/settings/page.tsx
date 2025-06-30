'use client';

import { supabase } from '../../../supabaseClient'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button onClick={handleLogout} className="text-red-600">
      Logout
    </button>
  )
}
