/**
 * Input filters and checks shared by the forms (sign-up, profile, contacts). The filters clean what is
 * typed (digits only, letters only); the checks decide whether a value can be saved.
 */

/** Keeps only digits, up to max. */
export const digitsOnly = (text: string, max = 10): string => text.replace(/\D/g, "").slice(0, max);

/** Letters (with accents), spaces, apostrophes and hyphens: names do not have digits or symbols. */
export const lettersOnly = (text: string, max = 80): string =>
  text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÑñ' -]/g, "").replace(/\s{2,}/g, " ").slice(0, max);

/** At least 3 letters in total (a full name can be one or more words). */
export const isValidName = (name: string): boolean => name.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÑñ]/g, "").length >= 3;

/** A Colombian cell phone: 10 digits starting with 3. */
export const isValidCellphone = (phone: string): boolean => /^3\d{9}$/.test(phone.replace(/\D/g, ""));

/** A Colombian phone for a contact: 10 digits (cell phone or landline with its 60X code). */
export const isValidPhone = (phone: string): boolean => /^\d{10}$/.test(phone.replace(/\D/g, ""));

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const isValidEmail = (email: string): boolean => {
  const clean = email.trim();
  return clean.length > 0 && clean.length <= 254 && EMAIL_REGEX.test(clean);
};

export type DocumentType = "C.C" | "T.I" | "Documento extranjero";

/** What can be typed in the document number: digits for C.C and T.I; letters and digits for a foreign one. */
export const documentFilter = (type: string, text: string): string =>
  type === "Documento extranjero"
    ? text.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 15)
    : text.replace(/\D/g, "").slice(0, 10);

/** C.C and T.I: 6 to 10 digits. Foreign document: 5 to 15 letters or digits. */
export const isValidDocument = (type: string, number: string): boolean =>
  type === "Documento extranjero" ? /^[A-Z0-9]{5,15}$/i.test(number) : /^\d{6,10}$/.test(number);

/** Same limits as the server (identity Account): 8 to 100 characters. */
export const isValidPassword = (password: string): boolean => password.length >= 8 && password.length <= 100;
