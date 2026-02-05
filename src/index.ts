import { contact } from "./notify/contact";
import { error } from "./notify/error";
import { deploy } from "./notify/deploy";
import { feedback } from "./notify/feedback";
import { bug } from "./notify/bug";

export * from "./types";
export * from "./notify/contact";
export * from "./notify/error";
export * from "./notify/deploy";
export * from "./notify/feedback";
export * from "./notify/bug";

export const formcord = {
    contact,
    error,
    deploy,
    feedback,
    bug,
};
