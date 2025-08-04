import { Component, forwardRef, Input, signal } from "@angular/core";
import { format, fromUnixTime } from "date-fns";

import {
  AlertController,
  IonContent,
  IonHeader,
  ModalController,
} from "@ionic/angular/standalone";
import { MmCardComponent } from "@components/mm-card/mm-card.component";
import { BrazeContentCard } from "@models/braze/braze-content-card";
import { Router } from "@angular/router";
import { IDismissCard } from "@models/braze/dismiss-card";
import { addIcons } from "ionicons";
import { arrowBackOutline } from "ionicons/icons";
import { HeaderComponent } from "@components/header/header.component";
import { InViewDirective } from "../shared/directives/inview.directive";
import { PushNotificationService } from "@services/push-notification.service";
import { Subscription } from "rxjs";
import { SpinnerComponent } from "@components/spinner/spinner.component";

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
    InViewDirective,
    SpinnerComponent,
  ],
})
export class NotificationModalComponent {
  data = signal([] as BrazeContentCard[]);
  isLoading = signal(false);

  private viewedData: BrazeContentCard[] | undefined;
  private YES: string = "yes";
  private cardsSubscription: Subscription | undefined;
  private fetchingMessagesSubscription: Subscription | undefined;

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private router: Router,
    private pushNotificationService: PushNotificationService
  ) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.pushNotificationService.refreshCards();
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
          role: this.YES,
          text: "Yes",
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    if (role === this.YES) {
      BrazePlugin.logContentCardDismissed(obj.id);
      this.data()?.splice(obj.index, 1);
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

  onItemInView(itemInView: any, inView: boolean) {
    const filteredData = this.viewedData?.filter((item) => {
      if (item.id === itemInView.id) {
        if (!item.viewed) {
          BrazePlugin.logContentCardImpression(item.id);
        }
      }
      return item.id !== itemInView.id;
    });

    this.viewedData = filteredData;
  }

  ngAfterViewInit(): void {
    this.cardsSubscription = this.pushNotificationService
      .getCards()
      .subscribe((cards) => {
        if (cards.length > 0) {
          this.data.set([...cards]);
          this.viewedData = this.data()?.slice();
        }
      });

    this.fetchingMessagesSubscription = this.pushNotificationService
      .getIsFetchingMessages()
      .subscribe((isFetchingMessages) => {
        if (isFetchingMessages) {
          this.data.set([]);
        }
        this.isLoading.set(isFetchingMessages);
      });
  }
  ngOnDestroy(): void {
    this.cardsSubscription?.unsubscribe();
    this.fetchingMessagesSubscription?.unsubscribe();
  }

  cancel() {
    BrazePlugin.requestContentCardsRefresh();

    return this.modalCtrl.dismiss(null, "cancel");
  }
}
