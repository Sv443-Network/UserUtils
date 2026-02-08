/**
 * @module lib/Dialog
 * This module contains the Dialog class, which allows you to quickly and easily create modal dialogs - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#dialog)
 */

import { NanoEmitter } from "@sv443-network/coreutils";
import { addGlobalStyle } from "./dom.js";

export const defaultDialogCss: string = `\
.uu-no-select {
  user-select: none;
}

.uu-dialog-bg {
  --uu-dialog-bg: #333333;
  --uu-dialog-bg-highlight: #252525;
  --uu-scroll-indicator-bg: rgba(10, 10, 10, 0.7);
  --uu-dialog-separator-color: #797979;
  --uu-dialog-border-radius: 10px;
}

.uu-dialog-bg {
  display: block;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 5;
  background-color: rgba(0, 0, 0, 0.6);
}

.uu-dialog {
  --uu-calc-dialog-height: calc(min(100vh - 40px, var(--uu-dialog-height-max)));
  position: absolute;
  display: flex;
  flex-direction: column;
  width: calc(min(100% - 60px, var(--uu-dialog-width-max)));
  border-radius: var(--uu-dialog-border-radius);
  height: auto;
  max-height: var(--uu-calc-dialog-height);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 6;
  color: #fff;
  background-color: var(--uu-dialog-bg);
}

.uu-dialog.align-top {
  top: 0;
  transform: translate(-50%, 40px);
}

.uu-dialog.align-bottom {
  top: 100%;
  transform: translate(-50%, -100%);
}

.uu-dialog-body {
  font-size: 1.5rem;
  padding: 20px;
}

.uu-dialog-body.small {
  padding: 15px;
}

#uu-dialog-opts {
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 30px 0px;
  overflow-y: auto;
}

.uu-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding: 15px 20px 15px 20px;
  background-color: var(--uu-dialog-bg);
  border: 2px solid var(--uu-dialog-separator-color);
  border-style: none none solid none !important;
  border-radius: var(--uu-dialog-border-radius) var(--uu-dialog-border-radius) 0px 0px;
}

.uu-dialog-header.small {
  padding: 10px 15px;
  border-style: none none solid none !important;
}

.uu-dialog-header-pad {
  content: " ";
  min-height: 32px;
}

.uu-dialog-header-pad.small {
  min-height: 24px;
}

.uu-dialog-titlecont {
  display: flex;
  align-items: center;
}

.uu-dialog-titlecont-no-title {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.uu-dialog-title {
  position: relative;
  display: inline-block;
  font-size: 22px;
}

.uu-dialog-close {
  cursor: pointer;
}

.uu-dialog-header-img,
.uu-dialog-close
{
  width: 32px;
  height: 32px;
}

.uu-dialog-header-img.small,
.uu-dialog-close.small
{
  width: 24px;
  height: 24px;
}

.uu-dialog-footer {
  font-size: 17px;
  text-decoration: underline;
}

.uu-dialog-footer.hidden {
  display: none;
}

.uu-dialog-footer-cont {
  margin-top: 6px;
  padding: 15px 20px;
  background: var(--uu-dialog-bg);
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, var(--uu-dialog-bg) 30%, var(--uu-dialog-bg) 100%);
  border: 2px solid var(--uu-dialog-separator-color);
  border-style: solid none none none !important;
  border-radius: 0px 0px var(--uu-dialog-border-radius) var(--uu-dialog-border-radius);
}

.uu-dialog-footer-buttons-cont button:not(:last-of-type) {
  margin-right: 15px;
}`;

/** ID of the last opened (top-most) dialog */
export let currentDialogId: string | null = null;
/** IDs of all currently open dialogs, top-most first */
export const openDialogs: string[] = [];

/** Default English strings used in the Dialog */
export const defaultStrings = {
  closeDialogTooltip: "Click to close the dialog",
};

