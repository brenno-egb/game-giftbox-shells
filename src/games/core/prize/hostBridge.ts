export type RedirectMode = "assign" | "replace";

function postToHost(t: string, p?: unknown) {
  window.parent?.postMessage({ t, p }, "*");
}

export const HostBridge = {
  redirect(url: string, mode: RedirectMode = "assign") {
    postToHost("SG:REDIRECT", { url, mode });
  },

  hideOverlay() {
    postToHost("SG:HIDE_OVERLAY");
  },
};
