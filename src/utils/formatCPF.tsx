export default function formatCPF(cpf: string) {
  let digitos = cpf.replace(/\D/g, "");
  let formatted = "";

  if (digitos.length > 9) {
    formatted = `${digitos.substring(0, 3)}.${digitos.substring(
      3,
      6
    )}.${digitos.substring(6, 9)}-${digitos.substring(9, 11)}`;
  } else if (digitos.length > 6) {
    formatted = `${digitos.substring(0, 3)}.${digitos.substring(
      3,
      6
    )}.${digitos.substring(6)}`;
  } else if (digitos.length > 3) {
    formatted = `${digitos.substring(0, 3)}.${digitos.substring(3)}`;
  } else {
    formatted = digitos;
  }

  return formatted;
}
