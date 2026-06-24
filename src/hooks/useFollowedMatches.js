import { useMemo } from 'react'

export function useFollowedMatches(matches, groups, followed) {
  return useMemo(() => {
    const allTeams        = groups.flatMap(g => g.teams.map(t => ({ ...t, groupId: g.id })))
    const followedList    = allTeams.filter(t => followed.has(t.name))
    const followedGroups  = groups.filter(g => g.teams.some(t => followed.has(t.name)))
    const followedMatches = matches.filter(m => followed.has(m.home) || followed.has(m.away))
    const live            = followedMatches.filter(m => m.status === 'live')
    const upcoming        = followedMatches.filter(m => m.status === 'upcoming')
    const finished        = followedMatches.filter(m => m.status === 'finished').slice().reverse()

    return { allTeams, followedList, followedGroups, live, upcoming, finished }
  }, [matches, groups, followed])
}
