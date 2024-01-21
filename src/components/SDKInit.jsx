'use client';

import {useEffect, useState} from 'react';

export const MiroSDKInit = () => {
  useEffect(() => {
    miro.board.ui.on('icon:click', async () => {
      await miro.board.ui.openPanel({url: '/'});
    });
  });

  return null;
};
