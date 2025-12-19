export function smarticoErrToMessage(err: any) {
  const code = Number(err?.err_code ?? err?.code ?? -1);

  // 0 = OK
  if (code === 0) return null;

  const map: Record<number, string> = {
    1: "Indisponível no momento.",
    2: "Você não tem tentativas disponíveis.",
    3: "Aguarde para jogar novamente.",
    4: "Saldo/pontos insuficientes.",
  };

  return map[code] ?? `Erro Smartico (${code})`;
}