/** Options passed to the Dialog constructor */
export interface DialogOptions {
  /** ID that gets added to child element IDs - has to be unique and conform to HTML ID naming rules! */
  id: string;
  /** Target and max width of the dialog in pixels */
  width: number;
  /** Target and max height of the dialog in pixels */
  height: number;
  /** Whether the dialog should close when the background is clicked - defaults to true */
  closeOnBgClick?: boolean;
  /** Whether the dialog should close when the escape key is pressed - defaults to true */
  closeOnEscPress?: boolean;
  /** Whether the dialog should be destroyed when it's closed - defaults to false */
  destroyOnClose?: boolean;
  /** Whether the dialog should be unmounted when it's closed - defaults to true - superseded by destroyOnClose */
  unmountOnClose?: boolean;
  /** Whether all listeners should be removed when the dialog is destroyed - defaults to true */
  removeListenersOnDestroy?: boolean;
  /** Whether the dialog should have a smaller overall appearance - defaults to false */
  small?: boolean;
  /** Where to align or anchor the dialog vertically - defaults to "center" */
  verticalAlign?: "top" | "center" | "bottom";
  /** Strings used in the dialog (used for translations) - defaults to the default English strings */
  strings?: Partial<typeof defaultStrings>;
  /** CSS to apply to the dialog - defaults to the {@linkcode defaultDialogCss} */
  dialogCss?: string;
  /** Called to render the body of the dialog */
  renderBody: () => HTMLElement | Promise<HTMLElement>;
  /** Called to render the header of the dialog - leave undefined for a blank header */
  renderHeader?: () => HTMLElement | Promise<HTMLElement>;
  /** Called to render the footer of the dialog - leave undefined for no footer */
  renderFooter?: () => HTMLElement | Promise<HTMLElement>;
  /** Called to render the close button of the dialog - leave undefined for no close button */
  renderCloseBtn?: () => HTMLElement | Promise<HTMLElement>;
}

