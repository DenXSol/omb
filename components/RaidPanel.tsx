function subscribeToRaids() {
  const channel = supabase
    .channel('public:council_raids')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'council_raids' },
      (payload) => {
        console.log('New raid:', payload)
        setRaids((current) => [payload.new as Raid, ...current])
      }
    )
    .subscribe((status) => {
      console.log('Raids subscription status:', status)
    })

  return () => {
    supabase.removeChannel(channel)
  }
}
