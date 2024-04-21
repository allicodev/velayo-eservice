import MyPuser from "pusher-js";
import MyPusher2 from "pusher";
export class Pusher {
  private pusher: MyPuser;

  constructor() {
    this.pusher = new MyPuser("4944f472e05a5fbb3b6b", {
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
    this.pusher.subscribe(channel).trigger(event, data);
  }
}

export class Pusher2 {
  private pusher: MyPusher2;

  constructor() {
    this.pusher = new MyPusher2({
      appId: "1772183",
      key: "4944f472e05a5fbb3b6b",
      secret: "359c4f436754d61af987",
      cluster: "ap1",
      useTLS: true,
    });
  }

  public async emit(channel: string, event: string, data: Record<any, any>) {
    await this.pusher.trigger(channel, event, data);
  }
}
