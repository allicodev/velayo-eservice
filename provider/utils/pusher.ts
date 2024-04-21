import Pusher from "pusher-js";

export default class MyPusher {
  private pusher: Pusher;

  constructor() {
    this.pusher = new Pusher("4944f472e05a5fbb3b6b", {
      cluster: "ap1",
    });
  }

  public subscribe(str: string) {
    return this.pusher.subscribe(str);
  }

  public unsubscribe(str: string) {
    this.pusher.unsubscribe(str);
  }

  public emit(channel: string, event: string, data: Record<any, any>) {
    this.pusher.channel(channel).trigger(event, data);
  }
}
