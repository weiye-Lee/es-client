export interface ActivateData {
  token: string;
  licenseType: "online" | "offline";
  validFrom: number;
  validUntil: number;
  durationDays: number;
  isNewActivation: boolean;
}
