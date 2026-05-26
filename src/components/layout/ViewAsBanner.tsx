import { Eye } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export function ViewAsBanner() {
  const { viewAsUserId, allProfiles, setViewAsUser } = useAuthStore()
  if (!viewAsUserId) return null
  const target = allProfiles.find((p) => p.id === viewAsUserId)
  if (!target) return null
  return (
    <div className="bg-violet-100 border-b border-violet-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-violet-800 min-w-0">
        <Eye className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium truncate">
          {target.avatar_emoji ?? '🙂'} {target.name}
        </span>
        <span className="text-violet-600 truncate">의 시점 (조회 전용)</span>
      </span>
      <button
        onClick={() => setViewAsUser(null)}
        className="flex-shrink-0 text-xs font-medium text-violet-700 hover:text-violet-900 px-2 py-1 rounded hover:bg-violet-200"
      >
        돌아가기
      </button>
    </div>
  )
}
