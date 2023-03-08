# livestream-watcher

Middleware software created to check what channels are live in JWPlayer, find the corresponding media_id for a live event, and format and forward the live event stream information to Whiz.

## Requirements

Locally, you'll need to create a .env file and populate it with the JWPlayer Secret that's found within JWPlayer.

```
JWPLAYER_SECRET=SECRET_VALUE
```

## To Run Locally

```
npm install
```

To run `node index.js`

## Additional Notes

The `playlistWatcher.js` was the initial solution. Queries a list of given playlists and checks their sources for the stream. Problem is that it didn't keep track of whether an event was active or idle.
