function subscribeToMessages() {
  const channel = supabase
    .channel('public:council_chat')
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'council_chat' 
      },
      (payload) => {
        console.log('New message received:', payload)
        setMessages((current) => [...current, payload.new as ChatMessage])
      }
    )
    .subscribe((status) => {
      console.log('Chat subscription status:', status)
    })

  return () => {
    supabase.removeChannel(channel)
  }
}
