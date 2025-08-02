import { Component, Input, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonTitle,
  IonToolbar,
  ModalController,
} from "@ionic/angular/standalone";
import { MmCardComponent } from "@components/mm-card/mm-card.component";
import { BrazeContentCard } from "@models/braze/braze-content-card";
import { PushNotificationService } from "@services/push-notification.service";

@Component({
  selector: "app-notification-modal",
  templateUrl: "notification.modal.component.html",
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonTitle,
    IonToolbar,
    MmCardComponent,
  ],
})
export class NotificationModalComponent {
  @Input() data: BrazeContentCard[] | undefined;

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    console.log("data:", this.data);
  }

  async dismissCard(id: string, index: number): Promise<void> {
    const alert = await this.alertController.create({
      header: "Delete Message",
      message: "Are you sure you would like to delete this message?",
      buttons: [
        {
          text: "No",
          role: "no",
        },
        {
          role: "yes",
          text: "Yes",
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    if (role === "yes") {
      BrazePlugin.logContentCardDismissed(id);
      this.data?.splice(index, 1);

      console.log("logContentCardDismissed: ", id);
    }
  }

  cancel() {
    console.log("refresh cards on cancel");

    BrazePlugin.requestContentCardsRefresh();
    return this.modalCtrl.dismiss(null, "cancel");
  }
}
