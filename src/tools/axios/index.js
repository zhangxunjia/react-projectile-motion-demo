import axios from 'axios';

export const get = (url, params, config = {}) => axios
    .get(url, {
        params,
        ...config
    })
    .then((res) => res.data);

export const getImage = (url) =>
    get(url, null, { responseType: 'blob' })
        .then((res) => window.URL.createObjectURL(new Blob([res])))