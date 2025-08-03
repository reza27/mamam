import { Component, forwardRef, Input } from "@angular/core";
import { format, fromUnixTime } from "date-fns";

import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
  IonIcon,
} from "@ionic/angular/standalone";
import { MmCardComponent } from "@components/mm-card/mm-card.component";
import { BrazeContentCard } from "@models/braze/braze-content-card";
import { Router } from "@angular/router";
import { IDismissCard } from "@models/braze/dismiss-card";
import { addIcons } from "ionicons";
import { arrowBackOutline } from "ionicons/icons";
import { HeaderComponent } from "@components/header/header.component";

@Component({
  selector: "app-notification-modal",
  templateUrl: "notification.modal.component.html",
  standalone: true,
  styleUrls: ["./notification.modal.component.scss"],

  imports: [
    IonContent,
    IonHeader,
    MmCardComponent,
    forwardRef(() => HeaderComponent),
  ],
})
export class NotificationModalComponent {
  @Input() data: BrazeContentCard[] | undefined;

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private router: Router
  ) {
    addIcons({ arrowBackOutline });
  }

  async dismissCard(obj: IDismissCard): Promise<void> {
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
      BrazePlugin.logContentCardDismissed(obj.id);
      this.data?.splice(obj.index, 1);
    }
  }
  formatDate(date: number) {
    return format(fromUnixTime(date), "MM.dd.yyyy hh:mm");
  }

  naviagateToUrl(url: string | undefined): void {
    const formattedUrl = "/" + url?.split("//")[1];

    if (url) {
      this.router.navigate([formattedUrl]).then((_) => this.cancel());
    }
  }

  cancel() {
    BrazePlugin.requestContentCardsRefresh();
    return this.modalCtrl.dismiss(null, "cancel");
  }
}
