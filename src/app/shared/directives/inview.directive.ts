import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";

@Directive({
  selector: "[inView]",
  standalone: true,
})
export class InViewDirective implements OnInit, OnDestroy {
  @Output() inView = new EventEmitter<boolean>();

  private observer: IntersectionObserver | undefined;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.inView.emit(entry.isIntersecting);
          console.log("Enter", entry.boundingClientRect);
          return;
        }
      },
      {
        root: null,
        threshold: 1,
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
