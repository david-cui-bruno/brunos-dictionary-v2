import { supabase } from '@/lib/supabase'

export default async function Stats() {
  const [
    { count: wordCount },
    { count: definitionCount },
    { count: userCount }
  ] = await Promise.all([
    supabase.from('words').select('*', { count: 'exact', head: true }),
    supabase.from('definitions').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true })
  ])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-brown-primary mb-4">Dictionary Stats</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-brown-primary">{wordCount || 0}</div>
          <div className="text-sm text-gray-600">Words</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-brown-primary">{definitionCount || 0}</div>
          <div className="text-sm text-gray-600">Definitions</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-brown-primary">{userCount || 0}</div>
          <div className="text-sm text-gray-600">Contributors</div>
        </div>
      </div>
    </div>
  )
} 