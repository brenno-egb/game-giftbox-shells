export function hostOpenUrl(url: string) {
  window.parent?.postMessage(
    { type: "SMARTICO_GAMES_OPEN_URL", url },
    "*"
  );
}
