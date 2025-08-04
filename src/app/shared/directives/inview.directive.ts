import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
} from "@angular/core";

@Directive({
  selector: "[inView]",
  standalone: true,
})
export class InViewDirective implements OnDestroy, AfterViewInit {
  @Output() inView = new EventEmitter<boolean>();

  private observer: IntersectionObserver | undefined;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.inView.emit(entry.isIntersecting);
          return;
        }
      },
      {
        rootMargin: "-100px 0px -20% 0px",
        root: null,
        threshold: 0.01,
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
