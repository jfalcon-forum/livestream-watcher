import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

// WDAY JWPlayer Site ID
const SITE_ID = "l0XScfRd";

const getLiveChannels = async (siteId) => {
  const response = await axios({
    method: "get",
    // Supports up to 25 channels before we need to scale and consider pagination
    url: `https://api.jwplayer.com/v2/sites/${siteId}/channels/?page=1&page_length=25&sort=created%3Adsc`,
    headers: {
      accept: "application/json",
      Authorization: process.env.JWPLAYER_SECRET,
    },
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        return {
          error: {
            status: error.response.status,
            data: error.response.data,
          },
        };
      } else {
        return "Error", error.message;
      }
    });
  return response;
};

const getLiveEventStream = async (mediaId) => {
  const response = await axios({
    method: "get",
    url: `https://cdn.jwplayer.com/v2/media/${mediaId}`,
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        return {
          error: {
            status: error.response.status,
            data: error.response.data,
          },
        };
      } else {
        return "Error", error.message;
      }
    });
  return response;
};

const constructWhizObject = (liveEvent, channel) => {
  if (liveEvent.message) {
    return;
  }
  let title = channel.metadata.title;
  let eventText;
  // hard coded specifically for WDAY+ Channel
  if (channel.id === "oQI9YDnI") {
    title = "Live Now";
    eventText = "WDAY+";
  } else if (liveEvent.description.length > 0) {
    eventText = liveEvent.description;
  } else {
    eventText = liveEvent.title;
  }
  let whizObj = {
    action: `scheme://video?url=${encodeURIComponent(
      liveEvent.playlist[0].sources[0].file
    )}`,
    // use channel title name + override channel name with description
    alertTitle: title,
    // title from the instant live event used if no description exists
    text: eventText,
  };
  return whizObj;
};

const whizArr = async (siteId) => {
  let channels = await getLiveChannels(siteId);
  if (channels.error) {
    return channels.error;
  }
  let filteredChannels = await channels.channels.filter(
    (channel) => channel.status === "active"
  );
  const arr = await Promise.all(
    filteredChannels.map(async (channel) => {
      let event = channel.recent_events[0];
      if (event.status !== "active") {
        return;
      }
      let liveEvent = await getLiveEventStream(event.media_id);
      if (liveEvent.error) {
        console.log(liveEvent.error);
        return;
      }
      return constructWhizObject(liveEvent, channel);
    })
  );
  return arr.filter((item) => item !== undefined);
};

whizArr(SITE_ID).then(console.log);
