import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: "3d54b3eb31958abb7852",
  cluster: "eu",
  forceTLS: true,
});

export default echo;