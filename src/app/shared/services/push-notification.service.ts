import { Injectable } from "@angular/core";
import {
  BrazeParsedExtra,
  BrazePushNotification,
} from "@models/braze/braze-push-notification";
import {
  PushNotifications,
  PushNotificationSchema,
} from "@capacitor/push-notifications";
import { BehaviorSubject, Observable } from "rxjs";
import { BrazeContentCard } from "@models/braze/braze-content-card";

@Injectable({
  providedIn: "root",
})
export class PushNotificationService {
  private cards = new BehaviorSubject<BrazeContentCard[]>([]);
  private hasUnreadMessages = new BehaviorSubject<boolean>(false);
  private isFetchingMessages = new BehaviorSubject<boolean>(false);

  constructor() {}

  public getCards(): Observable<BrazeContentCard[]> {
    return this.cards.asObservable();
  }

  public getHasUnreadMessages(): Observable<boolean> {
    return this.hasUnreadMessages.asObservable();
  }

  public setHasUnreadMessages(hasUnreadMessages: boolean) {
    return this.hasUnreadMessages.next(hasUnreadMessages);
  }

  public getIsFetchingMessages(): Observable<boolean> {
    return this.isFetchingMessages.asObservable();
  }

  public setIsFetchingMessages(isFetchingMessages: boolean) {
    return this.isFetchingMessages.next(isFetchingMessages);
  }

  public async refreshCards(): Promise<void> {
    console.log("loading...");
    this.setIsFetchingMessages(true);
    BrazePlugin.getContentCardsFromServer(
      (cards: BrazeContentCard[]) => {
        this.setIsFetchingMessages(false);

        this.cards.next(cards);

        console.log("loaded");
      },
      (err: any) => {
        console.log("cards error ", err);
      }
    );
  }

  init() {
    PushNotifications.addListener("registration", (token) => {
      console.log("~ PushNotificationService ~ token:", token);
      this.refreshCards();
    });

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema | BrazePushNotification) => {
        console.log("Push received: ", JSON.stringify(notification));

        const extra: BrazeParsedExtra = JSON.parse(notification.data.extra);

        if (extra?.type === "inbox") {
          this.setHasUnreadMessages(true);
          this.refreshCards();
        }
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener("registrationError", (error: any) => {
      alert("Error on registration: " + JSON.stringify(error));
    });

    this.registerPush();
  }

  async registerPush(): Promise<void> {
    let pushReq = await PushNotifications.checkPermissions();

    if (pushReq.receive === "prompt") {
      pushReq = await PushNotifications.requestPermissions();
    }

    if (pushReq.receive) {
      // Ask iOS user for permission/auto grant android permission
      await PushNotifications.register();
    }
  }
}
