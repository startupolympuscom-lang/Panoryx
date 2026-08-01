import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { contactFormSchema } from "@/lib/validations/contact";
import { openShiftSchema, closeShiftSchema } from "@/lib/validations/panostation";

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({ email: "user@panoryx.com", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret123" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const base = {
    fullName: "Yassine El Amrani",
    companyName: "Station Services Atlas",
    email: "yassine@atlas-stations.ma",
    password: "motdepasse1",
    confirmPassword: "motdepasse1",
    consent: true,
  };

  it("accepts matching passwords with a letter and a digit", () => {
    expect(signupSchema.safeParse(base).success).toBe(true);
  });

  it("rejects mismatched password confirmation", () => {
    const result = signupSchema.safeParse({ ...base, confirmPassword: "different1" });
    expect(result.success).toBe(false);
  });

  it("rejects a password without a digit", () => {
    const result = signupSchema.safeParse({
      ...base,
      password: "onlyletters",
      confirmPassword: "onlyletters",
    });
    expect(result.success).toBe(false);
  });

  it("requires consent to be true", () => {
    const result = signupSchema.safeParse({ ...base, consent: false });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "abcdefg1",
      confirmPassword: "abcdefg2",
    });
    expect(result.success).toBe(false);
  });
});

describe("contactFormSchema", () => {
  it("requires consent and a message of at least 10 characters", () => {
    const result = contactFormSchema.safeParse({
      fullName: "Sara Idrissi",
      companyName: "Distribution Nord",
      professionalEmail: "sara@distribution-nord.ma",
      message: "Trop court",
      consent: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a complete, valid submission", () => {
    const result = contactFormSchema.safeParse({
      fullName: "Sara Idrissi",
      companyName: "Distribution Nord",
      professionalEmail: "sara@distribution-nord.ma",
      message: "Nous souhaitons en savoir plus sur PanoStation pour nos 5 stations.",
      consent: true,
    });
    expect(result.success).toBe(true);
  });
});

const STATION_ID = "11111111-1111-4111-8111-111111111111";
const NOZZLE_ID = "22222222-2222-4222-8222-222222222222";

describe("openShiftSchema", () => {
  it("requires at least one nozzle reading", () => {
    const result = openShiftSchema.safeParse({
      stationId: STATION_ID,
      readings: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a shift opening with readings", () => {
    const result = openShiftSchema.safeParse({
      stationId: STATION_ID,
      readings: [{ nozzleId: NOZZLE_ID, openingIndex: 128430 }],
    });
    expect(result.success).toBe(true);
  });
});

describe("closeShiftSchema", () => {
  it("requires at least one closing reading", () => {
    const result = closeShiftSchema.safeParse({
      shiftId: STATION_ID,
      readings: [],
    });
    expect(result.success).toBe(false);
  });
});
