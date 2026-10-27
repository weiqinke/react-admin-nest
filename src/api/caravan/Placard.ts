import { emptyOk, removedApi } from "@/api/removed";

export const findLastTypePlacard = () => emptyOk([]);

export const getPlacardListByType = () => emptyOk([]);

export const getAllPlacard = () => emptyOk([]);

export const addPlacard = () => removedApi("公告");

export const broadcastPlacard = () => removedApi("公告");

export const readOnePlacard = () => removedApi("公告");

export const deleteOnePlacard = () => removedApi("公告");
