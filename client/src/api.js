import axios from 'axios';

export const api = axios.create({
  baseURL: '/api'
});

// helpers
export const generateOTP = () => String(Math.floor(1000 + Math.random()*9000));
export const nowISO = () => new Date().toISOString();