import constant from 'src/constants';

export const pushNotification = async (message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  fetch(constant.pushNotificationURL.url, {
    method: 'post',
    headers: {
      Authorization: constant.pushNotificationURL.authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
    }),
  });
};
