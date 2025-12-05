interface JwtPayload {
  [key: string]: any;
  iss?: string | undefined;
  sub?: string | undefined;
  aud?: string | string[] | undefined;
  exp?: number | undefined;
  nbf?: number | undefined;
  iat?: number | undefined;
  jti?: string | undefined;
}

export interface VerifyData extends JwtPayload {
  valid: boolean;
  licenseId: string;
  deviceId: string;
  licenseType: "online" | "offline";
  validFrom?: number;
  validUntil?: number;
  remainingDays?: number;
}
