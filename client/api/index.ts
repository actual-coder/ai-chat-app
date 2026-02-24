import { server } from "@/constants/server";
import axios from "axios";

export const api = axios.create({
  baseURL: `${server}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});
