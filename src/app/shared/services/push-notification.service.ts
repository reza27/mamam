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
  private initCards = new BehaviorSubject<BrazeContentCard[]>([]);
  private hasUnreadMessages = new BehaviorSubject<boolean>(false);

  constructor() {}

  public getCards(): Observable<BrazeContentCard[]> {
    return this.cards.asObservable();
  }

  public getUpdatedCards(): Observable<BrazeContentCard[]> {
    return this.initCards.asObservable();
  }

  public getHasUnreadMessages(): Observable<boolean> {
    return this.hasUnreadMessages.asObservable();
  }

  public setHasUnreadMessages(hasUnreadMessages: boolean) {
    return this.hasUnreadMessages.next(hasUnreadMessages);
  }

  public async refreshCards(): Promise<void> {
    BrazePlugin.getContentCardsFromServer(
      (cards: BrazeContentCard[]) => {
        this.initCards.next(cards);
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
          BrazePlugin.getContentCardsFromServer(
            (cards: BrazeContentCard[]) => {
              this.cards.next(cards);
              this.setHasUnreadMessages(true);
            },
            (err: any) => {
              console.log("cards error ", err);
            }
          );
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
