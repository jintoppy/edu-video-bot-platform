'use server';

import { createStreamableUI } from "ai/rsc";

export const getUiStream = async () => {
    const uiStream = createStreamableUI();
    return uiStream;
}