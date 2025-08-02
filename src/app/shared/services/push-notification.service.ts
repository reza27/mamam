import { Injectable } from "@angular/core";
import {
  BrazeParsedExtra,
  BrazePushNotification,
} from "@models/braze/braze-push-notification";
import {
  PushNotifications,
  PushNotificationSchema,
} from "@capacitor/push-notifications";

@Injectable({
  providedIn: "root",
})
export class PushNotificationService {
  constructor() {}

  init() {
    PushNotifications.addListener("registration", (token) => {
      console.log("~ PushNotificationService ~ token:", token);
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
            (cards: any) => {
              console.log("cards >>>> ", cards);
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
