import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";

import {
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
  name!: string;

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    return this.modalCtrl.dismiss(null, "cancel");
  }

  confirm() {
    return this.modalCtrl.dismiss(this.name, "confirm");
  }
}
