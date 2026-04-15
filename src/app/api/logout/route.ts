import { NextResponse } from 'next/server'
import { signOut } from 'next-auth/react'

export async function POST() {
  try {
    // Client-side signOut will be called, server redirects
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
