import * as yup from "yup";

export const dataShopSchema = yup.object().shape({
  fullName: yup
    .string()
    .required("O nome completo é obrigatório.")
    .test(
      "fullName",
      "Insira seu nome completo.",
      (value) => value?.trim().split(" ").length >= 2
    ),
  birthDate: yup
    .date()
    .required("A data de nascimento é obrigatória.")
    .max(new Date(), "A data de nascimento não pode ser no futuro."),
  phoneNumber: yup
    .string()
    .required("O telefone é obrigatório.")
    .matches(
      /^\(\d{2}\) \d{4,5}-\d{4}$/,
      "Preencha o telefone para contato corretamente."
    ),
});