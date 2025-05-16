pb.collection('lobbies').subscribe(lobbyId, (e) => {
    
  });

await pb.collection('lobbies').update(lobbyId, {
    boardState: newBoardState,
    currentTurn: newTurn,
    moves: moves + 1
  });