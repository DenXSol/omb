function subscribeToIdeas() {
  const channel = supabase
    .channel('public:council_ideas')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'council_ideas' },
      (payload) => {
        console.log('Ideas update:', payload)
        if (payload.eventType === 'INSERT') {
          setIdeas((current) => [payload.new as Idea, ...current])
        } else if (payload.eventType === 'UPDATE') {
          setIdeas((current) =>
            current.map((idea) =>
              idea.id === payload.new.id ? (payload.new as Idea) : idea
            )
          )
        }
      }
    )
    .subscribe((status) => {
      console.log('Ideas subscription status:', status)
    })

  return () => {
    supabase.removeChannel(channel)
  }
}
