import { Component } from "@angular/core";
import { IonApp, IonRouterOutlet, Platform } from "@ionic/angular/standalone";
import { PushNotificationService } from "@services/push-notification.service";
import * as braze from "@braze/web-sdk";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private pushNotificationService: PushNotificationService,
    private platform: Platform
  ) {
    this.platform
      .ready()
      .then(() => {
        this.pushNotificationService.init();
      })
      .catch((e) => {
        console.log("init error", e);
      });
  }
}
