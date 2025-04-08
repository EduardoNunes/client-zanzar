//http://localhost:3001
//https://server-zanzar.onrender.com

import axios from "axios";

export default axios.create({
  baseURL: "http://https://server-zanzar.onrender.com",
  timeout: 100000,
  headers: { "Content-Type": "application/json" },
});
