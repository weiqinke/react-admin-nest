import { emptyOk, removedApi } from "@/api/removed";

export const articles = () => emptyOk([]);

export const findallarticle = () => emptyOk([]);

export const onearticlebody = () => emptyOk({});

export const onearticle = () => removedApi("文章");
