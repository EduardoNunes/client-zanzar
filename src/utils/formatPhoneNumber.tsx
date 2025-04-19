export default function formatPhoneNumber(newPhoneNumber: string) {
  let digitos = newPhoneNumber.replace(/\D/g, "");
  let formatted = "";

  if (digitos.length > 0) {
    formatted += `(${digitos.substring(0, 2)}`;

    if (digitos.length > 2) {
      formatted += `) ${digitos.substring(2, 3)}`;

      if (digitos.length > 3) {
        formatted += `${digitos.substring(3, 7)}`;

        if (digitos.length > 7) {
          formatted += `-${digitos.substring(7, 11)}`;
        }
      }
    }
  }

  return formatted;
}
