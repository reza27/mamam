import { Component, EventEmitter, input, Output } from "@angular/core";
import { ImageLoaderComponent } from "@components/image-loader/image-loader.component";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from "@ionic/angular/standalone";
import { IDismissCard } from "@models/braze/dismiss-card";
import { addIcons } from "ionicons";
import { closeCircleOutline } from "ionicons/icons";

@Component({
  selector: "app-mm-card",
  template: ` <ion-card class="ion-no-padding">
    <ion-card-header>
      @if (title(); as title) {
      <ion-card-title>
        <div class="flex-row align-items-center">
          @if(showIcon()) {
          <div class="m-r-1">
            <app-image-loader
              src="assets/icon/mm-cc-logo.png"
              imageClass="iconize"
              maxWidth="30px"
              skeletonDiameter="30px"
              skeletonBorderRadius="30px"
            ></app-image-loader>
          </div>
          } @if(isInboxMessage()){
          <div class="inbox-message-heading">
            <div class="inbox-message-title">{{ title }}</div>
            <div
              class="dismiss-icon"
              (click)="dismissCard(itemId(), index(), $event)"
            >
              <ion-icon size="large" name="close-circle-outline"></ion-icon>
            </div>
          </div>
          } @else{ {{ title }}}
        </div>
      </ion-card-title>
      }
    </ion-card-header>

    <ion-card-content>
      <ng-content>Some text</ng-content>
    </ion-card-content>
  </ion-card>`,
  styles: [],
  styleUrls: ["./mm-card.component.scss"],
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    ImageLoaderComponent,
    IonIcon,
  ],
})
export class MmCardComponent {
  @Output() dismissCardEvent = new EventEmitter<IDismissCard>();

  constructor() {
    addIcons({ closeCircleOutline });
  }
  title = input("Mama Money");
  showIcon = input(true);
  isInboxMessage = input(false);
  itemId = input("");
  index = input(0);

  dismissCard(id: string, index: number, event: Event) {
    event.stopPropagation();
    const obj: IDismissCard = {
      id: id,
      index: index,
    };
    this.dismissCardEvent.emit(obj);
  }
}
