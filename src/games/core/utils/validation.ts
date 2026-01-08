export type GameParams = {
  uid: string;
  lang: string;
  skinId?: string;
};

export type ValidationResult = 
  | { valid: true; params: GameParams }
  | { valid: false; error: string };

export function validateGameParams(
  searchParams: Record<string, string | string[] | undefined>
): ValidationResult {
  const uid = getParam(searchParams.uid);
  const lang = getParam(searchParams.lang);
  const skinId = getParam(searchParams.skin);

  if (!uid || !lang) {
    return {
      valid: false,
      error: "MUID/MLANG",
    };
  }

  return {
    valid: true,
    params: {
      uid,
      lang,
      skinId: skinId || undefined,
    },
  };
}

export function validateGameParamsFromURL(
  searchParams: URLSearchParams
): ValidationResult {
  const uid = searchParams.get("uid");
  const lang = searchParams.get("lang");
  const skinId = searchParams.get("skin");

  if (!uid || !lang) {
    return {
      valid: false,
      error: "MUID/MLANG",
    };
  }

  return {
    valid: true,
    params: {
      uid,
      lang,
      skinId: skinId || undefined,
    },
  };
}

function getParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}