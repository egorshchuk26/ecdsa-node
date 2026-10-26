import axios from "axios";

const server = axios.create({
  baseURL: "http://127.0.0.1:3042",
});

export default server;
