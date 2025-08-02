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
  constructor() {}

  public getCards(): Observable<BrazeContentCard[]> {
    return this.cards.asObservable();
  }

  init() {
    PushNotifications.addListener("registration", (token) => {
      console.log("~ PushNotificationService ~ token:", token);

      BrazePlugin.getContentCardsFromCache(
        (cards: BrazeContentCard[]) => {
          console.log("cache cards >>>> ", cards);
          this.cards.next(cards);
        },
        (err: any) => {
          console.log("cache cards error ", err);
        }
      );
    });

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema | BrazePushNotification) => {
        console.log("Push received: ", JSON.stringify(notification));

        const extra: BrazeParsedExtra = JSON.parse(notification.data.extra);
        console.log("Extra type: ", JSON.parse(notification.data.extra));

        if (extra?.type === "inbox") {
          console.log("getting cards >>>> ");

          BrazePlugin.getContentCardsFromServer(
            (cards: BrazeContentCard[]) => {
              console.log("cards >>>> ", cards);
              this.cards.next(cards);
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
      alert("Error on registration 1: " + JSON.stringify(error));
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
