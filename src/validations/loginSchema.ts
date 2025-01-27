import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Por favor, insira um e-mail válido")
    .required("O e-mail é obrigatório"),
  password: yup
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .required("A senha é obrigatória"),
});