import { ActivateData, VerifyData } from "$/shared/common";

export interface LicenseState {
  isValid: boolean;
  isPaid: boolean;
  licenseType: "online" | "offline";
  lastCheck: number;
  payload: VerifyData | ActivateData | LicensePayload;
}

export interface LicensePayload {
  sub: string;
  licenseId: string;
  deviceId: string;
  licenseType: "online" | "offline";
  orderId: string;
  validFrom: number;
  validUntil: number;
  exp: number;
}
