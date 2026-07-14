import { contact } from "./notify/contact";
import { error } from "./notify/error";
import { deploy } from "./notify/deploy";
import { feedback } from "./notify/feedback";
import { bug } from "./notify/bug";
import { send } from "./notify/send";

export * from "./types";
export * from "./core/validate";
export * from "./notify/contact";
export * from "./notify/error";
export * from "./notify/deploy";
export * from "./notify/feedback";
export * from "./notify/bug";
export * from "./notify/send";

export const formcord = {
    send,
    contact,
    error,
    deploy,
    feedback,
    bug,
};
