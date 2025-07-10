import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Database connection successful!',
      data 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database connection failed' 
    }, { status: 500 })
  }
} 