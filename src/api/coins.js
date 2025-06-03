// src/api/coins.js
import axios from 'axios';

const COINRANKING_API_URL = 'https://api.coinranking.com/v2/coins?limit=100';
const API_KEY = 'coinranking0032526aa0947040d370c5a15d66f8898f64707cb718e699'; // Замените на свой API-ключ

export const fetchCoins = async () => {
  try {
    const response = await axios.get(COINRANKING_API_URL, {
      headers: {
        'x-access-token': API_KEY, // Добавляем API-ключ в заголовки запроса
      },
    });
    return response.data.data.coins; // Возвращаем список криптовалют
  } catch (error) {
    console.error('Error fetching coins:', error);
    return [];
  }
};
