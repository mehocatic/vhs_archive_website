import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FilmDef, FILMS, preloadSheets } from './archive-data';

interface TapeElementCache {
  el: HTMLElement;
  spEl: HTMLElement;
  cvEl: HTMLElement;
}

interface TimelineTick {
  year: number;
  isMajor: boolean;
  pct: number;
  isFirst: boolean;
  isLast: boolean;
  isEvenTick: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:resize)': 'onResize()',
    '(window:keydown)': 'onKeyDown($event)',
    '(window:pointermove)': 'onPointerMove($event)',
    '(window:pointerup)': 'onPointerUp()',
    '(window:pointercancel)': 'onPointerUp()',
  },
})
export class App implements OnInit, OnDestroy {
  @ViewChild('heightProbe') heightProbeRef?: ElementRef<HTMLElement>;
  @ViewChild('shelfViewport') shelfViewportRef?: ElementRef<HTMLElement>;
  @ViewChild('stageEl') stageElRef?: ElementRef<HTMLElement>;
  @ViewChild('playRingBtn') playRingBtnRef?: ElementRef<HTMLElement>;
  @ViewChild('cursorEl') cursorElRef?: ElementRef<HTMLElement>;
  @ViewChild('timelineWrap') timelineWrapRef?: ElementRef<HTMLElement>;
  @ViewChild('detailSheet') detailSheetRef?: ElementRef<HTMLElement>;

  @ViewChild('subtitleMask') subtitleMaskRef?: ElementRef<HTMLElement>;
  @ViewChild('titleMask') titleMaskRef?: ElementRef<HTMLElement>;
  @ViewChild('yearMask') yearMaskRef?: ElementRef<HTMLElement>;

  readonly films: FilmDef[] = FILMS;

  // 36 tapes: 3 sets of 12 films
  readonly tapes = Array.from({ length: 36 }, (_, v) => ({
    v,
    film: FILMS[v % 12],
  }));

  // Timeline ticks: 1955 to 1990
  readonly timelineTicks: TimelineTick[] = Array.from({ length: 36 }, (_, i) => {
    const year = 1955 + i;
    const isMajor = year % 5 === 0;
    return {
      year,
      isMajor,
      pct: i / 35,
      isFirst: year === 1955,
      isLast: year === 1990,
      isEvenTick: (year - 1955) % 10 !== 0 && year !== 1955 && year !== 1990,
    };
  });

  // Shelf physics and arc geometry state
  s = 17; // Initial index (5 + 12 = 17, film #5: Noon in Ashes)
  T = 17;
  H = 320;
  ws = 54;
  d = 168;
  gap = 11;
  U = 416;
  readonly P = 1400;

  tiltX = 0;
  tiltY = 0;
  targetTiltX = 0;
  targetTiltY = 0;

  playRingX = 0;
  playRingY = 0;
  playRingScale = 1;

  dotYear = 1971;
  dotLeftPercent = ((1971 - 1955) / 35) * 100;

  detailOpen = false;
  activeFilmIndex = 5;
  prevActiveFilmIndex = 5;
  activeFilm: FilmDef = FILMS[5];

  hoveredTapeIndex: number | null = null;
  hoveredBtn = false;

  // Cursor coords
  cursorX = 0;
  cursorY = 0;
  targetMouseX = 0;
  targetMouseY = 0;

  // Dragging and interaction
  private isPointerDown = false;
  private isDragging = false;
  private hasDragged = false;
  private startX = 0;
  private startT = 17;
  private wheelSnapTimer: ReturnType<typeof setTimeout> | null = null;

  // Precomputed integral XS
  private XS = new Float32Array(0);

  // Per-tape hover lifts
  private tapeLifts = new Float32Array(36);

  // Cached DOM elements for the 36 tapes
  private tapeCache: TapeElementCache[] = [];

  private animationFrameId: number | null = null;
  private lastTime = 0;
  private isBrowser = false;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    preloadSheets();

    // Initialize cursor to center
    if (typeof window !== 'undefined') {
      this.cursorX = window.innerWidth / 2;
      this.cursorY = window.innerHeight / 2;
      this.targetMouseX = this.cursorX;
      this.targetMouseY = this.cursorY;
    }

