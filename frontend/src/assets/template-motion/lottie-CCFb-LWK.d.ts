export function t(): {
  loadAnimation(options: {
    container: HTMLElement;
    renderer: 'svg';
    loop: boolean;
    autoplay: boolean;
    animationData: Record<string, unknown>;
    rendererSettings: { preserveAspectRatio: string; progressiveLoad: boolean };
  }): {
    addEventListener: (name: 'DOMLoaded', listener: () => void) => void;
    destroy: () => void;
    goToAndStop: (frame: number, isFrame?: boolean) => void;
  };
};
