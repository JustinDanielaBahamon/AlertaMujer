// Builds initials from the full name (max 2 letters)
export function getInitials(name: string): string {
  if (!name.trim()) return "?";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
