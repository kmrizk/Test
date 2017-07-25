import httpClient from 'axios';
import { getToken } from './auth';

httpClient.defaults.baseURL = '/api';

export const fetchShards = messageType => httpClient
  .get(
    `/${encodeURIComponent(messageType)}/shards`,
    { headers: { Authorization: getToken() } }
  )
  .then(({data}) => {
    const {shards} = data;
    return shards;
  });

export const fetchMessages = (messageType, shardId, amount) => httpClient
  .get(
    `/${encodeURIComponent(messageType)}/${encodeURIComponent(shardId)}/messages?amount=${amount}`,
    { headers: { Authorization: getToken() } }
  )
  .then(({data}) => {
    const {messages} = data;
    return messages;
  });