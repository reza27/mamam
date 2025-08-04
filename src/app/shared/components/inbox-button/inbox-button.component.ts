import { AfterViewInit, Component, input, signal } from "@angular/core";
import {
  IonButton,
  IonIcon,
  IonAccordion,
  ModalController,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { notificationsOutline } from "ionicons/icons";
import anime, { AnimeInstance } from "animejs";
import { NotificationModalComponent } from "src/app/notifications/notification.modal.component";
import { PushNotificationService } from "@services/push-notification.service";
import { BrazeContentCard } from "@models/braze/braze-content-card";
import { asyncScheduler, delay, Subscription } from "rxjs";

@Component({
  selector: "app-inbox-button",
  template: `
    <div class="notification-button">
      @if (unreadMessages()) {
      <svg
        class="notification-button-unread"
        height="10"
        width="10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle r="4.5" cx="5" cy="5" fill="red" />
      </svg>
      }
      <ion-button
        class="bell"
        [slot]="slot()"
        fill="clear"
        (click)="showInbox()"
      >
        <ion-icon
          color="dark"
          slot="icon-only"
          name="notifications-outline"
        ></ion-icon>
      </ion-button>
    </div>
  `,
  styles: [
    `
      ion-button {
        --padding-end: 0.5rem;
        --padding-start: 0.5rem;
        font-size: 1.75rem;
      }

      .notification-button {
        position: relative;
        svg {
          position: absolute;
          top: 30%;
          right: 25%;
          z-index: 99;
        }
      }
    `,
  ],
  imports: [IonButton, IonIcon],
  standalone: true,
})
export class InboxButtonComponent implements AfterViewInit {
  readonly slot = input<IonAccordion["toggleIconSlot"]>();
  unreadMessages = signal(false);
  private shakeAnimation?: AnimeInstance;
  private hasUnreadMessages: Subscription | undefined;

  constructor(
    private pushNotificationService: PushNotificationService,
    private modalCtrl: ModalController
  ) {
    addIcons({ notificationsOutline });
  }

  async showInbox(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: NotificationModalComponent,
    });
    modal.present();
    this.pushNotificationService.setHasUnreadMessages(false);
  }

  ngOnDestroy(): void {
    this.hasUnreadMessages?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.hasUnreadMessages = this.pushNotificationService
      .getHasUnreadMessages()
      .pipe(delay(300))
      .subscribe((hasUnreadMessages) => {
        this.unreadMessages.set(hasUnreadMessages);
        if (hasUnreadMessages) {
          this.shakeAnimation?.restart();
        }
      });
    this.shakeAnimation = anime({
      targets: ".bell",
      translateX: [
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: 0, duration: 50 },
      ],
      easing: "easeInOutSine",
      duration: 2000,
      autoplay: false,
    });
  }
}
