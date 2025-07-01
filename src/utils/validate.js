export function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return re.test(email);
}

export function validatePhone(phone) {
  return /^\d{9,11}$/.test(phone);
} 