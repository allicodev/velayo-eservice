import Pusher from "pusher";
import Pusher2 from "pusher-js";

export class PusherBE {
  private pusher;

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_APP_KEY!,
      secret: process.env.PUSHER_APP_SECRET!,
      cluster: "ap1",
      useTLS: true,
    });
  }

  public emit(channel: string, event: string, data: Record<any, any>) {
    this.pusher.trigger(channel, event, data);
  }
}

export class PusherFE {
  private pusher;
  private channel: any;
  public hasSubscribe = false;

  constructor() {
    this.pusher = new Pusher2(process.env.PUSHER_APP_KEY!, {
      cluster: "ap1",
    });
  }

  public subscribe(str: string) {
    this.channel = this.pusher.subscribe(str);
    this.hasSubscribe = true;
    return this;
  }

  public bind(event: string, callback: Function) {
    if (this.hasSubscribe) {
      this.channel.bind(event, function (data: any) {
        return callback(JSON.stringify(data));
      });
    } else return callback(JSON.stringify({ message: "not subscribe yet" }));
  }
}
