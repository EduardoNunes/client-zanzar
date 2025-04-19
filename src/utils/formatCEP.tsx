export default function formatCep(cep: string) {
  let digitos = cep.replace(/\D/g, "");
  let formatted = "";

  if (digitos.length > 5) {
    formatted += `${digitos.substring(0, 5)}-${digitos.substring(5, 8)}`;
  } else {
    formatted = digitos;
  }

  return formatted;
}
