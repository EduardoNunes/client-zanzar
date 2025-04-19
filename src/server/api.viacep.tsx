import axios from "axios";

async function viaCep(cep: string) {
  const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

  return {
    neighborhood: data.bairro,
    cep: data.cep,
    ddd: data.ddd,
    locality: data.localidade,
    publicPlace: data.logradouro,
    uf: data.uf,
  };
}

export default viaCep;
