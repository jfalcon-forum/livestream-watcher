import axios from "axios";

// Using playlists doesn't scale well long term
const playlists = ["o0JFJzQS", "Kx4Vkocx", "HYQIjMin"];

// dirty way going straight to cdn call
const getPlaylist = async (playlistId) => {
  const response = await axios({
    method: "get",
    url: `https://cdn.jwplayer.com/v2/playlists/${playlistId}?format=json`,
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error.response.data;
    });
  return response;
};

const constructWhizObject = (playlist) => {
  // JWPlayer returns an object with message property; Only occurs when feed_id is invalid or playlist is inactive aka deleted
  if (playlist.message) {
    return;
  }
  let whizObj = {
    action: `scheme://video?url=${playlist.playlist[0].sources[0].file}`,
    alertTitle: playlist.title,
    text: playlist.description,
  };
  return whizObj;
};

const whizArr = async (playlists) => {
  const arr = await Promise.all(
    playlists.map(async (playlist) => {
      let playlistResponse = await getPlaylist(playlist);
      return constructWhizObject(playlistResponse);
    })
  );
  return arr.filter((item) => item !== undefined);
};

export const handler = async (event, context) => {
  return await whizArr(playlists);
};