/** Creates and manages a modal dialog element */
export class Dialog extends NanoEmitter<{
  /** Emitted just **after** the dialog is closed */
  close: () => void;
  /** Emitted just **after** the dialog is opened */
  open: () => void;
  /** Emitted just **after** the dialog contents are rendered */
  render: () => void;
  /** Emitted just **after** the dialog contents are cleared */
  clear: () => void;
  /** Emitted just **after** the dialog is destroyed and **before** all listeners are removed */
  destroy: () => void;
}> {
  /** Options passed to the dialog in the constructor */
  public readonly options: DialogOptions;
  /** ID that gets added to child element IDs - has to be unique and conform to HTML ID naming rules! */
  public readonly id: string;
  /** Strings used in the dialog (used for translations) */
  public strings: typeof defaultStrings;

  protected dialogOpen = false;
  protected dialogMounted = false;

  constructor(options: DialogOptions) {
    super();

    const { strings, ...opts } = options;

    this.strings = {
      ...defaultStrings,
      ...(strings ?? {}),
    };

    this.options = {
      closeOnBgClick: true,
      closeOnEscPress: true,
      destroyOnClose: false,
      unmountOnClose: true,
      removeListenersOnDestroy: true,
      small: false,
      verticalAlign: "center",
      ...opts,
    };
    this.id = opts.id;
  }

  //#region public

  /** Call after DOMContentLoaded to pre-render the dialog and invisibly mount it in the DOM */
  public async mount(): Promise<HTMLElement | void> {
    if(this.dialogMounted)
      return;
    this.dialogMounted = true;

    if(!document.querySelector("style.uu-dialog-css"))
      addGlobalStyle(this.options.dialogCss ?? defaultDialogCss).classList.add("uu-dialog-css");

    const bgElem = document.createElement("div");
    bgElem.id = `uu-${this.id}-dialog-bg`;
    bgElem.classList.add("uu-dialog-bg");
    if(this.options.closeOnBgClick)
      bgElem.ariaLabel = bgElem.title = this.getString("closeDialogTooltip");

    bgElem.style.setProperty("--uu-dialog-width-max", `${this.options.width}px`);
    bgElem.style.setProperty("--uu-dialog-height-max", `${this.options.height}px`);

    bgElem.style.visibility = "hidden";
    bgElem.style.display = "none";
    bgElem.inert = true;

    bgElem.appendChild(await this.getDialogContent());
    document.body.appendChild(bgElem);

    this.attachListeners(bgElem);

    this.events.emit("render");
    return bgElem;
  }

  /** Closes the dialog and clears all its contents (unmounts elements from the DOM) in preparation for a new rendering call */
  public unmount(): void {
    this.close();

    this.dialogMounted = false;

    const clearSelectors = [
      `#uu-${this.id}-dialog-bg`,
      `#uu-style-dialog-${this.id}`,
    ];

    for(const sel of clearSelectors)
      document.querySelector(sel)?.remove();

    this.events.emit("clear");
  }

  /** Clears the DOM of the dialog and then renders it again */
  public async remount(): Promise<void> {
    this.unmount();
    await this.mount();
  }

  /**
   * Opens the dialog - also mounts it if it hasn't been mounted yet  
   * Prevents default action and immediate propagation of the passed event
   */
  public async open(e?: MouseEvent | KeyboardEvent): Promise<HTMLElement | void> {
    e?.preventDefault();
    e?.stopImmediatePropagation();

    if(this.isOpen())
      return;
    this.dialogOpen = true;

    if(openDialogs.includes(this.id))
      throw new Error(`A dialog with the same ID of '${this.id}' already exists and is open!`);

    if(!this.isMounted())
      await this.mount();

    const dialogBg = document.querySelector<HTMLElement>(`#uu-${this.id}-dialog-bg`);

    if(!dialogBg)
      return console.warn(`Couldn't find background element for dialog with ID '${this.id}'`);

    dialogBg.style.visibility = "visible";
    dialogBg.style.display = "block";
    dialogBg.inert = false;

    currentDialogId = this.id;
    openDialogs.unshift(this.id);

    // make sure all other dialogs are inert
    for(const dialogId of openDialogs)
      if(dialogId !== this.id)
        document.querySelector(`#uu-${dialogId}-dialog-bg`)?.setAttribute("inert", "true");

    // make sure body is inert and scroll is locked
    document.body.classList.remove("uu-no-select");
    document.body.setAttribute("inert", "true");

    this.events.emit("open");

    return dialogBg;
  }

  /** Closes the dialog - prevents default action and immediate propagation of the passed event */
  public close(e?: MouseEvent | KeyboardEvent): void {
    e?.preventDefault();
    e?.stopImmediatePropagation();

    if(!this.isOpen())
      return;
    this.dialogOpen = false;

    const dialogBg = document.querySelector<HTMLElement>(`#uu-${this.id}-dialog-bg`);

    if(!dialogBg)
      return console.warn(`Couldn't find background element for dialog with ID '${this.id}'`);

    dialogBg.style.visibility = "hidden";
    dialogBg.style.display = "none";
    dialogBg.inert = true;

    openDialogs.splice(openDialogs.indexOf(this.id), 1);
    currentDialogId = openDialogs[0] ?? null;

    // make sure the new top-most dialog is not inert
    if(currentDialogId)
      document.querySelector(`#uu-${currentDialogId}-dialog-bg`)?.removeAttribute("inert");

    // remove the scroll lock and inert attribute on the body if no dialogs are open
    if(openDialogs.length === 0) {
      document.body.classList.add("uu-no-select");
      document.body.removeAttribute("inert");
    }

    this.events.emit("close");

    if(this.options.destroyOnClose)
      this.destroy();
    // don't destroy *and* unmount at the same time
    else if(this.options.unmountOnClose)
      this.unmount();
  }

  /** Returns true if the dialog is currently open */
  public isOpen(): boolean {
    return this.dialogOpen;
  }

  /** Returns true if the dialog is currently mounted */
  public isMounted(): boolean {
    return this.dialogMounted;
  }

  /** Clears the DOM of the dialog and removes all event listeners */
  public destroy(): void {
    this.unmount();
    this.events.emit("destroy");
    this.options.removeListenersOnDestroy && this.unsubscribeAll();
  }

  //#region static

  /** Returns the ID of the top-most dialog (the dialog that has been opened last) */
  public static getCurrentDialogId(): string | null {
    return currentDialogId;
  }

  /** Returns the IDs of all currently open dialogs, top-most first */
  public static getOpenDialogs(): string[] {
    return openDialogs;
  }

  //#region protected

  protected getString(key: keyof typeof defaultStrings): string {
    return this.strings[key] ?? defaultStrings[key];
  }

  /** Called once to attach all generic event listeners */
  protected attachListeners(bgElem: HTMLElement): void {
    if(this.options.closeOnBgClick) {
      bgElem.addEventListener("click", (e) => {
        if(this.isOpen() && (e.target as HTMLElement)?.id === `uu-${this.id}-dialog-bg`)
          this.close(e);
      });
    }

    if(this.options.closeOnEscPress) {
      document.body.addEventListener("keydown", (e) => {
        if(e.key === "Escape" && this.isOpen() && Dialog.getCurrentDialogId() === this.id)
          this.close(e);
      });
    }
  }

  //#region protected

  /**
   * Adds generic, accessible interaction listeners to the passed element.  
   * All listeners have the default behavior prevented and stop propagation (for keyboard events only as long as the captured key is valid).
   * @param listenerOptions Provide a {@linkcode listenerOptions} object to configure the listeners
   */
  protected onInteraction<
    TElem extends HTMLElement
  > (
    elem: TElem,
    listener: (evt: MouseEvent | KeyboardEvent) => void,
    listenerOptions?: AddEventListenerOptions & {
      preventDefault?: boolean;
      stopPropagation?: boolean;
    },
  ): void {
    const { preventDefault = true, stopPropagation = true, ...listenerOpts } = listenerOptions ?? {};

    const interactionKeys = ["Enter", " ", "Space"];

    const proxListener = (e: MouseEvent | KeyboardEvent): void => {
      if(e instanceof KeyboardEvent) {
        if(interactionKeys.includes(e.key)) {
          preventDefault && e.preventDefault();
          stopPropagation && e.stopPropagation();
        }
        else return;
      }
      else if(e instanceof MouseEvent) {
        preventDefault && e.preventDefault();
        stopPropagation && e.stopPropagation();
      }

      // clean up the other listener that isn't automatically removed if `once` is set
      listenerOpts?.once && e.type === "keydown" && elem.removeEventListener("click", proxListener, listenerOpts);
      listenerOpts?.once && e.type === "click" && elem.removeEventListener("keydown", proxListener, listenerOpts);
      listener(e);
    };
    elem.addEventListener("click", proxListener, listenerOpts);
    elem.addEventListener("keydown", proxListener, listenerOpts);
  }

  /** Returns the dialog content element and all its children */
  protected async getDialogContent(): Promise<HTMLElement> {
    const header = this.options.renderHeader?.();
    const footer = this.options.renderFooter?.();

    const dialogWrapperEl = document.createElement("div");
    dialogWrapperEl.id = `uu-${this.id}-dialog`;
    dialogWrapperEl.classList.add("uu-dialog");
    dialogWrapperEl.ariaLabel = dialogWrapperEl.title = "";
    dialogWrapperEl.role = "dialog";
    dialogWrapperEl.setAttribute("aria-labelledby", `uu-${this.id}-dialog-title`);
    dialogWrapperEl.setAttribute("aria-describedby", `uu-${this.id}-dialog-body`);

    if(this.options.verticalAlign !== "center")
      dialogWrapperEl.classList.add(`align-${this.options.verticalAlign}`);

    //#region header

    const headerWrapperEl = document.createElement("div");
    headerWrapperEl.classList.add("uu-dialog-header");
    this.options.small && headerWrapperEl.classList.add("small");

    if(header) {
      const headerTitleWrapperEl = document.createElement("div");
      headerTitleWrapperEl.id = `uu-${this.id}-dialog-title`;
      headerTitleWrapperEl.classList.add("uu-dialog-title-wrapper");
      headerTitleWrapperEl.role = "heading";
      headerTitleWrapperEl.ariaLevel = "1";

      headerTitleWrapperEl.appendChild(header instanceof Promise ? await header : header);
      headerWrapperEl.appendChild(headerTitleWrapperEl);
    }
    else {
      // insert element to pad the header height
      const padEl = document.createElement("div");
      padEl.classList.add("uu-dialog-header-pad", this.options.small ? "small" : "");
      headerWrapperEl.appendChild(padEl);
    }

    if(this.options.renderCloseBtn) {
      const closeBtnEl = await this.options.renderCloseBtn();
      closeBtnEl.classList.add("uu-dialog-close");
      this.options.small && closeBtnEl.classList.add("small");
      closeBtnEl.tabIndex = 0;
      if(closeBtnEl.hasAttribute("alt"))
        closeBtnEl.setAttribute("alt", this.getString("closeDialogTooltip"));
      closeBtnEl.title = closeBtnEl.ariaLabel = this.getString("closeDialogTooltip");
      this.onInteraction(closeBtnEl, () => this.close());
      headerWrapperEl.appendChild(closeBtnEl);
    }

    dialogWrapperEl.appendChild(headerWrapperEl);

    //#region body

    const dialogBodyElem = document.createElement("div");
    dialogBodyElem.id = `uu-${this.id}-dialog-body`;
    dialogBodyElem.classList.add("uu-dialog-body");
    this.options.small && dialogBodyElem.classList.add("small");

    const body = this.options.renderBody();

    dialogBodyElem.appendChild(body instanceof Promise ? await body : body);
    dialogWrapperEl.appendChild(dialogBodyElem);

    //#region footer

    if(footer) {
      const footerWrapper = document.createElement("div");
      footerWrapper.classList.add("uu-dialog-footer-cont");
      dialogWrapperEl.appendChild(footerWrapper);
      footerWrapper.appendChild(footer instanceof Promise ? await footer : footer);
    }

    return dialogWrapperEl;
  }
}
