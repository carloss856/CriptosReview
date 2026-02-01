import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appPriceFlash]',
  standalone: true
})
export class PriceFlashDirective implements OnChanges, OnDestroy {
  @Input('appPriceFlash') value!: number;

  private prevValue: number | undefined;
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly elementRef: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!('value' in changes)) {
      return;
    }

    if (this.prevValue === undefined) {
      this.prevValue = this.value;
      return;
    }

    if (this.value === this.prevValue) {
      return;
    }

    const className = this.value > this.prevValue ? 'flash-up' : 'flash-down';
    this.prevValue = this.value;

    this.applyFlash(className);
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  private applyFlash(className: string): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    this.renderer.removeClass(this.elementRef.nativeElement, 'flash-up');
    this.renderer.removeClass(this.elementRef.nativeElement, 'flash-down');
    this.renderer.addClass(this.elementRef.nativeElement, className);

    this.timeoutId = setTimeout(() => {
      this.renderer.removeClass(this.elementRef.nativeElement, className);
      this.timeoutId = undefined;
    }, 200);
  }
}