    // Start RAF loop after elements are placed
    setTimeout(() => {
      this.cacheTapeElements();
      this.measureGeometry();
      this.lastTime = performance.now();
      this.tick();
    }, 20);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.wheelSnapTimer) {
      clearTimeout(this.wheelSnapTimer);
    }
  }

  private cacheTapeElements(): void {
    const stage = this.stageElRef?.nativeElement;
    if (!stage) return;

    const tapeEls = stage.querySelectorAll<HTMLElement>('.tape');
    this.tapeCache = [];
    tapeEls.forEach((el) => {
      const spEl = el.querySelector<HTMLElement>('.tape-face.sp')!;
      const cvEl = el.querySelector<HTMLElement>('.tape-face.cv')!;
      this.tapeCache.push({ el, spEl, cvEl });
    });
  }

  private measureGeometry(): void {
    const probe = this.heightProbeRef?.nativeElement;
    if (probe) {
      const hRect = probe.getBoundingClientRect().height;
      if (hRect > 20) {
        this.H = hRect;
      } else {
        this.H = Math.min(window.innerHeight * 0.47, window.innerWidth * 0.33);
      }
    } else {
      this.H = Math.min(window.innerHeight * 0.47, window.innerWidth * 0.33);
    }

    this.ws = (this.H * 142) / 840;
    this.d = (this.H * 474) / 900;
    this.gap = this.H * 0.035;

    const isPhone = window.innerWidth <= 767;
    this.U = isPhone ? this.H * 1.05 : this.H * 1.3;

    this.recomputeXS(this.U);
  }

  private recomputeXS(U: number): void {
    const stepCount = Math.ceil((3.2 * U) / 2) + 4;
    this.XS = new Float32Array(stepCount);
    let acc = 0;
    for (let i = 1; i < stepCount; i++) {
      const u = i * 2;
      acc += 2 / (1 + Math.pow(u / U, 1.6));
      this.XS[i] = acc;
    }
  }

  onResize(): void {
    this.measureGeometry();
  }

  // Math functions per specification
  private rel(v: number, s: number): number {
    let r = (v - s) % 36;
    if (r < -18) r += 36;
    if (r >= 18) r -= 36;
    return r;
  }

  private B(r: number): number {
    if (Math.abs(r) < 1) {
      return (r + Math.sin(Math.PI * r) / Math.PI) / 2;
    }
    return Math.sign(r) * 0.5;
  }

  private F(r: number): number {
    return r * (this.ws + this.gap) + (this.d - this.ws + 1.4 * this.gap) * this.B(r);
  }

  private smoothstep(t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return clamped * clamped * (3 - 2 * clamped);
  }

  private xsc(u: number): number {
    const absU = Math.abs(u);
    const idx = Math.min(this.XS.length - 1, Math.floor(absU / 2));
    return Math.sign(u) * (this.XS[idx] || 0);
  }

  private tick = (): void => {
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.05) dt = 0.05;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Spring physics
    if (reduced) {
      this.s = this.T;
    } else {
      const k = this.isDragging ? 18 : 5.2;
      this.s += (this.T - this.s) * (1 - Math.exp(-k * dt));
    }

    // 2. Loop shifting: when s passes ±4 loops, shift s and T by whole loops (12 films per loop)
    if (this.s < 6) {
      this.s += 12;
      this.T += 12;
      if (this.isDragging) this.startT += 12;
    } else if (this.s >= 24) {
      this.s -= 12;
      this.T -= 12;
      if (this.isDragging) this.startT -= 12;
    }

    // 3. Active film index and caption swap
    const activeIdx = ((Math.round(this.s) % 12) + 12) % 12;
    if (activeIdx !== this.activeFilmIndex) {
      const dir = Math.sign(this.T - this.s) || 1;
      this.prevActiveFilmIndex = this.activeFilmIndex;
      this.activeFilmIndex = activeIdx;
      this.activeFilm = this.films[activeIdx];
      this.swapCaption(dir, reduced);
    }

    // 4. Timeline dot interpolation
    const floorS = Math.floor(this.s);
    const floorIdx = ((floorS % 12) + 12) % 12;
    const nextIdx = (floorIdx + 1) % 12;
    const frac = this.s - floorS;

    let targetYear: number;
    if (floorIdx === 11 && nextIdx === 0) {
      targetYear = frac < 0.5 ? 1989 : 1958;
    } else {
      targetYear =
        this.films[floorIdx].year +
        frac * (this.films[nextIdx].year - this.films[floorIdx].year);
    }

    if (reduced || Math.abs(targetYear - this.dotYear) > 6) {
      this.dotYear = targetYear;
    } else {
      this.dotYear += (targetYear - this.dotYear) * (1 - Math.exp(-14 * dt));
    }
    this.dotLeftPercent = Math.max(0, Math.min(100, ((this.dotYear - 1955) / 35) * 100));

    // 5. Cover tilt & pointer check
    const W = window.innerWidth;
    const isPhone = W <= 767;
    const cyPx = window.innerHeight * (isPhone ? 0.43 : 0.41);
    const settled = Math.abs(this.T - this.s) < 0.3;
    const isOnCover =
      Math.abs(this.targetMouseX - W / 2) < 0.55 * this.d &&
      Math.abs(this.targetMouseY - cyPx) < 0.55 * this.H &&
      settled &&
      !this.detailOpen;

    if (isOnCover) {
      this.targetTiltY = ((this.targetMouseX - W / 2) / (0.55 * this.d)) * 8;
      this.targetTiltX = -((this.targetMouseY - cyPx) / (this.H / 2)) * 5;
    } else {
      this.targetTiltY = ((this.targetMouseX - W / 2) / W) * 4;
      this.targetTiltX = 0;
    }

    if (reduced) {
      this.tiltY = this.targetTiltY;
      this.tiltX = this.targetTiltX;
    } else {
      this.tiltY += (this.targetTiltY - this.tiltY) * (1 - Math.exp(-7 * dt));
      this.tiltX += (this.targetTiltX - this.tiltX) * (1 - Math.exp(-7 * dt));
    }

    // 6. Play ring position and scale
    this.playRingX = W / 2 - this.d / 2 - 6;
    this.playRingY = cyPx + 0.36 * this.H;
    if (this.detailOpen) {
      this.playRingScale = 0;
    } else {
      this.playRingScale = this.smoothstep(Math.max(0, 1 - Math.abs(this.T - this.s) * 3));
    }

    // 7. Cursor update
    this.cursorX += (this.targetMouseX - this.cursorX) * (1 - Math.exp(-16 * dt));
    this.cursorY += (this.targetMouseY - this.cursorY) * (1 - Math.exp(-16 * dt));
    if (this.cursorElRef?.nativeElement) {
      const curEl = this.cursorElRef.nativeElement;
      curEl.style.transform = `translate3d(${this.cursorX.toFixed(1)}px, ${this.cursorY.toFixed(1)}px, 0)`;

      curEl.classList.remove('state-open', 'state-spine', 'state-btn');
      if (this.hoveredBtn) {
        curEl.classList.add('state-btn');
      } else if (isOnCover) {
        curEl.classList.add('state-open');
      } else if (this.hoveredTapeIndex !== null) {
        const relHover = Math.abs(this.rel(this.hoveredTapeIndex, this.s));
        if (relHover > 0.5) {
          curEl.classList.add('state-spine');
        } else {
          curEl.classList.add('state-open');
        }
      }
    }

    // 8. Update all 36 tapes in 3D arc
    if (this.tapeCache.length === 36) {
      for (let v = 0; v < 36; v++) {
        const tape = this.tapeCache[v];
        const r = this.rel(v, this.s);
        const o = this.smoothstep(Math.max(0, 1 - Math.abs(r)));
        const u = this.F(r);

        if (Math.abs(u) > this.U * 1.95) {
          tape.el.style.display = 'none';
          continue;
        }
        tape.el.style.display = '';

        const sc = 1 / (1 + Math.pow(Math.abs(u) / this.U, 1.6));
        const k = 1 / sc;

        // Hover lift
        const isHovered = this.hoveredTapeIndex === v && Math.abs(r) > 0.5;
        const targetLift = isHovered ? 1 : 0;
        if (reduced) {
          this.tapeLifts[v] = targetLift;
        } else {
          this.tapeLifts[v] += (targetLift - this.tapeLifts[v]) * (1 - Math.exp(-12 * dt));
        }
        const lift = this.tapeLifts[v];

        const z = this.P * (1 - k) + o * this.H * 0.1;
        const x = this.xsc(u) * k;
        const y =
          (this.H * 0.5 * (1 - sc) * 0.42 + o * this.H * 0.012 - lift * this.H * 0.05) * k;

        const rotateY =
          Math.sign(u) * Math.min(1, Math.abs(u) / this.U) * 26 * (1 - o) -
          90 * o +
          this.tiltY * o;
        const rotateX = this.tiltX * o;

        tape.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        tape.el.style.zIndex = `${Math.round(3000 + z)}`;

        const spineShade = Math.min(0.6, o * 0.55 + (1 - sc) * 0.32);
        const coverShade = (1 - o) * 0.82;
        tape.spEl.style.setProperty('--shade', spineShade.toFixed(3));
        tape.cvEl.style.setProperty('--shade', coverShade.toFixed(3));
      }
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private swapCaption(dir: number, reduced: boolean): void {
    const newFilm = this.activeFilm;
    const swapLine = (
      container: HTMLElement | null | undefined,
      text: string,
      tag: string,
      className: string
    ) => {
      if (!container) return;
      const oldEl = container.querySelector('.caption-line') as HTMLElement | null;
      const newEl = document.createElement(tag);
      newEl.className = className;
      newEl.textContent = text;
      container.appendChild(newEl);

      if (reduced || !oldEl) {
        if (oldEl) oldEl.remove();
      } else {
        oldEl.animate(
          [
            { transform: 'translateY(0%)' },
            { transform: `translateY(${-dir * 105}%)` },
          ],
          {
            duration: 650,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'forwards',
          }
        ).onfinish = () => oldEl.remove();

        newEl.animate(
          [
            { transform: `translateY(${dir * 105}%)` },
            { transform: 'translateY(0%)' },
          ],
          {
            duration: 650,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'forwards',
          }
        );
      }
    };

    swapLine(
      this.subtitleMaskRef?.nativeElement,
      `${newFilm.romaji} / ${newFilm.kanji}`,
      'span',
      'caption-line caption-subtitle lbl'
    );
    swapLine(
      this.titleMaskRef?.nativeElement,
      newFilm.title,
      'h1',
      'caption-line caption-title'
    );
    swapLine(
      this.yearMaskRef?.nativeElement,
      `${newFilm.year} — ${newFilm.genre.toUpperCase()}`,
      'span',
      'caption-line caption-year'
    );
  }

  // Pointer & interaction events
  onPointerMove(e: PointerEvent): void {
    this.targetMouseX = e.clientX;
    this.targetMouseY = e.clientY;

    const target = e.target as HTMLElement | null;
    this.hoveredBtn = !!target?.closest('.hover-btn, a, button, .timeline-hitarea');

    if (this.isPointerDown && !this.detailOpen) {
      const dx = e.clientX - this.startX;
      if (Math.abs(dx) > 5) {
        this.hasDragged = true;
        this.isDragging = true;
      }
      if (this.isDragging) {
        this.T = this.startT - dx / (this.ws + this.gap);
      }
    }
  }

  onShelfPointerDown(e: PointerEvent): void {
    if (this.detailOpen) return;
    this.isPointerDown = true;
    this.hasDragged = false;
    this.isDragging = false;
    this.startX = e.clientX;
    this.startT = this.T;
  }

  onPointerUp(): void {
    if (this.isDragging) {
      this.T = Math.round(this.T);
      this.isDragging = false;
    }
    this.isPointerDown = false;
  }

  onShelfWheel(e: WheelEvent): void {
    if (this.detailOpen) return;
    e.preventDefault();
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    this.T += (delta / (this.ws + this.gap)) * 0.5;

    if (this.wheelSnapTimer) {
      clearTimeout(this.wheelSnapTimer);
    }
    this.wheelSnapTimer = setTimeout(() => {
      this.T = Math.round(this.T);
    }, 160);
  }

  onTapePointerEnter(v: number): void {
    this.hoveredTapeIndex = v;
  }

  onTapePointerLeave(v: number): void {
    if (this.hoveredTapeIndex === v) {
      this.hoveredTapeIndex = null;
    }
  }

  onTapeClick(v: number): void {
    if (this.hasDragged) return;
    const r = this.rel(v, this.s);
    if (Math.abs(r) < 0.5) {
      this.openDetail();
    } else {
      this.T = Math.round(this.T + r);
    }
  }

  step(direction: number): void {
    this.T = Math.round(this.T + direction);
  }

  onTimelineClick(e: MouseEvent): void {
    const wrap = this.timelineWrapRef?.nativeElement;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const clickedYear = 1955 + pct * 35;

    // Find nearest film
    let nearestIdx = 0;
    let minDiff = Infinity;
    this.films.forEach((film, i) => {
      const diff = Math.abs(film.year - clickedYear);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIdx = i;
      }
    });

    const currentFilmIdx = ((Math.round(this.s) % 12) + 12) % 12;
    // Shortest way round 12 films
    const stepDiff = (((nearestIdx - currentFilmIdx + 6) % 12) + 12) % 12 - 6;
    this.T = Math.round(this.T + stepDiff);
  }

  onTimelineKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.step(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.step(1);
    }
  }

  onKeyDown(e: KeyboardEvent): void {
    if (this.detailOpen) {
      if (e.key === 'Escape') {
        this.closeDetail();
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.step(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.step(1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.openDetail();
    }
  }

  private getActiveCoverFace(): HTMLElement | null {
    const stage = this.stageElRef?.nativeElement;
    if (!stage) return null;
    // Find tape whose rel(v, s) is closest to 0
    let closestV = 0;
    let minRel = Infinity;
    for (let v = 0; v < 36; v++) {
      const r = Math.abs(this.rel(v, this.s));
      if (r < minRel) {
        minRel = r;
        closestV = v;
      }
    }
    return stage.querySelector<HTMLElement>(`.tape[data-v="${closestV}"] .tape-face.cv`);
  }

  openDetail(): void {
    if (this.detailOpen) return;
    this.T = Math.round(this.T);
    this.detailOpen = true;

    setTimeout(() => {
      const activeCover = this.getActiveCoverFace();
      const sheetEl = this.detailSheetRef?.nativeElement;
      if (!sheetEl) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Fallback rect if activeCover is not ready
      let top = Math.round(window.innerHeight * 0.41 - this.H / 2);
      let bottom = Math.round(window.innerHeight - (window.innerHeight * 0.41 + this.H / 2));
      let left = Math.round(window.innerWidth / 2 - this.d / 2);
      let right = Math.round(window.innerWidth - (window.innerWidth / 2 + this.d / 2));

      if (activeCover) {
        const rect = activeCover.getBoundingClientRect();
        if (rect.width > 10 && rect.height > 10) {
          top = Math.round(rect.top);
          right = Math.round(window.innerWidth - rect.right);
          bottom = Math.round(window.innerHeight - rect.bottom);
          left = Math.round(rect.left);
        }
      }

      // Reset ink circles
      const circles = sheetEl.querySelectorAll<SVGCircleElement>('.ink-circle');
      circles.forEach((c) => c.setAttribute('r', '0'));

      // 1. Sheet clip-path animation
      sheetEl.animate(
        [
          { clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)` },
          { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
        ],
        {
          duration: reduced ? 1 : 1050,
          easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
          fill: 'forwards',
        }
      );

      // 2. Text lines reveal
      const textLines = sheetEl.querySelectorAll<HTMLElement>('.detail-mask-inner');
      textLines.forEach((line, i) => {
        line.animate(
          [
            { transform: 'translateY(110%)' },
            { transform: 'translateY(0%)' },
          ],
          {
            delay: reduced ? 0 : 620 + i * 75,
            duration: reduced ? 1 : 900,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'forwards',
          }
        );
      });

      // 3. Ink circles animation
      const delays = [0, 120, 220, 300, 360, 420, 180];
      circles.forEach((circle, i) => {
        circle.animate(
          [
            { r: '0' },
            { r: '720' },
          ],
          {
            delay: reduced ? 0 : 520 + delays[i],
            duration: reduced ? 1 : 1250,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
            fill: 'forwards',
          }
        );
      });
    }, 10);
  }

  closeDetail(): void {
    if (!this.detailOpen) return;
    const sheetEl = this.detailSheetRef?.nativeElement;
    const activeCover = this.getActiveCoverFace();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!sheetEl || reduced) {
      this.detailOpen = false;
      return;
    }

    let top = Math.round(window.innerHeight * 0.41 - this.H / 2);
    let bottom = Math.round(window.innerHeight - (window.innerHeight * 0.41 + this.H / 2));
    let left = Math.round(window.innerWidth / 2 - this.d / 2);
    let right = Math.round(window.innerWidth - (window.innerWidth / 2 + this.d / 2));

    if (activeCover) {
      const rect = activeCover.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) {
        top = Math.round(rect.top);
        right = Math.round(window.innerWidth - rect.right);
        bottom = Math.round(window.innerHeight - rect.bottom);
        left = Math.round(rect.left);
      }
    }

    const closeAnim = sheetEl.animate(
      [
        { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
        { clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)` },
      ],
      {
        duration: 850,
        easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
        fill: 'forwards',
      }
    );

    closeAnim.onfinish = () => {
      this.detailOpen = false;
    };
  }
}
